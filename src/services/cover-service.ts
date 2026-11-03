const MAX_COVER_BYTES = 2 * 1024 * 1024;
const COVER_TYPES = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
} as const;

export async function validateCoverFile(value: FormDataEntryValue | null, required = true): Promise<File | null> {
  if (!(value instanceof File) || value.size === 0) {
    if (required) throw new Error("Escolha uma imagem de capa.");
    return null;
  }
  if (value.size > MAX_COVER_BYTES) throw new Error("A capa deve ter no máximo 2 MB.");
  const rule = COVER_TYPES[value.type as keyof typeof COVER_TYPES];
  if (!rule) throw new Error("Formato não aceito. Envie uma imagem JPG, PNG ou WebP.");
  const bytes = new Uint8Array(await value.slice(0, 12).arrayBuffer());
  const matches = rule.signature.every((byte, index) => bytes[index] === byte);
  const isWebp = value.type !== "image/webp" || String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!matches || !isWebp) throw new Error("O conteúdo do arquivo não corresponde a uma imagem JPG, PNG ou WebP válida.");
  return value;
}

export function coverExtension(file: File) {
  return COVER_TYPES[file.type as keyof typeof COVER_TYPES].extension;
}
