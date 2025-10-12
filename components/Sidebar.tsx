'use client';

import { usePathname } from 'next/navigation';
import React, { use } from 'react';
import Logo from '../assets/logo.png';
import Image from 'next/image';
import links from '@/utils/links';
import { Button } from './ui/button';
import Link from 'next/link';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className='py-6 px-6 bg-[color:var(--sidebar)] h-full'>
      <Image src={Logo} alt='logo' className='mx-auto max-w-40' />
      <div className='flex flex-col mt-12 gap-y-3'>
        {links.map(link => (
          <Button
            asChild
            key={link.href}
            variant={pathname === link.href ? 'default' : 'ghost'}
            className='justify-start hover:bg-accent/50 transition-colors duration-200'
          >
            <Link
              href={link.href}
              className='flex items-center gap-x-3 w-full text-left'
            >
              {link.icon} <span className='capitalize'>{link.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
