-- Acesso administrativo para rafaelmgreco@hotmail.com.
-- Rode este arquivo no SQL Editor do projeto Supabase existente.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Admin can read all profiles" on public.profiles;
create policy "Admin can read all profiles" on public.profiles for select to authenticated
  using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rafaelmgreco@hotmail.com');
drop policy if exists "Users can update own display name" on public.profiles;
create policy "Users can update own display name" on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function private.sync_auth_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, email, display_name, created_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', ''), new.created_at)
  on conflict (user_id) do update set email = excluded.email, display_name = excluded.display_name;
  return new;
end;
$$;
revoke all on function private.sync_auth_profile() from public, anon, authenticated;
drop trigger if exists sync_auth_profile on auth.users;
create trigger sync_auth_profile after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.sync_auth_profile();
insert into public.profiles (user_id, email, display_name, created_at)
select id, email, coalesce(raw_user_meta_data ->> 'display_name', ''), created_at from auth.users
on conflict (user_id) do update set email = excluded.email;

grant update (total_pages), delete on public.books to authenticated;
drop policy if exists "Admin can correct book page counts" on public.books;
create policy "Admin can correct book page counts" on public.books for update to authenticated
  using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rafaelmgreco@hotmail.com')
  with check (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rafaelmgreco@hotmail.com');
drop policy if exists "Admin can remove books" on public.books;
create policy "Admin can remove books" on public.books for delete to authenticated
  using (lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rafaelmgreco@hotmail.com');

-- Ajusta os progressos que ultrapassarem o novo limite de páginas.
create or replace function private.clamp_progress_to_book_pages()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.total_pages is distinct from old.total_pages then
    update public.reading_progress set current_page = least(current_page, new.total_pages), updated_at = now()
    where book_id = new.id and current_page > new.total_pages;
  end if;
  return new;
end;
$$;
revoke all on function private.clamp_progress_to_book_pages() from public, anon, authenticated;
drop trigger if exists clamp_progress_to_book_pages on public.books;
create trigger clamp_progress_to_book_pages after update of total_pages on public.books
for each row execute function private.clamp_progress_to_book_pages();
