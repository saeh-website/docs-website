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
    <>
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <main style={{ marginTop: '100px', padding: '2rem' }}>
        {children}
      </main>
    </>
  )
}
