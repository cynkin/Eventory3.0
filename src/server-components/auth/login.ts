'use server';
import prisma from "@/lib/db";
import {hashPassword} from "@/lib/utils/hash";
import { cookies } from "next/headers";
import { signIn } from "@/auth"
import {redirect} from "next/navigation";

export async function Login(password: string) {
    const cookieStore = await cookies();
    const email = cookieStore.get("email")?.value;
    const step = cookieStore.get("step")?.value;
    const name = cookieStore.get("name")?.value;
    const role = cookieStore.get("role")?.value;

    if (!email || !name || !role || !step) {
        redirect("/auth/email");
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.users.create({
        data : {
            email,
            name,
            role,
            password: passwordHash,
            contact :{
                create :{},
            }
        },
    });

    cookieStore.delete({
        name: "step",
        path: "/auth",
    });

    cookieStore.delete({
        name: "email",
        path: "/auth",
    });
    cookieStore.delete({
        name: "name",
        path: "/auth",
    });

    cookieStore.delete({
        name: "role",
        path: "/auth",
    });


    await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
    });
}