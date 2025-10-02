import React from 'react';
import LinksDropdown from './LinksDropdown';
import ThemeToggle from './ThemeToggle';
import { UserButton } from '@clerk/nextjs';

interface NavBarMobileProps {
  className?: string;
}

const NavBarMobile = ({ className }: NavBarMobileProps) => {
  return (
    <nav className={`px-4 py-3 flex items-center justify-between bg-[color:var(--color-sidebar)] text-[color:var(--color-sidebar-foreground)] w-full shadow-sm  ${className || ''}`}>
      <div className="flex items-center w-full">
        <LinksDropdown />
      </div>
      <div className="flex items-center gap-x-3">
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  );
};

export default NavBarMobile;
