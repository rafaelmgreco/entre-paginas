import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { PersonalBook } from "@/lib/types";
import { coverExtension } from "@/services/cover-service";

export class PersonalBookRepository {
  async listMine(): Promise<PersonalBook[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para ver sua coleção.");
    const { data, error } = await supabase.from("personal_books")
      .select("id,user_id,title,author,total_pages,current_page,cover_path,created_at,updated_at")
      .eq("user_id", user.id).order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as PersonalBook[];
  }

  async create(input: Omit<PersonalBook, "id" | "user_id" | "created_at" | "updated_at">, cover?: File) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para adicionar à coleção.");
    let coverPath: string | null = null;

    if (cover) {
      coverPath = `${randomUUID()}.${coverExtension(cover)}`;
      const { error } = await supabase.storage.from("book-covers").upload(coverPath, cover, {
        contentType: cover.type,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new Error(error.message);
    }

    const { error } = await supabase.from("personal_books").insert({ ...input, cover_path: coverPath, user_id: user.id });
    if (error) {
      if (coverPath) await supabase.storage.from("book-covers").remove([coverPath]);
      throw new Error(error.message);
    }
  }

  async updateProgress(bookId: string, currentPage: number): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para atualizar seu progresso.");
    const { data: book, error: readError } = await supabase.from("personal_books")
      .select("total_pages,current_page").eq("id", bookId).eq("user_id", user.id).single();
    if (readError || !book) throw new Error("Livro pessoal não encontrado.");
    if (currentPage > book.total_pages) throw new Error(`Este livro tem ${book.total_pages} páginas.`);
    const { error } = await supabase.from("personal_books").update({ current_page: currentPage }).eq("id", bookId).eq("user_id", user.id);
    if (error) throw new Error(error.message);
    return currentPage >= book.total_pages && book.current_page < book.total_pages;
  }

  async delete(bookId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para remover um livro.");
    const { data: book, error: readError } = await supabase.from("personal_books")
      .select("cover_path").eq("id", bookId).eq("user_id", user.id).single();
    if (readError || !book) throw new Error("Livro pessoal não encontrado.");
    const { error } = await supabase.from("personal_books").delete().eq("id", bookId).eq("user_id", user.id);
    if (error) throw new Error(error.message);
    if (book.cover_path) {
      const { error: coverError } = await supabase.storage.from("book-covers").remove([book.cover_path]);
      if (coverError) throw new Error(`Livro removido, mas não consegui apagar a capa: ${coverError.message}`);
    }
  }
}
