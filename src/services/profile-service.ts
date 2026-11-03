import { ProfileRepository } from "@/repositories/profile-repository";

const repository = new ProfileRepository();
export const DEFAULT_PROGRESS_COLOR = "rgb(117, 148, 123)";

export const profileService = {
  getReaderColor: (userId: string) => repository.getReaderColor(userId),
  listReaderColors: () => repository.listReaderColors(),
  async updateReaderColor(form: FormData) {
    const hex = String(form.get("progress_color") ?? "");
    if (!/^#[\da-fA-F]{6}$/.test(hex)) throw new Error("Escolha uma cor válida.");
    const red = Number.parseInt(hex.slice(1, 3), 16);
    const green = Number.parseInt(hex.slice(3, 5), 16);
    const blue = Number.parseInt(hex.slice(5, 7), 16);
    await repository.updateReaderColor(`rgb(${red}, ${green}, ${blue})`);
  },
  async updateDisplayName(form: FormData) {
    const displayName = String(form.get("display_name") ?? "").trim().replace(/\s+/g, " ");
    if (displayName.length < 2 || displayName.length > 40) {
      throw new Error("Escolha um nome de exibição entre 2 e 40 caracteres.");
    }
    await repository.updateDisplayName(displayName);
  },
};
