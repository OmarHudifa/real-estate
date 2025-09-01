"use client"

import Navbar from '@/components/Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import  Sidebar from "@/components/AppSidebar"

import React from 'react'
import { useGetAuthUserQuery } from '@/state/api'

const DashboardLayout = ({children}:{children:React.ReactNode}) => {

    const {data:authUser}=useGetAuthUserQuery()

  return (
    <SidebarProvider>
    <div className='min-h-full w-full bg-primary-100'>
        <Navbar/>
        <div style={{padding:`${NAVBAR_HEIGHT}px`}}>
            <main className='flex'>
                <Sidebar userType={authUser?.userRole.toLowerCase()}/>
                <div className='flex-grow transition-all duration-300'>
                  {children}
                </div>
            </main>
        </div>
    </div>
    </SidebarProvider>
  )
}

export default DashboardLayout