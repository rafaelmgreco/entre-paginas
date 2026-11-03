import type { Book } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export class BookRepository {
  async list(): Promise<Book[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("books")
      .select("id,title,author,total_pages,cover_path,created_at,reading_progress(id,book_id,user_id,reader_name,current_page,updated_at)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Book[];
  }

  async create(input: Pick<Book, "title" | "author" | "total_pages" | "cover_path">) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para cadastrar um livro.");
    const { error } = await supabase.from("books").insert({ ...input, created_by: user.id });
    if (error?.code === "23505") throw new Error("Esse livro já está cadastrado na estante.");
    if (error) throw new Error(error.message);
  }

  async updateProgress(bookId: string, currentPage: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para atualizar seu progresso.");

    const { data: book, error: bookError } = await supabase
      .from("books").select("id,total_pages").eq("id", bookId).single();
    if (bookError || !book) throw new Error("Livro não encontrado.");
    if (currentPage > book.total_pages) throw new Error(`Este livro tem ${book.total_pages} páginas.`);

    const readerName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "Leitor").trim().slice(0, 120);
    const { error } = await supabase.from("reading_progress").upsert(
      { book_id: bookId, user_id: user.id, reader_name: readerName, current_page: currentPage },
      { onConflict: "book_id,user_id" },
    );
    if (error) throw new Error(error.message);
  }
}
