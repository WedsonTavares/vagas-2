"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Objetivos() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para a página de lista de objetivos
    router.replace("/dashboard/objetivos/lista");
  }, [router]);

  return null;
}
