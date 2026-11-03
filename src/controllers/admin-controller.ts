"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminService } from "@/services/admin-service";

const ADMIN_EMAIL = "rafaelmgreco@hotmail.com";
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Acesso restrito ao administrador.");
}

export async function updateBookPages(form: FormData) {
  await requireAdmin();
  await adminService.updateBookPages(form);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteBook(form: FormData) {
  await requireAdmin();
  try {
    await adminService.deleteBook(form);
  } finally {
    revalidatePath("/");
    revalidatePath("/admin");
  }
}
