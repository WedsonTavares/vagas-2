import React from 'react'
import LinksDropdown from './LinksDropdown'
import ThemeToggle from './ThemeToggle'
import { UserButton } from '@clerk/nextjs'

interface NavBarProps {
  className?: string;
}

const NavBar = ({ className }: NavBarProps) => {
  return (
    <nav className={`px-4 py-4 sm:px-16 lg:px-24 flex items-center justify-between bg-[color:var(--color-sidebar)] text-[color:var(--color-sidebar-foreground)] ${className || ''}`}>
      <div>
        <LinksDropdown />
      </div>
      <div className='flex items-center gap-x-4'>
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  )
}

export default NavBar
