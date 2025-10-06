'use client';

import { useTheme } from 'next-themes';
import React from 'react';
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='flex items-center justify-center bg-[color:var(--color-muted)] text-[color:var(--color-primary-foreground)] dark:bg-[color:var(--color-sidebar)] dark:text-[color:var(--color-sidebar-foreground)]'
        >
          <span className='relative flex items-center justify-center w-6 h-6'>
            <SunIcon className='absolute transition-all duration-300 h-[1.2rem] w-[1.2rem] text-[color:var(--color-primary)] dark:opacity-0 dark:scale-0' />
            <MoonIcon className='absolute transition-all duration-300 h-[1.2rem] w-[1.2rem] text-[color:var(--color-primary)] opacity-0 scale-0 dark:opacity-100 dark:scale-100' />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='center'
        sideOffset={8}
        className='min-w-[120px] bg-[color:var(--color-popover)] text-[color:var(--color-popover-foreground)]'
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className='text-[color:var(--color-popover-foreground)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]'
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className='text-[color:var(--color-popover-foreground)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]'
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className='text-[color:var(--color-popover-foreground)] hover:bg-[color:var(--color-accent)] hover:text-[color:var(--color-accent-foreground)]'
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
