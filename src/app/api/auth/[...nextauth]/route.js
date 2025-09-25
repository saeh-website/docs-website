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
        if (!credentials?.username || !credentials?.password)
          throw new Error("Please enter your username and password");

        const user = await prismaPostgres.user.findUnique({
          where: { username: credentials.username },
          include: {
            userDomains: {
              include: {
                domain: true,
                userRole: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
            currentDomain: {
              include: {
                domain: true,
                userRole: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.password) throw new Error("Invalid credentials");

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) throw new Error("Invalid credentials");

        // Return a processed user object for the JWT callback
        return {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          userDomains: user.userDomains,
          currentDomain: user.currentDomain,
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.profilePicture = user.profilePicture;

        // Simplify userDomains for the token, removing detailed permissions
        token.userDomains = user.userDomains.map((ud) => ({
          id: ud.id,
          domain: ud.domain,
          roleName: ud.userRole.name,
        }));

        // Determine current domain and extract its permissions
        const currentDomain = user.currentDomain || user.userDomains[0] || null;

        if (currentDomain) {
          const permissions = currentDomain.userRole.rolePermissions.map(
            (rp) => ({
              name: rp.permission.name,
              scopeAllDomains: rp.scopeAllDomains,
            })
          );
          token.currentDomain = {
            id: currentDomain.id,
            domain: currentDomain.domain,
            roleName: currentDomain.userRole.name,
            permissions: permissions,
          };
        } else {
          token.currentDomain = user.userDomains[0];
        }
        token.requiresDomainSelection = !token.currentDomain;
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
          requiresDomainSelection: token.requiresDomainSelection,
        };
      }
      return session;
    },
  },

  pages: { signIn: "/" },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
