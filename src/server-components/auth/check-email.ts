'use server'
import prisma from '@/lib/db';
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function checkEmail(email: string) {
    const user = await prisma.users.findUnique({
        where: {email: email}
    });

    const cookieStore = await cookies();
    cookieStore.set("step", "EMAIL-CHECK", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path: "/auth"
    });

    cookieStore.set("email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 600, // 10 minutes
        path :"/auth"
    });

    if(!user){
        redirect("/auth/verify-email");
    }
    redirect("/auth/check-password");
}