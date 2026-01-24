import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PasswordForm from "./PasswordForm"

export default async function CreatePasswordPage() {
    const cookieStore = await cookies();
    const step = cookieStore.get("step")?.value;
    const email = cookieStore.get("email")?.value;
    const name = cookieStore.get("name")?.value;
    const role = cookieStore.get("role")?.value;

    if (step !== "REGISTER" || !email || !name || !role) {
        redirect("/auth/email");
    }
    return <PasswordForm email={email}/>
}
