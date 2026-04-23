-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 03 — Funciones y triggers
--  Ejecutar después de 02_rls.sql
-- ============================================================================

begin;

-- ============================================================================
--  Auto-crear perfil al registrarse (auth.users → profiles)
--  Evita "no profile" tras sign-up. Usa metadata para role si viene.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role text;
  v_first text;
  v_last  text;
begin
  v_role  := coalesce(new.raw_user_meta_data->>'role',  'patient');
  v_first := coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.email,''), '@', 1));
  v_last  := coalesce(new.raw_user_meta_data->>'last_name',  '');

  insert into public.profiles (id, role, first_name, last_name, email, email_verified, language, country, city, region)
  values (
    new.id,
    case when v_role in ('patient','professional','admin') then v_role else 'patient' end,
    v_first,
    v_last,
    new.email::citext,
    coalesce(new.email_confirmed_at is not null, false),
    'es',
    'CL',
    'Temuco',
    'Araucanía'
  )
  on conflict (id) do nothing;

  -- Si es profesional, crea fila vacía en professionals para que los onboardings no fallen
  if v_role = 'professional' then
    insert into public.professionals (id) values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
--  Sincronizar email desde auth.users → profiles.email
-- ============================================================================
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.profiles
     set email = new.email::citext,
         email_verified = (new.email_confirmed_at is not null),
         updated_at = now()
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, email_confirmed_at on auth.users
  for each row execute function public.sync_profile_email();


-- ============================================================================
--  Recalcular rating del profesional al insertar/actualizar/borrar reviews
-- ============================================================================
create or replace function public.recalc_professional_rating()
returns trigger
language plpgsql
as $$
declare
  v_pro uuid := coalesce(new.professional_id, old.professional_id);
  v_avg numeric(3,2);
  v_cnt int;
begin
  select coalesce(round(avg(rating)::numeric, 2), 0),
         count(*)
    into v_avg, v_cnt
    from public.reviews
   where professional_id = v_pro;

  update public.professionals
     set rating         = v_avg,
         average_rating = v_avg,
         review_count   = v_cnt,
         updated_at     = now()
   where id = v_pro;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_recalc on public.reviews;
create trigger trg_reviews_recalc
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_professional_rating();


-- ============================================================================
--  Avanzar conversation.last_message_at cuando llega un mensaje nuevo
-- ============================================================================
create or replace function public.bump_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
     set last_message_at = now(),
         updated_at      = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_chat_messages_bump on public.chat_messages;
create trigger trg_chat_messages_bump
  after insert on public.chat_messages
  for each row execute function public.bump_conversation_last_message();


-- ============================================================================
--  Crear notificación cuando se crea un ticket de soporte
-- ============================================================================
create or replace function public.notify_admin_on_ticket()
returns trigger
language plpgsql
as $$
begin
  insert into public.admin_notifications (type, message, data)
  values (
    'SUPPORT_TICKET',
    format('Nuevo ticket · %s', new.subject),
    jsonb_build_object('ticket_id', new.id, 'user_id', new.user_id, 'priority', new.priority)
  );
  return new;
end;
$$;

drop trigger if exists trg_ticket_admin_notif on public.support_tickets;
create trigger trg_ticket_admin_notif
  after insert on public.support_tickets
  for each row execute function public.notify_admin_on_ticket();


-- ============================================================================
--  Completar cita + marcar pago liberado (para flujos escrow)
-- ============================================================================
create or replace function public.complete_appointment_and_release_funds(p_appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_allowed boolean;
begin
  select (a.professional_id = v_actor) or public.is_admin()
    into v_allowed
    from public.appointments a
   where a.id = p_appointment_id;

  if coalesce(v_allowed, false) = false then
    raise exception 'No autorizado para completar esta cita';
  end if;

  update public.appointments
     set status = 'completed',
         updated_at = now()
   where id = p_appointment_id;

  update public.payments
     set status = 'paid',
         updated_at = now()
   where appointment_id = p_appointment_id
     and status in ('held_escrow', 'processing');
end;
$$;

grant execute on function public.complete_appointment_and_release_funds(uuid) to authenticated;


-- ============================================================================
--  Búsqueda de profesionales por texto (unaccent + trigram)
-- ============================================================================
create or replace function public.search_professionals(q text, lim int default 24)
returns table (
  id uuid,
  slug text,
  first_name text,
  last_name text,
  avatar_url text,
  specialty text,
  city text,
  rating numeric,
  review_count int,
  verified boolean
)
language sql
stable
set search_path = public
as $$
  select pr.id,
         pr.slug,
         p.first_name,
         p.last_name,
         p.avatar_url,
         s.name_es as specialty,
         pr.city,
         pr.rating,
         pr.review_count,
         pr.verified
    from public.professionals pr
    join public.profiles p on p.id = pr.id
    left join public.specialties s on s.id = pr.specialty_id
   where p.role = 'professional'
     and (
       q is null or q = '' or
       unaccent(lower(p.first_name || ' ' || p.last_name || ' ' || coalesce(s.name_es,'') || ' ' || coalesce(pr.city,'')))
       ilike '%' || unaccent(lower(q)) || '%'
     )
   order by pr.verified desc, pr.rating desc nulls last, pr.review_count desc
   limit greatest(lim, 1);
$$;

grant execute on function public.search_professionals(text, int) to anon, authenticated;


-- ============================================================================
--  Protección: no permitir cambios manuales a subscription_status si no es admin
-- ============================================================================
create or replace function public.protect_subscription_fields()
returns trigger
language plpgsql
as $$
begin
  if (
    coalesce(new.subscription_status, '') is distinct from coalesce(old.subscription_status, '')
    or coalesce(new.stripe_customer_id, '') is distinct from coalesce(old.stripe_customer_id, '')
    or coalesce(new.stripe_subscription_id, '') is distinct from coalesce(old.stripe_subscription_id, '')
    or coalesce(new.trial_end_date::text, '') is distinct from coalesce(old.trial_end_date::text, '')
  ) and not public.is_admin() then
    raise exception 'No autorizado para modificar campos de suscripción';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_subscription on public.profiles;
create trigger trg_protect_subscription
  before update on public.profiles
  for each row execute function public.protect_subscription_fields();

commit;
