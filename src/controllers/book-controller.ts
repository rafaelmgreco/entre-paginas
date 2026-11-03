"use server";
import { revalidatePath } from "next/cache";
import { bookService } from "@/services/book-service";
export type CreateBookState = { status: "idle" | "success" | "error"; message?: string };
export async function createBook(_previous: CreateBookState, form: FormData): Promise<CreateBookState> {
  try {
    await bookService.create(form);
    revalidatePath("/");
    return { status: "success", message: "Livro e capa adicionados à estante." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível cadastrar o livro." };
  }
}
export type ProgressActionState = { status: "idle" | "success" | "error"; message?: string; completedNow?: boolean; submissionId?: number };
export async function updateBookProgress(_previous: ProgressActionState, form: FormData): Promise<ProgressActionState> {
  try {
    const completedNow = await bookService.updateProgress(form);
    revalidatePath("/");
    return { status: "success", completedNow, submissionId: Date.now() };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível salvar o progresso." };
  }
}
