import type { Book } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export class BookRepository {
  async list(): Promise<Book[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Book[];
  }
  async create(input: Pick<Book, "title" | "author" | "reader_name" | "cover_url" | "total_pages" | "current_page">) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Entre na sua conta para salvar livros.");
    const { error } = await supabase.from("books").insert({ ...input, user_id: user.id, status: input.current_page >= input.total_pages ? "finished" : "reading" });
    if (error) throw new Error(error.message);
  }
  async updateProgress(id: string, currentPage: number, totalPages: number) {
    const supabase = await createClient();
    const { error } = await supabase.from("books").update({ current_page: currentPage, status: currentPage >= totalPages ? "finished" : "reading" }).eq("id", id);
    if (error) throw new Error(error.message);
  }
}
