-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 04 — Storage (buckets + políticas)
--  Ejecutar después de 03_functions.sql
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('avatars',          'avatars',          true),
  ('documents',        'documents',        false),
  ('messages',         'messages',         false),
  ('credentials',      'credentials',      false),
  ('verification',     'verification',     false),
  ('imaging-studies',  'imaging-studies',  false),
  ('dicom-files',      'dicom-files',      false)
on conflict (id) do nothing;


-- ============================================================================
--  AVATARS · público para lectura, escritura autenticada
-- ============================================================================
drop policy if exists "avatars_read_public"   on storage.objects;
drop policy if exists "avatars_insert_self"   on storage.objects;
drop policy if exists "avatars_update_self"   on storage.objects;
drop policy if exists "avatars_delete_self"   on storage.objects;

create policy "avatars_read_public" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_self" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_self" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_self" on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================================
--  DOCUMENTS · privado, solo dueño y profesional involucrado
--  Carpeta: <patient_id>/...
-- ============================================================================
drop policy if exists "docs_read_access"   on storage.objects;
drop policy if exists "docs_write_auth"    on storage.objects;
drop policy if exists "docs_update_owner"  on storage.objects;
drop policy if exists "docs_delete_owner"  on storage.objects;

create policy "docs_read_access" on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.documents d
        where d.file_url like '%' || storage.objects.name
          and (
            (d.access_level = 'patient_and_professional' and (auth.uid() = d.patient_id or auth.uid() = d.professional_id))
            or (d.access_level = 'patient_only'          and auth.uid() = d.patient_id)
            or (d.access_level = 'professional_only'     and auth.uid() = d.professional_id)
          )
      )
    )
  );

create policy "docs_write_auth" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.role() = 'authenticated'
  );

create policy "docs_update_owner" on storage.objects for update
  using (
    bucket_id = 'documents'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "docs_delete_owner" on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (owner = auth.uid() or public.is_admin())
  );


-- ============================================================================
--  MESSAGES · archivos de chat · solo participantes
--  Carpeta: <conversation_id>/...
-- ============================================================================
drop policy if exists "msg_read_parts"  on storage.objects;
drop policy if exists "msg_write_parts" on storage.objects;

create policy "msg_read_parts" on storage.objects for select
  using (
    bucket_id = 'messages'
    and (
      public.is_admin()
      or exists (
        select 1 from public.conversations c
        where c.id::text = (storage.foldername(name))[1]
          and (c.initiated_by = auth.uid() or c.professional_id = auth.uid())
      )
    )
  );

create policy "msg_write_parts" on storage.objects for insert
  with check (
    bucket_id = 'messages'
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.initiated_by = auth.uid() or c.professional_id = auth.uid())
    )
  );


-- ============================================================================
--  CREDENTIALS / VERIFICATION · solo dueño y admin
--  Carpeta: <professional_id>/...
-- ============================================================================
drop policy if exists "cred_read_self"  on storage.objects;
drop policy if exists "cred_write_self" on storage.objects;

create policy "cred_read_self" on storage.objects for select
  using (
    bucket_id in ('credentials','verification')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "cred_write_self" on storage.objects for insert
  with check (
    bucket_id in ('credentials','verification')
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================================
--  IMAGING / DICOM · pacientes y profesionales involucrados
-- ============================================================================
drop policy if exists "img_read_involved"  on storage.objects;
drop policy if exists "img_write_pro"      on storage.objects;

create policy "img_read_involved" on storage.objects for select
  using (
    bucket_id in ('imaging-studies','dicom-files')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
      or public.is_professional()
    )
  );

create policy "img_write_pro" on storage.objects for insert
  with check (
    bucket_id in ('imaging-studies','dicom-files')
    and public.is_professional()
  );

commit;
