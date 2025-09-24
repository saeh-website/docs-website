import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prismaPostgres } from '@/lib/prismaPostgres'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter your username and password')
        }

        const user = await prismaPostgres.user.findUnique({
          where: { username: credentials.username },
          include: {
            userDomains: {
              include: {
                domain: true,
              },
            },
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials')
        }
        
        // Return a custom user object for the session
        return {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          role: user.role,
          userDomains: user.userDomains.map(ud => ({
            domainId: ud.domain.id,
            domainName: ud.domain.name,
            userRole: ud.userRole || user.role, // 👈 fallback to global role
            isDefault: ud.isDefault,
          })),
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token.currentDomain = session.user.currentDomain
        token.requiresDomainSelection = session.user.requiresDomainSelection
        token.role = session.user.role || null
      }

      if (user) {
        token.id = user.id
        token.username = user.username
        token.profilePicture = user.profilePicture
        token.role=user.role
        token.userDomains = user.userDomains

        const defaultDomain = user.userDomains?.find(d => d.isDefault)
        if (defaultDomain) {
          token.currentDomain = defaultDomain
        } else if (user.userDomains?.length === 1) {
          token.currentDomain = user.userDomains[0]
        } else {
          token.currentDomain = null
        }
        
        // token.role = "superadmin"

        if (token.currentDomain && !token.currentDomain.userRole) {
          token.currentDomain.userRole = token.role
        }

        token.requiresDomainSelection = user.userDomains?.length > 1

      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          profilePicture: token.profilePicture,
          role: token.role,
          userDomains: token.userDomains,
          currentDomain: token.currentDomain,
          role: token.role,
          requiresDomainSelection: token.requiresDomainSelection,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }