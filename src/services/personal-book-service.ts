import { PersonalBookRepository } from "@/repositories/personal-book-repository";
import { validateCoverFile } from "@/services/cover-service";

const repository = new PersonalBookRepository();

export const personalBookService = {
  listMine: () => repository.listMine(),

  async create(form: FormData): Promise<boolean> {
    const title = String(form.get("title") ?? "").trim();
    const author = String(form.get("author") ?? "").trim();
    const totalPages = Number(form.get("total_pages"));
    const status = String(form.get("reading_status") ?? "reading");
    if (!title || title.length > 180 || !author || author.length > 120 || !Number.isInteger(totalPages) || totalPages < 1) {
      throw new Error("Informe título, autor e um total de páginas válido.");
    }
    if (status !== "reading" && status !== "finished") throw new Error("Escolha se está lendo ou se já concluiu o livro.");
    const rawCurrentPage = form.get("current_page");
    const currentPage = status === "finished" ? totalPages : Number(rawCurrentPage === null || rawCurrentPage === "" ? 0 : rawCurrentPage);
    if (!Number.isInteger(currentPage) || currentPage < 0 || currentPage > totalPages) {
      throw new Error(`A página atual precisa estar entre 0 e ${totalPages}.`);
    }
    const cover = await validateCoverFile(form.get("cover"), false);
    await repository.create({ title, author, total_pages: totalPages, current_page: currentPage, cover_path: null }, cover ?? undefined);
    return status === "finished";
  },

  async updateProgress(form: FormData): Promise<boolean> {
    const bookId = String(form.get("book_id") ?? "");
    const page = Number(form.get("current_page"));
    if (!bookId || !Number.isInteger(page) || page < 0) throw new Error("Informe uma página válida.");
    return repository.updateProgress(bookId, page);
  },

  async delete(form: FormData) {
    const bookId = String(form.get("book_id") ?? "");
    if (!bookId) throw new Error("Livro inválido.");
    await repository.delete(bookId);
  },
};
