import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prismaPostgres } from '@/lib/prismaPostgres'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        domainId: { label: "Domain", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials.username || !credentials.password) {
          return null
        }

        const user = await prismaPostgres.user.findUnique({
          where: { username: credentials.username },
          include: {
            userDomains: {
              include: {
                domain: true
              }
            }
          }
        })

        if (!user) {
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)

        if (!passwordMatch) {
          return null
        }

        const userDomains = user.userDomains.map(ud => ({
          domainId: ud.domainId,
          domainName: ud.domain.name,
          userRole: ud.userRole
        }))

        // For doc_admin and superadmin, domain selection is not required
        const hasAdminRole = userDomains.some(ud => 
          ud.userRole === 'doc_admin' || ud.userRole === 'superadmin'
        )

        let selectedDomain = null
        if (hasAdminRole) {
          selectedDomain = userDomains[0]
        } else if (credentials.domainId) {
          selectedDomain = userDomains.find(ud => ud.domainId === credentials.domainId)
        }

        if (!selectedDomain && !hasAdminRole) {
          throw new Error('Domain selection required')
        }

        return {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          userDomains,
          currentDomain: selectedDomain,
          isAdmin: hasAdminRole
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }