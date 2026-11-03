import { BookRepository } from "@/repositories/book-repository";

const repository = new BookRepository();

function coverPath(title: string) {
  const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/covers/${slug}.jpg`;
}

export const bookService = {
  list: () => repository.list(),

  async create(form: FormData) {
    const title = String(form.get("title") ?? "").trim();
    const author = String(form.get("author") ?? "").trim();
    const totalPages = Number(form.get("total_pages"));
    if (!title || title.length > 180 || !author || author.length > 120 || !Number.isInteger(totalPages) || totalPages < 1) {
      throw new Error("Informe o título, autor e um número válido de páginas.");
    }
    await repository.create({ title, author, total_pages: totalPages, cover_path: coverPath(title) });
  },

  async updateProgress(form: FormData) {
    const bookId = String(form.get("book_id") ?? "");
    const page = Number(form.get("current_page"));
    if (!bookId || !Number.isInteger(page) || page < 0) throw new Error("Informe um número de página válido.");
    await repository.updateProgress(bookId, page);
  },
};
