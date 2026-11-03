import { BookOpen, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { bookService } from "@/services/book-service";
import { createBook, updateBookProgress } from "@/controllers/book-controller";
import { signIn, signUp, signOut, saveDisplayName } from "@/controllers/auth-controller";
import { BookCover } from "@/app/book-cover";
import type { Book } from "@/lib/types";

export default async function Home({ searchParams }: { searchParams: Promise<{ auth_error?: string; auth_message?: string; profile_error?: string; profile_message?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = String(user?.user_metadata?.display_name ?? "");
  let books: Book[] = [];
  let booksLoadError = false;
  if (user) {
    try { books = await bookService.list(); } catch { booksLoadError = true; }
  }
  const allProgress = books.flatMap((book) => book.reading_progress ?? []);
  const average = allProgress.length
    ? Math.round(allProgress.reduce((sum, progress) => sum + progress.current_page / (books.find((book) => book.id === progress.book_id)?.total_pages ?? 1) * 100, 0) / allProgress.length)
    : 0;
  const params = await searchParams;

  return <main className="shell">
    <nav className="nav"><a className="brand" href="#top"><span className="brand-icon"><BookOpen size={19} /></span>entre<span>páginas</span></a><div className="nav-right"><span className="nav-note">um clube, muitas histórias</span>{user ? <form action={signOut}><button className="text-button">Sair</button></form> : <a className="login-link" href="#entrar">Entrar</a>}</div></nav>
    <section className="hero" id="top"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> SEU CANTINHO DE LEITURA</div><h1>Histórias ficam<br />melhores <em>juntas.</em></h1><p>Acompanhe o ritmo da leitura, descubra onde cada pessoa está e aproveite cada página — sem spoilers.</p><a href="#estante" className="primary-link">Ver nossa estante <span>↓</span></a></div><div className="hero-art"><div className="sun" /><div className="book-stack"><div className="stack-book book-a"><small>UMA VIDA<br />PEQUENA</small><b>HANYA<br />YANAGIHARA</b></div><div className="stack-book book-b"><small>O JARDIM<br />SECRETO</small><b>FRANCES<br />BURNETT</b></div><div className="stack-book book-c"><small>DIAS<br />PERFEITOS</small><b>RAPHAEL<br />MONTES</b></div></div><span className="art-caption">um capítulo de cada vez</span></div></section>
    <section className="stats"><div><span className="stat-label">NA ESTANTE</span><strong>{books.length.toString().padStart(2, "0")} <small>{books.length === 1 ? "livro" : "livros"}</small></strong></div><div><span className="stat-label">RITMO DO GRUPO</span><strong>{average}<small>% em média</small></strong></div><div className="quote">“Entre um capítulo e outro,<br />a gente se encontra.”</div></section>
    {user && <section className="profile-settings" id="perfil"><div><span className="eyebrow">SEU PERFIL NO CLUBE</span><h2>{displayName || "Escolha como quer aparecer"}</h2><p>Esse nome acompanha seu progresso nos livros.</p></div><form action={saveDisplayName}><label>Nome de exibição<input name="display_name" type="text" minLength={2} maxLength={40} defaultValue={displayName} placeholder="Ex.: Rafa, R. Greco..." required /></label><button className="outline-button">Salvar nome</button></form>{params.profile_error && <span className="profile-error">{params.profile_error}</span>}{params.profile_message && <span className="profile-success">{params.profile_message}</span>}</section>}
    <section className="library" id="estante"><div className="section-heading"><div><span className="eyebrow">LEITURAS COMPARTILHADAS</span><h2>Nossa estante <span>({books.length})</span></h2></div>{user && <a href="#adicionar" className="add-button"><Plus size={17} /> Adicionar livro</a>}</div>
      {!user && <div className="notice">Entre na sua conta para ver a estante compartilhada, adicionar livros e registrar seu progresso.</div>}
      {booksLoadError && <div className="empty-state">Não consegui acessar as tabelas do Supabase. Aplique o schema ou a migração descrita no README e confira se `public` está exposto à Data API.</div>}
      {user && !booksLoadError && books.length === 0 && <div className="empty-state">A estante ainda está vazia. Seja a primeira pessoa a adicionar um livro.</div>}
      <div className="book-grid">{books.map((book) => {
        const myProgress = book.reading_progress?.find((progress) => progress.user_id === user?.id);
        const percent = (page: number) => Math.min(100, Math.round(page / book.total_pages * 100));
        return <article className="book-card" key={book.id}><BookCover title={book.title} src={book.cover_path} /><div className="book-info"><div className="title-row"><div><h3>{book.title}</h3><p>{book.author}</p></div><span className="book-pages">{book.total_pages}<small> págs.</small></span></div>
          <div className="readers-list">{book.reading_progress?.length ? book.reading_progress.map((progress) => <div className="reader-progress" key={progress.id}><div className="reader-label"><span>{progress.reader_name}</span><b>{percent(progress.current_page)}%</b></div><div className="progress"><i style={{ width: `${percent(progress.current_page)}%` }} /></div><div className="page-row"><span>página {progress.current_page} de {book.total_pages}</span>{progress.current_page >= book.total_pages && <span className="finished">✓ Finalizado</span>}</div></div>) : <p className="no-progress">Ninguém começou este livro ainda.</p>}{user && !book.reading_progress?.some((progress) => progress.user_id !== user.id) && <p className="waiting-reader">A outra pessoa ainda não registrou o progresso deste livro.</p>}</div>
          {user && <form action={updateBookProgress} className="progress-form"><input type="hidden" name="book_id" value={book.id} /><label>Sua página <input type="number" name="current_page" min="0" max={book.total_pages} defaultValue={myProgress?.current_page ?? 0} required /></label><button>{myProgress ? "Atualizar" : "Registrar"}</button></form>}
        </div></article>;
      })}</div>
      {user && <div className="add-panel" id="adicionar"><div><span className="eyebrow">MAIS UMA HISTÓRIA</span><h2>Adicionar à estante</h2><p>Informe o título, autor e total de páginas. Depois, coloque a capa em <code>public/covers</code> usando o nome sugerido.</p><div className="cover-example">Exemplo: “Caminho dos Reis” → <code>public/covers/caminho-dos-reis.jpg</code></div></div><form action={createBook} className="add-form"><label>Título<input name="title" placeholder="Ex.: O conto da aia" required maxLength={180} /></label><label>Autor<input name="author" placeholder="Nome de quem escreveu" required maxLength={120} /></label><label>Total de páginas<input name="total_pages" type="number" min="1" placeholder="Ex.: 432" required /></label><button className="submit-button">Salvar livro <span>→</span></button></form></div>}
    </section>
    {!user && <section className="auth" id="entrar"><div><span className="eyebrow">SEU ESPAÇO DE LEITURA</span><h2>Entre para guardar<br />seu progresso.</h2><p>Crie sua conta gratuita ou acesse sua estante.</p></div><div className="auth-box">{params.auth_error && <p className="auth-message error">{params.auth_error}</p>}{params.auth_message && <p className="auth-message">{params.auth_message}</p>}<form action={signIn}><strong>Já tem uma conta?</strong><label>E-mail<input name="email" type="email" required placeholder="voce@email.com" /></label><label>Senha<input name="password" type="password" minLength={6} required placeholder="Mínimo 6 caracteres" /></label><button className="submit-button">Entrar <span>→</span></button></form><div className="auth-divider">ou crie sua conta</div><form action={signUp}><label>Como quer ser chamado?<input name="display_name" type="text" minLength={2} maxLength={40} required placeholder="Ex.: Rafa" /></label><label>E-mail<input name="email" type="email" required placeholder="voce@email.com" /></label><label>Senha<input name="password" type="password" minLength={6} required placeholder="Mínimo 6 caracteres" /></label><button className="outline-button">Criar conta gratuita</button></form></div></section>}
    <footer><a className="brand" href="#top"><span className="brand-icon"><BookOpen size={16} /></span>entre<span>páginas</span></a><span>Feito para quem lê junto. ♡</span></footer>
  </main>;
}
