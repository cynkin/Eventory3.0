import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PasswordForm from "./PasswordForm"

export default async function CheckPasswordPage() {
    const cookieStore = await cookies();
    const step = cookieStore.get("step")?.value;
    const email = cookieStore.get("email")?.value;

    if (step !== "EMAIL-CHECK" || !email) {
        redirect("/auth/email");
    }
    return <PasswordForm email={email}/>
}
