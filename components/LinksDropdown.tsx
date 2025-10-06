/**
 * LinksDropdown: Menu dropdown otimizado para mobile
 *
 * Melhorias implementadas:
 * - Estado controlado para fechar ao clicar em item
 * - Estilização aprimorada com cores customizadas
 * - Animações suaves e responsivas
 * - Melhor acessibilidade
 * - Indicador visual de página ativa
 * - Layout mais espaçoso e legível
 */

'use client';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import links from '@/utils/links';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const LinksDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  /**
   * handleItemClick: Fecha o dropdown ao clicar em um item
   */
  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className='lg:hidden'>
        <Button
          variant='outline'
          size='icon'
          className='bg-[color:var(--color-background)] border-[color:var(--color-border)] hover:bg-[color:var(--color-accent)] hover:border-[color:var(--color-primary)] transition-colors duration-200'
        >
          <AlignLeft size={18} />
          <span className='sr-only'>Menu de navegação</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-64 lg:hidden bg-[color:var(--color-popover)] border border-[color:var(--color-border)] shadow-lg rounded-lg p-2'
        align='start'
        sideOffset={8}
        alignOffset={-4}
      >
        {/* Header do menu */}
        <div className='px-3 py-2 mb-2'>
          <p className='text-sm font-medium text-[color:var(--color-muted-foreground)]'>
            Navegação
          </p>
        </div>

        <DropdownMenuSeparator className='bg-[color:var(--color-border)] mb-2' />

        {links.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <DropdownMenuItem
              key={link.href}
              className={`
                justify-start mb-1 last:mb-0 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-sm'
                    : 'hover:bg-[color:var(--color-accent)] text-[color:var(--color-foreground)]'
                }
              `}
              onClick={handleItemClick}
            >
              <Link
                href={link.href}
                className='flex items-center gap-3 w-full text-left py-2 px-1'
              >
                <span
                  className={`
                  ${
                    isActive
                      ? 'text-[color:var(--color-primary-foreground)]'
                      : 'text-[color:var(--color-muted-foreground)]'
                  }
                `}
                >
                  {link.icon}
                </span>
                <span
                  className={`
                  font-medium capitalize
                  ${
                    isActive
                      ? 'text-[color:var(--color-primary-foreground)]'
                      : 'text-[color:var(--color-foreground)]'
                  }
                `}
                >
                  {link.label}
                </span>
                {isActive && (
                  <div className='ml-auto w-2 h-2 bg-[color:var(--color-primary-foreground)] rounded-full opacity-75' />
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}

        {/* Footer do menu */}
        <DropdownMenuSeparator className='bg-[color:var(--color-border)] mt-2 mb-2' />
        <div className='px-3 py-1'>
          <p className='text-xs text-[color:var(--color-muted-foreground)] text-center'>
            Controle de Vagas
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinksDropdown;
