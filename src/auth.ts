// src/auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { comparePassword } from "@/lib/utils/hash";

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({

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
        async signIn({ user, account, profile}) {
            try {
                if (account?.provider === "google") {
                    if (!user.email) return false;

                    const existingUser = await prisma.users.findUnique({
                        where: {email: user.email},
                    });
                    console.log("Signin Google", user)
                    if (!existingUser) {
                        await prisma.users.create({
                            data: {
                                email: user.email,
                                name: user.name,
                                pic: user.image,
                                role: "user",
                                balance: 1000,
                                google_id: profile?.sub,
                                contact:{
                                    create: {},
                                }
                            },
                        });
                    }

                    return true;
                }
            } catch (err){
                console.error("Google sign-in failed:", err);
                return false;
            }
            return true;
        },

        async jwt({ token, user, account, trigger, session }) {
            if (user) {
                if (account?.provider === "credentials") {
                    token.id = user.id;
                    token.name = user.name;
                    token.email = user.email;
                    token.role = user.role;
                    token.pic = user.pic;
                    token.balance = Number(user.balance);
                    token.isGoogle = false;
                }
                if (account?.provider === "google" && user?.email) {
                    const dbUser = await prisma.users.findUnique({
                        where: { email: user.email},
                    });

                    if (dbUser) {
                        token.id = dbUser.id;
                        token.name = dbUser.name
                        token.email = dbUser.email;
                        token.role = dbUser.role;
                        token.balance = Number(dbUser.balance);
                        token.pic = dbUser.pic;
                        token.isGoogle = true;
                    }
                }
            }

            if (trigger === "update") {
                // If the caller passed balance directly (e.g. after payment), use it immediately
                const updateData = session as Record<string, any> | undefined;

                if (updateData?.balance !== undefined) {
                    token.balance = Number(updateData.balance);
                } else {
                    // Full refresh for other updates (name, pic, etc.)
                    const updated_user = await prisma.users.findUnique({
                        where: { id: token.id as string },
                        select: { name: true, balance: true, pic: true },
                    });

                    if (updated_user) {
                        token.name = updated_user.name;
                        token.balance = Number(updated_user.balance);
                        token.pic = updated_user.pic;
                    }
                }
            } else if (!user && token.id) {
                // On every normal request (page load, refresh, session fetch):
                // Sync balance from DB so the JWT never goes stale
                const freshUser = await prisma.users.findUnique({
                    where: { id: token.id as string },
                    select: { balance: true },
                });

                if (freshUser) {
                    token.balance = Number(freshUser.balance);
                }
            }

            return token;
        },

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

    secret: process.env.NEXTAUTH_SECRET,
});
