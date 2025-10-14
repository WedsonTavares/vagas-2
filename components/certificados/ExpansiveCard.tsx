"use client";
import React from 'react';
import type { Certificate } from '@/types';

export function ExpansiveCard({ data }: { data: Certificate }) {
  // Removido estado de expansão, agora controlado pelo card principal
  // Verifica se há dados principais do certificado
  const hasData = !!(data && (data.courseName || data.institution || data.duration || data.startDate || data.endDate));

  // Formata data YYYY-MM-DD para locale sem aplicar timezone (evita retroceder 1 dia)
  const fmt = (isoDate?: string | null) => {
    if (!isoDate) return 'N/A';
    // aceita tanto 'YYYY-MM-DD' quanto ISO completo; pega apenas a parte de data
    const [y, m, d] = isoDate.split('T')[0].split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return 'N/A';
    // Usa Date.UTC para não aplicar timezone local
    const utc = new Date(Date.UTC(y, m - 1, d));
    return utc.toLocaleDateString();
  };

  if (!hasData) {
    return (
      <div className="text-center text-muted-foreground py-6">
        Certificado não encontrado ou dados incompletos.
      </div>
    );
  }

  // ExpansiveCard agora só mostra os detalhes, sem imagem ou preview
  return (
    <div className="space-y-2 border rounded-lg shadow-md bg-background p-6">
      <div>
        <span className="font-medium">Duração:</span> {data?.duration || 'N/A'}
      </div>
      <div>
        <span className="font-medium">Data de Início:</span> {fmt(data?.startDate)}
      </div>
      <div>
        <span className="font-medium">Data de Conclusão:</span> {fmt(data?.endDate)}
      </div>
      <div>
        <span className="font-medium">Instituição:</span> {data?.institution || 'N/A'}
      </div>
      <div>
        <span className="font-medium">Nome do Curso:</span> {data?.courseName || 'N/A'}
      </div>
    </div>
  );
}
