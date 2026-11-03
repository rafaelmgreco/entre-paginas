"use server";
import { revalidatePath } from "next/cache";
import { bookService } from "@/services/book-service";
export async function createBook(form: FormData) { await bookService.create(form); revalidatePath("/"); }
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
