import React from 'react'
import NavBar from '@/components/NavBar'
import NavBarMobile from '@/components/NavBarMobile'
import Sidebar from '@/components/Sidebar'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmationProvider } from '@/components/ui/confirmation'


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <ConfirmationProvider>
        <main className=' grid lg:grid-cols-5'>
          <div className='hidden lg:block lg:col-span-1 lg:min-h-screen'>
            <Sidebar />
          </div>
          <div className='lg:col-span-4'>
            <NavBarMobile className='block lg:hidden' />
            <NavBar className='hidden lg:flex' />
            <div className='py-16 px-4 sm:px-8 lg:px-16'>
              {children}
            </div>
          </div>
        </main>
      </ConfirmationProvider>
    </ToastProvider>
  )
}

export default DashboardLayout
