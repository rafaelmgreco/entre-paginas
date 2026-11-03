import { BookRepository } from "@/repositories/book-repository";
import { DEFAULT_PROGRESS_COLOR, profileService } from "@/services/profile-service";
import { validateCoverFile } from "@/services/cover-service";

const repository = new BookRepository();

export const bookService = {
  async list() {
    const [books, colors] = await Promise.all([
      repository.list(),
      profileService.listReaderColors().catch(() => new Map<string, string>()),
    ]);
    return books.map((book) => ({
      ...book,
      reading_progress: (book.reading_progress ?? []).map((progress) => ({
        ...progress,
        progress_color: colors.get(progress.user_id) ?? DEFAULT_PROGRESS_COLOR,
      })),
    }));
  },

  async create(form: FormData) {
    const title = String(form.get("title") ?? "").trim();
    const author = String(form.get("author") ?? "").trim();
    const totalPages = Number(form.get("total_pages"));
    if (!title || title.length > 180 || !author || author.length > 120 || !Number.isInteger(totalPages) || totalPages < 1) {
      throw new Error("Informe o título, autor e um número válido de páginas.");
    }
    const cover = await validateCoverFile(form.get("cover"));
    if (!cover) throw new Error("Escolha uma imagem de capa.");
    await repository.createWithCover({ title, author, total_pages: totalPages }, cover);
  },

  async updateProgress(form: FormData): Promise<boolean> {
    const bookId = String(form.get("book_id") ?? "");
    const page = Number(form.get("current_page"));
    if (!bookId || !Number.isInteger(page) || page < 0) throw new Error("Informe um número de página válido.");
    return repository.updateProgress(bookId, page);
  },
};
