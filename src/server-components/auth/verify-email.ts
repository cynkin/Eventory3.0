'use server'
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function verifyEmail() {
    const cookieStore = await cookies();

    const email = cookieStore.get("email")?.value;
    const step = cookieStore.get("step")?.value;
    if(!step || !email){
        redirect("/auth/email")
    }

    cookieStore.set("step", "VERIFIED_EMAIL", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 300, // 5 minutes
        path: "/auth"
    });

    redirect("/auth/register");
}