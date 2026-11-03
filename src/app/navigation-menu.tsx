"use client";
import { Menu as MenuIcon } from "lucide-react";

export function NavigationMenu({ isAdmin }: { isAdmin: boolean }) {
  return <details className="nav-menu">
    <summary aria-label="Abrir menu de navegação" title="Navegação"><MenuIcon size={20} strokeWidth={1.8} /><span className="sr-only">Menu de navegação</span></summary>
    <div className="nav-menu-items">
      <a href="/#top">Início</a>
      <a href="/#estante">Nossa estante</a>
      <a href="/minha-colecao">Minha coleção</a>
      <a href="/#perfil">Meu perfil</a>
      {isAdmin && <a href="/admin">Administração</a>}
    </div>
  </details>;
}
