'use server';
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import {redirect} from "next/navigation";

export async function verifyPassword(password: string) {
    const cookieStore = await cookies();
    const email = cookieStore.get("email")?.value;
    const step = cookieStore.get("step")?.value;

    if (!email || !step) {
        redirect("/auth/email");
    }

    const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
    });

    if(res?.error){
        return {error: "Invalid email or password"};
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