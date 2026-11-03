"use client";
import Link from "next/link";
import { Menu as MenuIcon } from "lucide-react";

export function NavigationMenu({ isAdmin }: { isAdmin: boolean }) {
  return <details className="nav-menu">
    <summary aria-label="Abrir menu de navegação" title="Navegação"><MenuIcon size={20} strokeWidth={1.8} /><span className="sr-only">Menu de navegação</span></summary>
    <div className="nav-menu-items">
      <Link href="/#top">Início</Link>
      <Link href="/#estante">Nossa estante</Link>
      <Link href="/minha-colecao">Minha coleção</Link>
      <Link href="/#perfil">Meu perfil</Link>
      {isAdmin && <Link href="/admin">Administração</Link>}
    </div>
  </details>;
}
