import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import links from '@/utils/links'
import { AlignLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const LinksDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='lg:hidden'>
        <Button variant='outline' size='icon'>
          <AlignLeft size={16} />
          <span className='sr-only'>Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-52 lg:hidden'
        align='start'
        sideOffset={25}>

        {links.map((link) => (
          <DropdownMenuItem key={link.href} className="justify-start">
            <Link href={link.href} className='flex items-center gap-x-2 w-full text-left'>
              {link.icon} <span className='capitalize'>{link.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LinksDropdown
