import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata = {
  title: 'SAEH Website Documentation',
  description: 'Documentation platform for SAEH',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ar" dir="rtl">
      <body>
        {session && <Navbar />}
        {session && <Sidebar session={session} />}
        <main style={{ marginTop: session ? '80px' : '0', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}