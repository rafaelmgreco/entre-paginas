import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "Entre Páginas — Clube de leitura", description: "Acompanhe e compare o progresso das suas leituras." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
