'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SelectDomainPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [selectedDomain, setSelectedDomain] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && !session?.user.requiresDomainSelection) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleDomainSelection = async (domain) => {
    // Here we would call an API to update the session
    // For now, we can try to use the 'update' function from useSession
    const newSession = await update({
      ...session,
      user: {
        ...session.user,
        currentDomain: domain,
        requiresDomainSelection: false,
      },
    })
    
    if (newSession) {
      router.push('/dashboard')
    } else {
      setError('Failed to update session. Please try again.')
    }
  }
  
  const handleSetDefault = async (domainId) => {
    setError('');
    try {
      const res = await fetch('/api/domains/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId }),
      });

      if (!res.ok) {
        throw new Error('Failed to set default domain');
      }

      // Optionally, show a success message to the user
      alert('Default domain set successfully!');
      
      // Refresh the session to get the latest user data
      // which will include the updated isDefault flag.
      // This will automatically cause a re-render.
      await getSession();

    } catch (err) {
      setError(err.message);
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/')
    return null
  }

  if (!session?.user.requiresDomainSelection) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
      <div className="w-11/12 md:w-2/5 my-20 mx-auto p-8 border-4 border-[#191919] rounded-3xl bg-white shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/saehlogo.png"
            alt="SAEH Logo"
            width={300}
            height={100}
            style={{ width: '30%', height: 'auto' }}
          />
        </div>
        <h1 className="text-3xl font-bold text-center mb-6 text-[#191919]">
          Select a Domain
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="space-y-4">
          {session.user.userDomains.map((domain) => (
            <div key={domain.domainId} className="flex items-center justify-between p-4 border rounded-lg">
              <span>{domain.domainName}</span>
              <div>
                <button
                  onClick={() => handleDomainSelection(domain)}
                  className="bg-[#e01f26] text-white font-bold py-2 px-4 rounded-lg hover:opacity-80 transition-opacity duration-300 mr-2"
                >
                  Select
                </button>
                <button
                  onClick={() => handleSetDefault(domain.domainId)}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                  Set as Default
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
