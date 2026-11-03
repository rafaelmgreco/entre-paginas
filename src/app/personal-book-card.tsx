"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import type { PersonalBook } from "@/lib/types";
import { updatePersonalBookProgress, deletePersonalBook, type PersonalBookActionState } from "@/controllers/personal-book-controller";
import { FireworksCelebration } from "@/app/fireworks-celebration";
import { BookCover } from "@/app/book-cover";

const initialState: PersonalBookActionState = { status: "idle" };

export function PersonalBookCard({ book, color }: { book: PersonalBook; color: string }) {
  const [state, progressAction, pending] = useActionState(updatePersonalBookProgress, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deletePersonalBook, initialState);
  const [celebrating, setCelebrating] = useState(false);
  const closeCelebration = useCallback(() => setCelebrating(false), []);
  useEffect(() => {
    if (state.status === "success" && state.completedNow) setCelebrating(true);
  }, [state.status, state.completedNow, state.submissionId]);

  const percent = Math.min(100, Math.round(book.current_page / book.total_pages * 100));
  const finished = book.current_page >= book.total_pages;
  return <>
    <article className="personal-book-card">
      <BookCover title={book.title} src={book.cover_path} />
      <div className="personal-book-info">
        <div className="personal-book-heading"><div><h2>{book.title}</h2><p>{book.author}</p></div><span>{book.total_pages} págs.</span></div>
        <div className="personal-book-status">{finished ? "✓ Já lido" : "Lendo"}</div>
        <div className="reader-label"><span>Sua leitura</span><b>{percent}%</b></div>
        <div className="progress"><i style={{ width: `${percent}%`, backgroundColor: color }} /></div>
        <div className="page-row"><span>página {book.current_page} de {book.total_pages}</span></div>
        <form action={progressAction} className="personal-progress-form">
          <input type="hidden" name="book_id" value={book.id} />
          <label>Estou na página<input type="number" name="current_page" min="0" max={book.total_pages} defaultValue={book.current_page} required /></label>
          <button className="submit-button" disabled={pending}>{pending ? "Salvando…" : "Atualizar progresso"}</button>
          {state.status === "error" && <p className="progress-error" role="alert">{state.message}</p>}
        </form>
        <form action={deleteAction} className="personal-delete-form" onSubmit={(event) => { if (!window.confirm(`Remover “${book.title}” da sua coleção?`)) event.preventDefault(); }}>
          <input type="hidden" name="book_id" value={book.id} />
          <button className="delete-book" disabled={deleting}>Remover da coleção</button>
          {deleteState.status === "error" && <span className="progress-error" role="alert">{deleteState.message}</span>}
        </form>
      </div>
    </article>
    <FireworksCelebration open={celebrating} onClose={closeCelebration} buttonLabel="Voltar à minha coleção" />
  </>;
}
