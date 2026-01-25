'use server';
import prisma from "@/lib/db";
import {hashPassword} from "@/lib/utils/hash";
import {auth} from "@/auth"
import {redirect} from "next/navigation";
import {redis} from "@/lib/db";

export async function updatePassword(password: string) {
    const session = await auth();
    if(!session?.user.id){
        redirect("/auth/email");
    }
    await redis.del(`otp:verified:CHANGE_PASSWORD:${session.user.email}`);
    const passwordHash = await hashPassword(password);
    await prisma.users.update({
        where :{id: session.user.id},
        data : {
            password:passwordHash,
        },
     });
    redirect("/account/settings");
}