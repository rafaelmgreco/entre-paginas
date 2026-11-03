import { AdminRepository } from "@/repositories/admin-repository";

const repository = new AdminRepository();
export const adminService = {
  listProfiles: () => repository.listProfiles(),
  async updateBookPages(form: FormData) {
    const bookId = String(form.get("book_id") ?? "");
    const totalPages = Number(form.get("total_pages"));
    if (!bookId || !Number.isInteger(totalPages) || totalPages < 1) throw new Error("Informe um total de páginas válido.");
    await repository.updateBookPages(bookId, totalPages);
  },
  async deleteBook(form: FormData) {
    const bookId = String(form.get("book_id") ?? "");
    if (!bookId) throw new Error("Livro inválido.");
    await repository.deleteBook(bookId);
  },
};
