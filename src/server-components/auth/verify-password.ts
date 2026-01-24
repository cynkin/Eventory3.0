'use server';
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import {redirect} from "next/navigation";
import { AuthError } from "next-auth";

export async function verifyPassword(password: string) {
    const cookieStore = await cookies();
    const email = cookieStore.get("email")?.value;
    const step = cookieStore.get("step")?.value;

    if (!email || !step) {
        redirect("/auth/email");
    }

    try{
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
    } catch(err){
        if (err instanceof AuthError) {
            if (err.type === "CredentialsSignin") {
                return { error: "Invalid email or password" };
            }
        }
        throw err; // unknown error
    }

    cookieStore.delete({
        name: "step",
        path: "/auth",
    });

    cookieStore.delete({
        name: "email",
        path: "/auth",
    });

    redirect("/");
}