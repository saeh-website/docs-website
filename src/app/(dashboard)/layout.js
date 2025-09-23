import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Navbar />
      <Sidebar session={session} />
      <main style={{ marginTop: '80px', padding: '2rem' }}>
        {children}
      </main>
    </>
  )
}
