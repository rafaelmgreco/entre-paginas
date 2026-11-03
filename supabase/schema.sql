-- Catálogo compartilhado e progresso individual por conta.
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  author text not null check (char_length(author) between 1 and 120),
  total_pages integer not null check (total_pages > 0),
  cover_path text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists books_title_normalized_unique on public.books (lower(trim(title)));

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reader_name text not null check (char_length(reader_name) between 1 and 120),
  current_page integer not null default 0 check (current_page >= 0),
  updated_at timestamptz not null default now(),
  unique (book_id, user_id)
);

alter table public.books enable row level security;
alter table public.reading_progress enable row level security;

drop policy if exists "Signed in users can read the shared book catalog" on public.books;
create policy "Signed in users can read the shared book catalog" on public.books
  for select to authenticated using (true);
drop policy if exists "Signed in users can add to the shared catalog" on public.books;
create policy "Signed in users can add to the shared catalog" on public.books
  for insert to authenticated with check ((select auth.uid()) = created_by);

drop policy if exists "Signed in users can read group progress" on public.reading_progress;
create policy "Signed in users can read group progress" on public.reading_progress
  for select to authenticated using (true);
drop policy if exists "Users can add their own progress" on public.reading_progress;
create policy "Users can add their own progress" on public.reading_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own progress" on public.reading_progress;
create policy "Users can update their own progress" on public.reading_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Explicit grants are required for newly created tables on recent Supabase projects.
grant select, insert on public.books to authenticated;
grant select, insert, update on public.reading_progress to authenticated;

create or replace function public.enforce_reading_progress_page_limit()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare page_limit integer;
begin
  select total_pages into page_limit from public.books where id = new.book_id;
  if page_limit is null or new.current_page > page_limit then
    raise exception 'current_page must be between 0 and the book page count';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists reading_progress_page_limit on public.reading_progress;
create trigger reading_progress_page_limit before insert or update on public.reading_progress
for each row execute function public.enforce_reading_progress_page_limit();
revoke all on function public.enforce_reading_progress_page_limit() from public, anon, authenticated;

insert into public.books (title, author, total_pages, cover_path) values
  ('Alchemised', 'SenLinYu', 960, '/covers/alchemised.jpg'),
  ('Caminho dos Reis', 'Brandon Sanderson', 1240, '/covers/caminho-dos-reis.jpg')
on conflict do nothing;
