'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
      <div className="w-11/12 md:w-2/5 my-20 mx-auto p-8 border-4 border-[#191919] rounded-3xl bg-white shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/saehlogo.png"
            alt="SAEH Logo"
            width={300} // Adjust width as needed, maintaining aspect ratio
            height={100} // Adjust height as needed
            style={{ width: '30%', height: 'auto' }}
          />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6 text-[#191919]">
          تسجيل الدخول
        </h1>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-right mb-2 font-bold">اسم المستخدم</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6884f4]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-right mb-2 font-bold">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6884f4]"
              required
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#e01f26] text-white font-bold py-3 px-6 rounded-lg hover:opacity-80 transition-opacity duration-300"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
