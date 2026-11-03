import { ProfileRepository } from "@/repositories/profile-repository";

const repository = new ProfileRepository();

export const profileService = {
  async updateDisplayName(form: FormData) {
    const displayName = String(form.get("display_name") ?? "").trim().replace(/\s+/g, " ");
    if (displayName.length < 2 || displayName.length > 40) {
      throw new Error("Escolha um nome de exibição entre 2 e 40 caracteres.");
    }
    await repository.updateDisplayName(displayName);
  },
};
