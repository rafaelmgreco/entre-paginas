-- Preferência individual de cor das barras de progresso.
-- Execute no SQL Editor do projeto Supabase existente.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.reader_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress_color text not null default 'rgb(117, 148, 123)',
  constraint reader_preferences_progress_color_rgb_check check (
    progress_color ~ '^rgb\((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]), (25[0-5]|2[0-4][0-9]|1[0-2][0-9]|1[0-9]{2}|[1-9]?[0-9]), (25[0-5]|2[0-4][0-9]|1[0-2][0-9]|1[0-9]{2}|[1-9]?[0-9])\)$'
  )
);
alter table public.reader_preferences enable row level security;
revoke all on public.reader_preferences from anon, authenticated;
grant select on public.reader_preferences to authenticated;
grant update (progress_color) on public.reader_preferences to authenticated;

drop policy if exists "Signed in users can read reader colors" on public.reader_preferences;
create policy "Signed in users can read reader colors" on public.reader_preferences
  for select to authenticated using (true);
drop policy if exists "Users can update their own reader color" on public.reader_preferences;
create policy "Users can update their own reader color" on public.reader_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function private.create_reader_preference()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.reader_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_reader_preference() from public, anon, authenticated;
drop trigger if exists create_reader_preference on auth.users;
create trigger create_reader_preference after insert on auth.users
for each row execute function private.create_reader_preference();

insert into public.reader_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;
