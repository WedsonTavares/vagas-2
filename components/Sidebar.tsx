'use client'

import { usePathname } from 'next/navigation'
import React, { use } from 'react'
import Logo from '../assets/logo.png'
import Image from 'next/image'
import links from '@/utils/links'
import { Button } from './ui/button'
import Link from 'next/link'

const Sidebar = () => {

  const pathname = usePathname()

  return (
    <aside className='py-4 px-8 bg-muted h-full '>
      <Image src={Logo} alt='logo' className='mx-auto max-w-40' />
      <div className='flex flex-col mt-20 gap-y-4'>
        {links.map((link) => (
          <Button
            asChild
            key={link.href}
            variant={pathname === link.href ? 'default' : 'link'}
            className="justify-start">
            <Link href={link.href} className='flex items-center gap-x-2 w-full text-left'>
              {link.icon} <span className='capitalize'>{link.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
