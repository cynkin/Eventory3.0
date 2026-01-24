// src/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import prisma from "@/lib/db";
import { comparePassword } from "@/lib/utils/hash";

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(prisma),

    providers: [
        // -----------------------------
        // CREDENTIALS LOGIN
        // -----------------------------
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;
                if (!email || !password) {
                    return null;
                }

                const user = await prisma.users.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await comparePassword(password, user.password);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    pic : user.pic,
                    balance: Number(user.balance),
                    isGoogle: false,
                };
            },
        }),

        // -----------------------------
        // GOOGLE OAUTH
        // -----------------------------
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
        async jwt({ token, user, account, trigger }) {
            if (user && account?.provider === "credentials") {
                token.id = user.id;
                token.role = user.role;
                token.pic = user.pic;
                token.balance = user.balance;
                token.isGoogle = false;
            }

            if(trigger === "update"){
                const user = await prisma.users.findUnique({
                    where: {id: token.id}
                });

                if(user){
                    token.name = user.name;
                    token.balance = user.balance;
                    token.pic = user.pic;
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.balance = token.balance as number;
                session.user.pic = token.pic as string;
                session.user.isGoogle = token.isGoogle as boolean;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
});
