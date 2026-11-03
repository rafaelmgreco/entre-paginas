"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { createPersonalBook, type PersonalBookActionState } from "@/controllers/personal-book-controller";
import { FireworksCelebration } from "@/app/fireworks-celebration";

const initialState: PersonalBookActionState = { status: "idle" };

export function PersonalBookForm() {
  const [state, formAction, pending] = useActionState(createPersonalBook, initialState);
  const [celebrating, setCelebrating] = useState(false);
  const [fileError, setFileError] = useState("");
  const closeCelebration = useCallback(() => setCelebrating(false), []);
  useEffect(() => {
    if (state.status === "success" && state.completedNow) setCelebrating(true);
  }, [state.status, state.completedNow, state.submissionId]);

  function validateCover(file?: File) {
    if (!file) { setFileError(""); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) setFileError("Envie uma capa JPG, PNG ou WebP.");
    else if (file.size > 2 * 1024 * 1024) setFileError("A imagem deve ter no máximo 2 MB.");
    else setFileError("");
  }

  return <>
    <form action={formAction} encType="multipart/form-data" className="personal-book-form">
      <label>Título<input name="title" required maxLength={180} placeholder="Ex.: A biblioteca da meia-noite" /></label>
      <label>Autor<input name="author" required maxLength={120} placeholder="Nome de quem escreveu" /></label>
      <label>Total de páginas<input type="number" name="total_pages" min="1" required placeholder="Ex.: 320" /></label>
      <label>Página atual (se está lendo)<input type="number" name="current_page" min="0" defaultValue="0" /></label>
      <label>Situação<select name="reading_status" defaultValue="reading"><option value="reading">Estou lendo</option><option value="finished">Já li</option></select></label>
      <label className="personal-cover-field">Capa (opcional)<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => validateCover(event.currentTarget.files?.[0])} /><small>JPG, PNG ou WebP, até 2 MB. A capa usa o bucket de Storage configurado no projeto.</small>{fileError && <small className="error" role="alert">{fileError}</small>}</label>
      {state.message && <p className={`book-form-message ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>}
      <button className="submit-button" disabled={pending || Boolean(fileError)}>{pending ? "Salvando…" : "Adicionar à minha coleção"}<span>→</span></button>
    </form>
    <FireworksCelebration open={celebrating} onClose={closeCelebration} buttonLabel="Voltar à minha coleção" />
  </>;
}
