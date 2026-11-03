import { BookRepository } from "@/repositories/book-repository";
const repository = new BookRepository();
export const bookService = {
  list: () => repository.list(),
  async create(form: FormData) {
    const total = Number(form.get("total_pages")); const current = Number(form.get("current_page"));
    const title = String(form.get("title") ?? "").trim(); const author = String(form.get("author") ?? "").trim(); const reader = String(form.get("reader_name") ?? "").trim(); const cover = String(form.get("cover_url") ?? "").trim();
    if (!title || !author || !reader || !cover || !Number.isInteger(total) || total < 1 || !Number.isInteger(current) || current < 0 || current > total) throw new Error("Confira os dados do livro e as páginas informadas.");
    await repository.create({ title, author, reader_name: reader, cover_url: cover, total_pages: total, current_page: current });
  },
  async updateProgress(id: string, page: number, total: number) {
    if (!id || !Number.isInteger(page) || page < 0 || page > total) throw new Error("Página inválida.");
    await repository.updateProgress(id, page, total);
  },
};
