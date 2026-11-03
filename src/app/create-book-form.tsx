"use client";

import { useActionState, useState } from "react";
import { createBook, type CreateBookState } from "@/controllers/book-controller";

const initialState: CreateBookState = { status: "idle" };

export function CreateBookForm() {
  const [state, formAction, pending] = useActionState(createBook, initialState);
  const [fileError, setFileError] = useState("");
  function validateSelectedFile(file?: File) {
    if (!file) { setFileError(""); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Escolha uma imagem JPG, PNG ou WebP.");
    } else if (file.size > 2 * 1024 * 1024) {
      setFileError("A capa deve ter no máximo 2 MB.");
    } else {
      setFileError("");
    }
  }
  return <form action={formAction} encType="multipart/form-data" className="add-form">
    <label>Título<input name="title" placeholder="Ex.: O conto da aia" required maxLength={180} /></label>
    <label>Autor<input name="author" placeholder="Nome de quem escreveu" required maxLength={120} /></label>
    <label>Total de páginas<input name="total_pages" type="number" min="1" placeholder="Ex.: 432" required /></label>
    <label>Capa do livro<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => validateSelectedFile(event.currentTarget.files?.[0])} required /><small className="cover-help">JPG, PNG ou WebP. Tamanho máximo: 2 MB.</small>{fileError && <small className="book-form-message error" role="alert">{fileError}</small>}</label>
    {state.message && <p className={`book-form-message ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
    <button className="submit-button" disabled={pending || Boolean(fileError)}>{pending ? "Enviando…" : "Salvar livro"}<span>→</span></button>
  </form>;
}
