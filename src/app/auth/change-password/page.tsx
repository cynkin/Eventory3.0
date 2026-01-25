import {auth} from "@/auth"
import {redis} from "@/lib/db";
import {redirect} from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";
export default async function ChangePassword(){
    const session = await auth();

    if(!session?.user?.email){
        redirect("/auth/email");
    }
    const email = session.user.email;
    const verified = await redis.get(
        `otp:verified:CHANGE_PASSWORD:${email}`,
    );

    if(!verified){
        redirect("/account/settings");
    }
    return (<ChangePasswordForm email={email}/>);
}