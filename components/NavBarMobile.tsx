/**
 * NavBarMobile: Navbar otimizada para dispositivos móveis
 * 
 * Melhorias implementadas:
 * - Layout mais responsivo e espaçado
 * - Melhor integração com o dropdown menu
 * - Suporte a cores customizadas
 * - Sombra suave e bordas arredondadas
 * - Posicionamento aprimorado dos elementos
 */

import React from 'react';
import LinksDropdown from './LinksDropdown';
import ThemeToggle from './ThemeToggle';
import { UserButton } from '@clerk/nextjs';

interface NavBarMobileProps {
  className?: string;
}

const NavBarMobile = ({ className }: NavBarMobileProps) => {
  return (
    <nav className={`
      sticky top-0 z-40 w-full border-b border-[color:var(--color-border)]
      bg-[color:var(--color-background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-background)]/60
      px-4 py-3 flex items-center justify-between
      shadow-sm transition-colors duration-200
      ${className || ''}
    `}>
      {/* Lado esquerdo - Menu dropdown */}
      <div className="flex items-center">
        <LinksDropdown />
        <div className="ml-3 lg:hidden">
          <h1 className="text-lg font-semibold text-[color:var(--color-foreground)]">
            Controle Vagas
          </h1>
        </div>
      </div>
      
      {/* Lado direito - Theme toggle e User button */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="border-l border-[color:var(--color-border)] pl-3">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8"
              }
            }}
          />
        </div>
      </div>
    </nav>
  );
};

export default NavBarMobile;
