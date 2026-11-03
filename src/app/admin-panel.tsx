"use client";
import { useState } from "react";
import { deleteBook, updateBookPages } from "@/controllers/admin-controller";
import type { Book } from "@/lib/types";
import type { RegisteredProfile } from "@/repositories/admin-repository";

export function AdminPanel({ profiles, books }: { profiles: RegisteredProfile[]; books: Book[] }) {
  const [message, setMessage] = useState("");
  return <section className="admin-panel" id="administracao">
    <div className="admin-heading"><div><span className="eyebrow">CONTROLE DO CLUBE</span><h2>Administração</h2></div><span>{profiles.length} {profiles.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}</span></div>
    {message && <p className="admin-feedback" role="status">{message}</p>}
    <div className="admin-columns">
      <section><h3>Pessoas cadastradas</h3>{profiles.length ? <ul className="admin-users">{profiles.map((profile) => <li key={profile.user_id}><strong>{profile.display_name || "Sem nome"}</strong><span>{profile.email || "E-mail indisponível"}</span><small>Desde {new Date(profile.created_at).toLocaleDateString("pt-BR")}</small></li>)}</ul> : <p className="admin-muted">Nenhum perfil encontrado.</p>}</section>
      <section><h3>Livros da estante</h3><div className="admin-books">{books.map((book) => <article className="admin-book" key={book.id}><div><strong>{book.title}</strong><span>{book.author}</span></div><form action={async (form) => { try { await updateBookPages(form); setMessage(`Total de páginas de “${book.title}” atualizado.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível atualizar."); } }}><input type="hidden" name="book_id" value={book.id} /><label>Total de páginas<input aria-label={`Total de páginas de ${book.title}`} type="number" name="total_pages" min="1" defaultValue={book.total_pages} required /></label><button className="outline-button">Corrigir</button></form><form action={async (form) => { if (!window.confirm(`Remover “${book.title}” e os progressos registrados?`)) return; try { await deleteBook(form); setMessage(`“${book.title}” foi removido da estante.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível remover."); } }}><input type="hidden" name="book_id" value={book.id} /><button className="delete-book">Remover livro</button></form></article>)}</div></section>
    </div>
  </section>;
}
