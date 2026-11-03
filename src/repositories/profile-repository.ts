import { createClient } from "@/lib/supabase/server";

export class ProfileRepository {
  async updateDisplayName(displayName: string) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Entre na sua conta para alterar seu nome.");

    const { error: authError } = await supabase.auth.updateUser({ data: { display_name: displayName } });
    if (authError) throw new Error(authError.message);

    const { error: progressError } = await supabase
      .from("reading_progress")
      .update({ reader_name: displayName })
      .eq("user_id", user.id);
    if (progressError) throw new Error(progressError.message);
  }
}
