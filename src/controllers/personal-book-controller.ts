"use server";
import { revalidatePath } from "next/cache";
import { personalBookService } from "@/services/personal-book-service";

export type PersonalBookActionState = { status: "idle" | "success" | "error"; message?: string; completedNow?: boolean; submissionId?: number };

export async function createPersonalBook(_previous: PersonalBookActionState, form: FormData): Promise<PersonalBookActionState> {
  try {
    const completedNow = await personalBookService.create(form);
    revalidatePath("/minha-colecao");
    revalidatePath("/");
    return { status: "success", completedNow, submissionId: Date.now(), message: "Livro adicionado à sua coleção." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível adicionar o livro." };
  }
}

export async function updatePersonalBookProgress(_previous: PersonalBookActionState, form: FormData): Promise<PersonalBookActionState> {
  try {
    const completedNow = await personalBookService.updateProgress(form);
    revalidatePath("/minha-colecao");
    return { status: "success", completedNow, submissionId: Date.now() };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível salvar o progresso." };
  }
}

export async function deletePersonalBook(_previous: PersonalBookActionState, form: FormData): Promise<PersonalBookActionState> {
  try {
    await personalBookService.delete(form);
    revalidatePath("/minha-colecao");
    return { status: "success", message: "Livro removido da sua coleção." };
  } catch (error) {
    revalidatePath("/minha-colecao");
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível remover o livro." };
  }
}
