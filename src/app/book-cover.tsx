"use client";

import { useState } from "react";
import Image from "next/image";

export function BookCover({ title, src }: { title: string; src: string }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`cover${missing ? " cover-missing" : ""}`}>
      {!missing && <Image src={src} alt={`Capa de ${title}`} fill sizes="(max-width: 700px) 42vw, 190px" unoptimized onError={() => setMissing(true)} />}
      {missing && <div className="cover-placeholder"><span>ENTRE PÁGINAS</span><strong>{title}</strong><small>capa em breve</small></div>}
    </div>
  );
}
