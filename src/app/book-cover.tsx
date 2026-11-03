"use client";

import { useState } from "react";
import Image from "next/image";

export function BookCover({ title, src }: { title: string; src: string | null }) {
  const [missing, setMissing] = useState(!src);
  const imageSrc = !src ? "" : src.startsWith("/") || /^https?:\/\//i.test(src)
    ? src
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/book-covers/${src}`;
  return (
    <div className={`cover${missing ? " cover-missing" : ""}`}>
      {!missing && <Image src={imageSrc} alt={`Capa de ${title}`} fill sizes="(max-width: 700px) 42vw, 190px" unoptimized onError={() => setMissing(true)} />}
      {missing && <div className="cover-placeholder"><span>ENTRE PÁGINAS</span><strong>{title}</strong><small>capa em breve</small></div>}
    </div>
  );
}
