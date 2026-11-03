import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AdminPanel } from "@/app/admin-panel";
import { NavigationMenu } from "@/app/navigation-menu";
import { signOut } from "@/controllers/auth-controller";
import { createClient } from "@/lib/supabase/server";
import type { Book } from "@/lib/types";
import { adminService } from "@/services/admin-service";
import { bookService } from "@/services/book-service";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== "rafaelmgreco@hotmail.com") notFound();

  let profiles: Awaited<ReturnType<typeof adminService.listProfiles>> = [];
  let books: Book[] = [];
  let loadError = false;
  try {
    [profiles, books] = await Promise.all([adminService.listProfiles(), bookService.list()]);
  } catch {
    loadError = true;
  }

  return <main className="shell admin-page">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-icon"><BookOpen size={19} /></span>entre<span>páginas</span></Link><div className="nav-right"><span className="nav-note">um clube, muitas histórias</span><NavigationMenu isAdmin /><form action={signOut}><button className="text-button">Sair</button></form></div></nav>
    <header className="admin-page-heading"><Link href="/#estante">← Voltar para a estante</Link><h1>Administração</h1><p>Gerencie as pessoas cadastradas e os livros compartilhados.</p></header>
    {loadError ? <div className="empty-state">Para ativar os dados administrativos, execute <code>supabase/admin_access.sql</code> no SQL Editor do Supabase e atualize a página.</div> : <AdminPanel profiles={profiles} books={books} />}
  </main>;
}
