import React from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

/**
 * Botão de voltar padronizado para cabeçalhos de páginas
 * Aparência sutil, com ícone e tamanho compacto
 */
export const BackButton: React.FC<BackButtonProps> = ({ href, label = 'Voltar', className }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={`p-0 bg-transparent border-none outline-none hover:bg-transparent active:bg-transparent focus:bg-transparent ${className ?? ''}`}
      onClick={() => startTransition(() => router.push(href))}
      disabled={isPending}
      aria-label={label}
    >
      {isPending ? (
        <span className='inline-flex items-center gap-2'>
          <span className='size-3 border-2 border-current/60 border-t-transparent rounded-full animate-spin' aria-hidden />
        </span>
      ) : (
        <ArrowLeft className="size-4" />
      )}
    </button>
  );
};

export default BackButton;
