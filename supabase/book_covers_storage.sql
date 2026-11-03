-- Execute depois de criar o bucket público "book-covers" no Dashboard.
-- Upload permitido para contas autenticadas; remoção de arquivos só pelo admin.
drop policy if exists "Authenticated users can upload book covers" on storage.objects;
create policy "Authenticated users can upload book covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'book-covers');

drop policy if exists "Uploader can delete unattached book covers" on storage.objects;
create policy "Uploader can delete unattached book covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'book-covers'
  and owner_id = (select auth.uid()::text)
  and not exists (
    select 1 from public.books as book where book.cover_path = storage.objects.name
  )
);

drop policy if exists "Admin can delete book covers" on storage.objects;
create policy "Admin can delete book covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'book-covers'
  and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rafaelmgreco@hotmail.com'
);
