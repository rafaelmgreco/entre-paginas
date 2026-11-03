import { createClient } from "@/lib/supabase/server";

export class ProfileRepository {
  async getReaderColor(userId: string): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("reader_preferences").select("progress_color").eq("user_id", userId).single();
    if (error) throw new Error(error.message);
    return data.progress_color as string;
  }

  async listReaderColors(): Promise<Map<string, string>> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("reader_preferences").select("user_id,progress_color");
    if (error) throw new Error(error.message);
    return new Map((data ?? []).map((preference) => [preference.user_id as string, preference.progress_color as string] as const));
  }

  async updateReaderColor(progressColor: string) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Entre na sua conta para alterar a cor.");
    const { error } = await supabase.from("reader_preferences").update({ progress_color: progressColor }).eq("user_id", user.id).select("user_id").single();
    if (error) throw new Error(error.message);
  }

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
