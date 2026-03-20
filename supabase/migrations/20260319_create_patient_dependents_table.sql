-- Create patient_dependents table for managing family members / dependents
create table if not exists patient_dependents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  rut text not null,
  relationship text not null,
  dob date,
  document_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by patient
create index if not exists patient_dependents_patient_id_idx on patient_dependents(patient_id);

-- RLS
alter table patient_dependents enable row level security;

-- Patients can only see and manage their own dependents
create policy "patient_dependents_select_own"
  on patient_dependents for select
  using (patient_id = auth.uid());

create policy "patient_dependents_insert_own"
  on patient_dependents for insert
  with check (patient_id = auth.uid());

create policy "patient_dependents_delete_own"
  on patient_dependents for delete
  using (patient_id = auth.uid());

-- Admins can see all
create policy "patient_dependents_admin_select"
  on patient_dependents for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
