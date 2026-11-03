"use server";
import { revalidatePath } from "next/cache";
import { bookService } from "@/services/book-service";
export async function createBook(form: FormData) { await bookService.create(form); revalidatePath("/"); }
export async function updateBookProgress(form: FormData) { await bookService.updateProgress(String(form.get("id")), Number(form.get("current_page")), Number(form.get("total_pages"))); revalidatePath("/"); }
