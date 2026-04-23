-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 06 — Onboarding profesional, waitlist, blog,
--  launch countdown.  Idempotente, corre después de 05_seeds.sql.
-- ============================================================================

begin;

-- ============================================================================
--  PROFESSIONALS · campos adicionales para wizard de onboarding
-- ============================================================================
alter table public.professionals
  add column if not exists consultation_duration_minutes int default 50
    check (consultation_duration_minutes between 15 and 240),
  add column if not exists graduation_year int
    check (graduation_year is null or (graduation_year between 1950 and extract(year from now())::int)),
  add column if not exists license_document_url text;

-- ============================================================================
--  PROFESSIONAL_AVAILABILITY · horarios semanales por profesional
--  day_of_week: 0 = domingo, 1 = lunes, … , 6 = sábado
-- ============================================================================
create table if not exists public.professional_availability (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  day_of_week     int  not null check (day_of_week between 0 and 6),
  start_time      time not null,
  end_time        time not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_time > start_time),
  unique (professional_id, day_of_week, start_time, end_time)
);

create index if not exists idx_availability_pro  on public.professional_availability(professional_id);
create index if not exists idx_availability_day  on public.professional_availability(day_of_week);

drop trigger if exists trg_availability_updated_at on public.professional_availability;
create trigger trg_availability_updated_at
  before update on public.professional_availability
  for each row execute function public.tg_set_updated_at();

alter table public.professional_availability enable row level security;

drop policy if exists "availability_read_public" on public.professional_availability;
create policy "availability_read_public" on public.professional_availability
  for select using (true);

drop policy if exists "availability_write_self" on public.professional_availability;
create policy "availability_write_self" on public.professional_availability
  for all
  using (professional_id = auth.uid() or public.is_admin())
  with check (professional_id = auth.uid() or public.is_admin());


-- ============================================================================
--  WAITLIST · Ampliar con nombre + rol deseado
-- ============================================================================
alter table public.waitlist
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists user_role  text
    check (user_role is null or user_role in ('patient','professional','curious','admin')),
  add column if not exists notified   boolean not null default false,
  add column if not exists notified_at timestamptz;

-- Habilitar inserción pública (cualquiera puede apuntarse) + lectura solo admin
alter table public.waitlist enable row level security;

drop policy if exists "waitlist_insert_public" on public.waitlist;
create policy "waitlist_insert_public" on public.waitlist
  for insert
  with check (true);

drop policy if exists "waitlist_read_admin" on public.waitlist;
create policy "waitlist_read_admin" on public.waitlist
  for select using (public.is_admin());

drop policy if exists "waitlist_update_admin" on public.waitlist;
create policy "waitlist_update_admin" on public.waitlist
  for update using (public.is_admin());


-- ============================================================================
--  BLOG_CATEGORIES
-- ============================================================================
create table if not exists public.blog_categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_es         text not null,
  name_en         text,
  description     text,
  color           text,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.blog_categories enable row level security;

drop policy if exists "blog_cat_read_public" on public.blog_categories;
create policy "blog_cat_read_public" on public.blog_categories
  for select using (is_active = true or public.is_admin());

drop policy if exists "blog_cat_write_admin" on public.blog_categories;
create policy "blog_cat_write_admin" on public.blog_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Seeds iniciales (idempotentes)
insert into public.blog_categories (slug, name_es, name_en, description, color, sort_order) values
  ('salud',       'Salud',        'Health',     'Artículos clínicos y de bienestar',        'oklch(0.58 0.07 170)', 10),
  ('tecnologia',  'Tecnología',   'Technology', 'Novedades de la plataforma y producto',    'oklch(0.4 0.1 230)',   20),
  ('comunidad',   'Comunidad',    'Community',  'Historias de pacientes y profesionales',   'oklch(0.68 0.11 45)',  30),
  ('guias',       'Guías',        'Guides',     'Cómo usar Nurea paso a paso',              'oklch(0.55 0.1 70)',   40)
on conflict (slug) do update
  set name_es = excluded.name_es,
      name_en = excluded.name_en,
      description = excluded.description,
      color = excluded.color,
      sort_order = excluded.sort_order;


-- ============================================================================
--  BLOG_POSTS · Admin escribe; público lee solo published
-- ============================================================================
create table if not exists public.blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  content_md    text,
  content_html  text,
  cover_url     text,
  category_id   uuid references public.blog_categories(id) on delete set null,
  tags          text[] default array[]::text[],
  author_id     uuid references public.profiles(id) on delete set null,
  status        text not null default 'draft'
                check (status in ('draft','published','archived')),
  featured      boolean not null default false,
  reading_minutes int,
  seo_title     text,
  seo_description text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_blog_posts_slug       on public.blog_posts(slug);
create index if not exists idx_blog_posts_status     on public.blog_posts(status);
create index if not exists idx_blog_posts_published  on public.blog_posts(status, published_at desc);
create index if not exists idx_blog_posts_featured   on public.blog_posts(featured) where featured = true;
create index if not exists idx_blog_posts_category   on public.blog_posts(category_id);
create index if not exists idx_blog_posts_tags       on public.blog_posts using gin (tags);
create index if not exists idx_blog_posts_trgm       on public.blog_posts using gin ((title || ' ' || coalesce(excerpt,'')) gin_trgm_ops);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.tg_set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_read_public" on public.blog_posts;
create policy "blog_posts_read_public" on public.blog_posts
  for select
  using (status = 'published' or public.is_admin() or author_id = auth.uid());

drop policy if exists "blog_posts_insert_admin" on public.blog_posts;
create policy "blog_posts_insert_admin" on public.blog_posts
  for insert with check (public.is_admin());

drop policy if exists "blog_posts_update_admin" on public.blog_posts;
create policy "blog_posts_update_admin" on public.blog_posts
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_posts_delete_admin" on public.blog_posts;
create policy "blog_posts_delete_admin" on public.blog_posts
  for delete using (public.is_admin());


-- ============================================================================
--  RPC: publicar/despublicar un post (fija published_at automáticamente)
-- ============================================================================
create or replace function public.publish_blog_post(p_id uuid, p_status text)
returns public.blog_posts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.blog_posts;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  if p_status not in ('draft','published','archived') then
    raise exception 'Estado inválido: %', p_status;
  end if;

  update public.blog_posts
     set status       = p_status,
         published_at = case
                          when p_status = 'published' and published_at is null then now()
                          else published_at
                        end,
         updated_at   = now()
   where id = p_id
   returning * into v_post;

  return v_post;
end;
$$;

grant execute on function public.publish_blog_post(uuid, text) to authenticated;


-- ============================================================================
--  STORAGE: bucket 'blog' público (covers, imágenes inline)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('blog','blog', true)
on conflict (id) do nothing;

drop policy if exists "blog_read_public"   on storage.objects;
drop policy if exists "blog_write_admin"   on storage.objects;
drop policy if exists "blog_update_admin"  on storage.objects;
drop policy if exists "blog_delete_admin"  on storage.objects;

create policy "blog_read_public" on storage.objects
  for select using (bucket_id = 'blog');

create policy "blog_write_admin" on storage.objects
  for insert with check (bucket_id = 'blog' and public.is_admin());

create policy "blog_update_admin" on storage.objects
  for update using (bucket_id = 'blog' and public.is_admin());

create policy "blog_delete_admin" on storage.objects
  for delete using (bucket_id = 'blog' and public.is_admin());


-- ============================================================================
--  PLATFORM_SETTINGS · agregar launch_date + launch_enabled
-- ============================================================================
insert into public.platform_settings (key, value, description) values
  ('launch_date',
   to_jsonb((now() + interval '60 days')::timestamptz)::jsonb,
   'Fecha de lanzamiento público (ISO 8601). Controla la cuenta regresiva.'),
  ('launch_enabled',
   to_jsonb(false),
   'Si es true, la app está totalmente abierta. Si es false, muestra pre-launch + waitlist.'),
  ('waitlist_open',
   to_jsonb(true),
   'Permite aceptar registros en waitlist.')
on conflict (key) do update
  set description = excluded.description,
      updated_at  = now();


-- ============================================================================
--  PROFILES · notification_preferences + privacy_preferences (jsonb libre)
-- ============================================================================
alter table public.profiles
  add column if not exists notification_preferences jsonb
    not null default jsonb_build_object(
      'email_notifications', true,
      'push_notifications',  true,
      'appointment_reminders', true,
      'marketing_emails', false,
      'forum_replies', true,
      'new_messages', true
    ),
  add column if not exists privacy_preferences jsonb
    not null default jsonb_build_object(
      'show_online_status', true,
      'profile_public',     true,
      'allow_direct_messages', true
    );


commit;
