// src/auth.config.ts
// Edge-safe NextAuth config. Contains NO Node-only imports (bcrypt, crypto, prisma),
// so it can run in the Edge middleware. The heavy Credentials provider and the
// prisma-backed jwt/signIn callbacks live in auth.ts (Node runtime only).
import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    pages: {
        signIn: "/auth/email",
    },

    session: {
        strategy: "jwt",
    },

    callbacks: {
        // Expose custom token fields on the session so the middleware (and the rest
        // of the app) can read role/balance/etc. straight from the decoded JWT.
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.balance = token.balance as number;
                session.user.pic = token.pic as string;
                session.user.isGoogle = token.isGoogle as boolean;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
