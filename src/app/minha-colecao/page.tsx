import { BookOpen, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PersonalBookCard } from "@/app/personal-book-card";
import { PersonalBookForm } from "@/app/personal-book-form";
import { NavigationMenu } from "@/app/navigation-menu";
import { signOut } from "@/controllers/auth-controller";
import { createClient } from "@/lib/supabase/server";
import type { PersonalBook } from "@/lib/types";
import { DEFAULT_PROGRESS_COLOR, profileService } from "@/services/profile-service";
import { personalBookService } from "@/services/personal-book-service";

export default async function PersonalCollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/#entrar");

  let books: PersonalBook[] = [];
  let loadError = false;
  try { books = await personalBookService.listMine(); } catch { loadError = true; }
  let color = DEFAULT_PROGRESS_COLOR;
  try { color = await profileService.getReaderColor(user.id); } catch { /* Existing app migrations may not have been applied yet. */ }
  const isAdmin = user.email?.toLowerCase() === "rafaelmgreco@hotmail.com";
  const finishedCount = books.filter((book) => book.current_page >= book.total_pages).length;

  return <main className="shell personal-collection-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-icon"><BookOpen size={19} /></span>entre<span>páginas</span></Link><div className="nav-right"><span className="nav-note">sua leitura, no seu ritmo</span><NavigationMenu isAdmin={isAdmin} /><form action={signOut}><button className="text-button">Sair</button></form></div></nav>
    <header className="personal-page-heading"><Link href="/#estante">← Voltar para a estante compartilhada</Link><span className="eyebrow">SÓ SUA</span><h1>Minha coleção</h1><p>Guarde os livros que está lendo e os que já terminou.</p></header>
    {loadError ? <div className="empty-state">Para ativar sua coleção pessoal, execute <code>supabase/personal_books.sql</code> no SQL Editor do Supabase.</div> : <>
      <section className="personal-collection-stats"><div><strong>{books.length}</strong><span>{books.length === 1 ? "livro na coleção" : "livros na coleção"}</span></div><div><strong>{finishedCount}</strong><span>{finishedCount === 1 ? "livro concluído" : "livros concluídos"}</span></div><a href="#adicionar-pessoal"><Plus size={17} /> Adicionar livro</a></section>
      {books.length ? <div className="personal-book-grid">{books.map((book) => <PersonalBookCard key={book.id} book={book} color={color} />)}</div> : <div className="empty-state personal-empty">Sua coleção ainda está vazia. Adicione um livro para começar.</div>}
      <section className="personal-add-panel" id="adicionar-pessoal"><div><span className="eyebrow">UMA ESTANTE SÓ SUA</span><h2>Adicionar à coleção</h2><p>Cadastre livros que não estão na estante compartilhada, marque os que já leu ou registre a página atual.</p><small>A capa é opcional. Para enviar uma, use o bucket `book-covers` já configurado.</small></div><PersonalBookForm /></section>
    </>}
    <footer><Link className="brand" href="/"><span className="brand-icon"><BookOpen size={16} /></span>entre<span>páginas</span></Link><span>Feito para quem lê junto. ♡</span></footer>
  </main>;
}
