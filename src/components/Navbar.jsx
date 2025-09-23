'use client'
import { useSession } from 'next-auth/react'
import { Menu } from '@mui/icons-material'

export default function Navbar({ toggleSidebar }) {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Menu className="hamburger-menu" onClick={toggleSidebar} />
          <h1 className="navbar-title">SAEH Website Documentation</h1>
        </div>
      </div>
    </nav>
  )
}