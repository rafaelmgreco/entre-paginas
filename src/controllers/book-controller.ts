"use server";
import { revalidatePath } from "next/cache";
import { bookService } from "@/services/book-service";
export async function createBook(form: FormData) { await bookService.create(form); revalidatePath("/"); }
export async function updateBookProgress(form: FormData) { await bookService.updateProgress(form); revalidatePath("/"); }
