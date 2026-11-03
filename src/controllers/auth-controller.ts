"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function signIn(form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
  if (error) redirect("/?auth_error=Confira seu e-mail e senha");
  revalidatePath("/"); redirect("/");
}
export async function signUp(form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email: String(form.get("email")), password: String(form.get("password")) });
  if (error) redirect(`/?auth_error=${encodeURIComponent(error.message)}`);
  redirect("/?auth_message=Confira seu e-mail para confirmar a conta");
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); revalidatePath("/"); redirect("/"); }
