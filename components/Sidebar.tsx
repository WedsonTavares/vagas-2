'use client';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Logo from '../assets/logo.png';
import Image from 'next/image';
import links from '@/utils/links';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  const pathname = usePathname();
  // Estado para controlar quais grupos (por label) estão abertos — suporta múltiplos grupos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className='py-6 px-6 bg-[color:var(--sidebar)] h-full'>
      <Image src={Logo} alt='logo' className='mx-auto max-w-40' />
      <div className='flex flex-col mt-12 gap-y-3'>
        {links.map(link =>
          link.children ? (
            <div key={link.label}>
              {/* botão que abre/fecha o grupo; toda a linha é clicável */}
              <Button
                variant='ghost'
                className='justify-start hover:bg-accent/50 transition-colors duration-200 w-full cursor-pointer px-3 py-2 rounded'
                onClick={() => toggleGroup(link.label)}
                aria-expanded={!!openGroups[link.label]}
                aria-controls={`submenu-${link.label.replace(/\s+/g, '-')}`}
              >
                <div className='flex items-center gap-x-3 w-full'>
                  <div className='flex items-center'>
                    {link.icon}
                    <span className='ml-2 capitalize'>{link.label}</span>
                  </div>
                  <div className='ml-auto'>
                    {openGroups[link.label] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </div>
              </Button>

              {/* submenu com transição simples via max-height */}
              <div
                id={`submenu-${link.label.replace(/\s+/g, '-')}`}
                className='pl-6 overflow-hidden transition-[max-height] duration-200'
                style={{
                  maxHeight: openGroups[link.label]
                    ? `${(link.children?.length || 0) * 48}px`
                    : '0px',
                }}
              >
                <div className='flex flex-col gap-y-2'>
                  {link.children.map(child => (
                    <Button
                      asChild
                      key={child.href || child.label}
                      variant={pathname === child.href ? 'default' : 'ghost'}
                      className='justify-start hover:bg-accent/50 transition-colors duration-200'
                    >
                      <Link
                        href={child.href!}
                        className='flex items-center gap-x-3 w-full text-left'
                      >
                        {child.icon}
                        <span className='ml-2 capitalize'>{child.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Button
              asChild
              key={link.href || link.label}
              variant={pathname === link.href ? 'default' : 'ghost'}
              className='justify-start hover:bg-accent/50 transition-colors duration-200'
            >
              <Link
                href={link.href!}
                className='flex items-center gap-x-3 w-full text-left'
              >
                {link.icon} <span className='capitalize'>{link.label}</span>
              </Link>
            </Button>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
