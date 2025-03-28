import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from './lib/prisma'
import GoogleProvider from "next-auth/providers/google"
// import GithubProvider from "next-auth/providers/github"
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Uncomment and configure for GitHub if needed
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    async jwt({ token, user, session, trigger }): Promise<JWT> {
      if (trigger === "update" && session?.username) {
        token.name = session.name
        token.username = session.username
        token.image = session.image
      }

      if (user) {
        return {
          ...token,
          id: user.id as string,
          username: user.username,
          image: user.image,
        }
      }
      return token
    },

    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          image: token.image as string,
          username: token.username as string |null,
        }
      }
      return session
    },
  },
  session: {strategy: "jwt"},
  secret: process.env.NEXT_PUBLIC_SECRET,
})
