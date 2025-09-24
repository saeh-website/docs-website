import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaPostgres } from "@/lib/prismaPostgres";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter your username and password");
        }

        const user = await prismaPostgres.user.findUnique({
          where: { username: credentials.username },
          include: {
            userDomains: { include: { domain: true } },
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordMatch) {
          throw new Error("Invalid credentials");
        }

        // Normalize return object for JWT
        return {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          userDomains: user.userDomains.map((ud) => ({
            domainId: ud.domain.id,
            domainName: ud.domain.name,
            userRole: ud.userRole,
            isDefault: ud.isDefault,
          })),
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.profilePicture = user.profilePicture;
        token.userDomains = user.userDomains || [];

        // Pick current domain
        let currentDomain =
          user.userDomains.find((d) => d.isDefault) ||
          (user.userDomains.length === 1 ? user.userDomains[0] : null);

        // Fallback: use first domain if exists
        if (!currentDomain && user.userDomains.length > 0) {
          currentDomain = user.userDomains[0];
        }

        token.currentDomain = currentDomain;
        token.role = currentDomain?.userRole || null;
        token.requiresDomainSelection = user.userDomains.length > 1;

        console.log("JWT Callback →", {
          username: token.username,
          role: token.role,
          currentDomain,
        });
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          profilePicture: token.profilePicture,
          userDomains: token.userDomains,
          currentDomain: token.currentDomain,
          role: token.role,
          requiresDomainSelection: token.requiresDomainSelection,
        };

        console.log("Session Callback →", session.user);
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
