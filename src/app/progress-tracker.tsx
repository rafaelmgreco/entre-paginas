"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { updateBookProgress, type ProgressActionState } from "@/controllers/book-controller";
import { FireworksCelebration } from "@/app/fireworks-celebration";

const initialState: ProgressActionState = { status: "idle" };

export function ProgressTracker({ bookId, totalPages, currentPage }: { bookId: string; totalPages: number; currentPage: number }) {
  const [state, formAction, pending] = useActionState(updateBookProgress, initialState);
  const [celebrating, setCelebrating] = useState(false);
  const closeCelebration = useCallback(() => setCelebrating(false), []);

  useEffect(() => {
    if (state.status === "success" && state.completedNow) setCelebrating(true);
  }, [state.status, state.completedNow, state.submissionId]);

  return <>
    <form action={formAction} className="progress-form">
      <input type="hidden" name="book_id" value={bookId} />
      <label>Sua página <input type="number" name="current_page" min="0" max={totalPages} defaultValue={currentPage} required /></label>
      <button disabled={pending}>{pending ? "Salvando…" : "Atualizar"}</button>
      {state.status === "error" && <p className="progress-error" role="alert">{state.message}</p>}
    </form>
    <FireworksCelebration open={celebrating} onClose={closeCelebration} />
  </>;
}
