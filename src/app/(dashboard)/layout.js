'use client'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { useState } from 'react'

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex h-screen pt-20">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
        <main className={`flex-grow p-8 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:mr-[250px]' : 'mr-0'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
