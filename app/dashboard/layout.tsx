import React from 'react'

const DashboardLayout = ({ children }: { children: React.ReactNode }  ) => {
  return (
    <div className='p-4'>
      {children}
    </div>
  )
}

export default DashboardLayout
