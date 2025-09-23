import Navbar from '@/components/Navbar'

export default function DashboardLayout({ children }) {
  // Session logic has been removed as it's now handled by the client components
  // that use the SessionProvider. We will add it back when we connect the real data.

  return (
    <>
      <Navbar />
      {/* The Sidebar is now rendered from within the Navbar component */}
      <main style={{ marginTop: '100px', padding: '2rem' }}>
        {children}
      </main>
    </>
  )
}
