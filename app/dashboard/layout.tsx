import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import NavBar from '@/components/NavBar'
import NavBarMobile from '@/components/NavBarMobile'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmationProvider } from '@/components/ui/confirmation'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  // Se não estiver autenticado, redireciona para login
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <ToastProvider>
      <ConfirmationProvider>
        <main className='grid lg:grid-cols-5 min-h-screen'>
          <div className='hidden lg:block lg:col-span-1 lg:min-h-screen'>
            <Sidebar />
          </div>
          <div className='lg:col-span-4 flex flex-col'>
            <NavBarMobile className='block lg:hidden' />
            <NavBar className='hidden lg:flex' />
            <div className='flex-1 py-8 px-4 sm:px-8 lg:px-12'>
              {children}
            </div>
          </div>
        </main>
      </ConfirmationProvider>
    </ToastProvider>
  )
}

export default DashboardLayout
