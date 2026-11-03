create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reader_name text not null check (char_length(reader_name) between 1 and 80),
  title text not null check (char_length(title) between 1 and 180),
  author text not null check (char_length(author) between 1 and 120),
  cover_url text not null,
  total_pages integer not null check (total_pages > 0),
  current_page integer not null default 0 check (current_page >= 0 and current_page <= total_pages),
  status text not null default 'reading' check (status in ('reading', 'finished', 'want_to_read')),
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

-- Estante compartilhada: pessoas com conta podem ver e atualizar o progresso do grupo.
create policy "Signed in users can read the shared shelf" on public.books
  for select to authenticated using (true);
create policy "Signed in users can add books to the shared shelf" on public.books
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Signed in users can update the shared shelf" on public.books
  for update to authenticated using (true) with check (true);
create policy "Book owners can remove their books" on public.books
  for delete to authenticated using (auth.uid() = user_id);
