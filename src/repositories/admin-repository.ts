import { createClient } from "@/lib/supabase/server";

export type RegisteredProfile = { user_id: string; email: string | null; display_name: string; created_at: string };

export class AdminRepository {
  async listProfiles(): Promise<RegisteredProfile[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("profiles").select("user_id,email,display_name,created_at").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as RegisteredProfile[];
  }

  async updateBookPages(bookId: string, totalPages: number) {
    const supabase = await createClient();
    const { error } = await supabase.from("books").update({ total_pages: totalPages }).eq("id", bookId);
    if (error) throw new Error(error.message);
  }

  async deleteBook(bookId: string) {
    const supabase = await createClient();
    const { data: book, error: readError } = await supabase.from("books").select("cover_path").eq("id", bookId).single();
    if (readError) throw new Error(readError.message);
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) throw new Error(error.message);
    if (book?.cover_path && !book.cover_path.startsWith("/") && !/^https?:\/\//i.test(book.cover_path)) {
      const { error: storageError } = await supabase.storage.from("book-covers").remove([book.cover_path]);
      if (storageError) throw new Error(`Livro removido, mas não consegui apagar a capa do Storage: ${storageError.message}`);
    }
  }
}
