"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AddCertificate() {
  const { addToast } = useToast();
  const [courseName, setCourseName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [institution, setInstitution] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewInputRef = useRef<HTMLInputElement | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !file) {
      addToast({ type: 'error', title: 'Preencha os campos obrigatórios e selecione o arquivo' });
      return;
    }
    setSaving(true);

    try {
      const form = new FormData();
      form.append('courseName', courseName);
      form.append('duration', duration);
      form.append('description', description);
      // Normaliza datas para formato ISO (YYYY-MM-DD) sem timezone
      const normalizeDate = (d: string) => {
        if (!d) return '';
        // Garante que não haja timezone
        const [year, month, day] = d.split('-');
        return `${year}-${month}-${day}`;
      };
      form.append('startDate', normalizeDate(startDate));
      form.append('endDate', normalizeDate(endDate));
      form.append('institution', institution);
      form.append('file', file);
      if (previewBlob) form.append('preview', previewBlob, 'preview.png');

      const res = await fetch('/api/cursos/certificados', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Erro ao salvar');
      }

      addToast({ type: 'success', title: 'Certificado salvo com sucesso' });
      // redirect back
      window.location.href = '/dashboard/cursos/certificados';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      addToast({ type: 'error', title: (err as Error).message || 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Adicionar Certificado</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 max-w-xl">
        <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Nome do curso*" className="p-2 border rounded" />
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duração (ex: 40h)" className="p-2 border rounded" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="p-2 border rounded" />
        <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="p-2 border rounded" />
        <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="p-2 border rounded" />
        <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Instituição" className="p-2 border rounded" />
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              setFileError(null);
              const f = e.target.files?.[0] || null;
              if (!f) {
                setFile(null);
                setPreviewBlob(null);
                setPreviewUrl(null);
                return;
              }
              // validation: max 10MB
              const maxBytes = 10 * 1024 * 1024;
              if (f.size > maxBytes) {
                setFileError('Arquivo muito grande. Máx 10 MB.');
                setFile(null);
                setPreviewBlob(null);
                setPreviewUrl(null);
                return;
              }
              // validation: allowed types
              const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
              if (!allowed.includes(f.type)) {
                setFileError('Tipo de arquivo inválido. Use PDF ou imagem (PNG/JPEG).');
                setFile(null);
                setPreviewBlob(null);
                setPreviewUrl(null);
                return;
              }
              setFile(f);

              // generate preview (PDF -> PNG via pdfjs, images via canvas)
              (async () => {
                try {
                  setPreviewBlob(null);
                  setPreviewUrl(null);
                  if (f.type === 'application/pdf') {
                    // Tipagem para pdfjs-dist
                    const pdfjs: typeof import('pdfjs-dist/legacy/build/pdf') = await import('pdfjs-dist/legacy/build/pdf');
                    // @ts-expect-error: GlobalWorkerOptions não tipado corretamente
                    pdfjs.GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || {};
                    pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/legacy/build/pdf.worker.min.js';
                    const arrayBuffer = await f.arrayBuffer();
                    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      await page.render({ canvasContext: ctx, viewport }).promise;
                      await new Promise<void>((res) => canvas.toBlob((b) => { if (b) { setPreviewBlob(b); setPreviewUrl(URL.createObjectURL(b)); } res(); }, 'image/png'));
                    }
                  } else if (f.type.startsWith('image/')) {
                    const imgBitmap = await createImageBitmap(f);
                    const canvas = document.createElement('canvas');
                    const maxW = 1200;
                    const scale = Math.min(1, maxW / imgBitmap.width);
                    canvas.width = Math.round(imgBitmap.width * scale);
                    canvas.height = Math.round(imgBitmap.height * scale);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);
                      await new Promise<void>((res) => canvas.toBlob((b) => { if (b) { setPreviewBlob(b); setPreviewUrl(URL.createObjectURL(b)); } res(); }, 'image/png'));
                    }
                  }
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn('preview generation failed', err);
                }
              })();
            }}
          />

          {/* Preview upload controls */}
          <input
            ref={previewInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const pf = e.target.files?.[0] || null;
              if (!pf) return;
              const maxBytes = 2 * 1024 * 1024; // 2MB for preview
              if (pf.size > maxBytes) {
                setFileError('Preview muito grande. Máx 2 MB.');
                return;
              }
              setPreviewBlob(pf);
              setPreviewUrl(URL.createObjectURL(pf));
            }}
          />

          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? 'Trocar arquivo' : 'Escolher arquivo'}
          </Button>

          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            {file ? file.name : 'Nenhum arquivo selecionado'}
          </div>
        </div>
        {fileError && <div className="text-sm text-red-600 mt-1">{fileError}</div>}
        {previewUrl && (
          <div className="mt-3">
            {/* Apenas a imagem de preview, sem borda extra ou microcard */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Pré-visualização do certificado" className="max-w-xs rounded" />
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </div>
  );
}
