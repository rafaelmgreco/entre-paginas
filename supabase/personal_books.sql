-- Coleção privada: cada conta só consegue ver e alterar os próprios livros.
-- Execute no SQL Editor do Supabase depois do schema do catálogo.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.personal_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  author text not null check (char_length(author) between 1 and 120),
  total_pages integer not null check (total_pages > 0),
  current_page integer not null default 0 check (current_page >= 0 and current_page <= total_pages),
  cover_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists personal_books_user_updated_idx on public.personal_books (user_id, updated_at desc);

alter table public.personal_books enable row level security;
revoke all on public.personal_books from anon, authenticated;
grant select, insert, update, delete on public.personal_books to authenticated;

drop policy if exists "Users can read their personal books" on public.personal_books;
create policy "Users can read their personal books" on public.personal_books
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can add their personal books" on public.personal_books;
create policy "Users can add their personal books" on public.personal_books
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their personal books" on public.personal_books;
create policy "Users can update their personal books" on public.personal_books
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their personal books" on public.personal_books;
create policy "Users can delete their personal books" on public.personal_books
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function private.touch_personal_book_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_personal_book_updated_at() from public, anon, authenticated;
drop trigger if exists touch_personal_book_updated_at on public.personal_books;
create trigger touch_personal_book_updated_at before update on public.personal_books
for each row execute function private.touch_personal_book_updated_at();

-- Permit an uploader to clean up only files that no shared or personal book uses.
-- Admin deletion of shared covers remains governed by the existing admin policy.
drop policy if exists "Uploader can delete unattached book covers" on storage.objects;
create policy "Uploader can delete unattached book covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'book-covers'
  and owner_id = (select auth.uid()::text)
  and not exists (select 1 from public.books as book where book.cover_path = storage.objects.name)
  and not exists (select 1 from public.personal_books as book where book.cover_path = storage.objects.name)
);
