"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileService } from "@/services/profile-service";
export async function signIn(form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
  if (error) redirect("/?auth_error=Confira seu e-mail e senha");
  revalidatePath("/"); redirect("/");
}
export async function signUp(form: FormData) {
  const supabase = await createClient();
  const displayName = String(form.get("display_name") ?? "").trim().replace(/\s+/g, " ");
  if (displayName.length < 2 || displayName.length > 40) redirect("/?auth_error=Informe um nome entre 2 e 40 caracteres");
  const { error } = await supabase.auth.signUp({ email: String(form.get("email")), password: String(form.get("password")), options: { data: { display_name: displayName } } });
  if (error) redirect(`/?auth_error=${encodeURIComponent(error.message)}`);
  redirect("/?auth_message=Confira seu e-mail para confirmar a conta");
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); revalidatePath("/"); redirect("/"); }

export async function saveDisplayName(form: FormData) {
  try {
    await profileService.updateDisplayName(form);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o nome.";
    redirect(`/?profile_error=${encodeURIComponent(message)}#perfil`);
  }
  revalidatePath("/");
  redirect("/?profile_message=Nome+atualizado#perfil");
}
