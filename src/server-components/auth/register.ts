'use server';
import { cookies } from "next/headers";
import {redirect} from "next/navigation";

export async function register(name : string, role : string) {
    const cookieStore = await cookies();
    const email = cookieStore.get("email")?.value;
    const step = cookieStore.get("step")?.value;

    if (!email || !step) {
        redirect("/auth/email");
    }

    cookieStore.set("step", "REGISTER", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path: "/auth"
    })

    cookieStore.set("name", name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path: "/auth"
    });

    cookieStore.set("role", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path :"/auth"
    });
    redirect("/auth/create-password");
}