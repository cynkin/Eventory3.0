import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm"

export default async function CreatePasswordPage() {
    const cookieStore = await cookies();
    const step = cookieStore.get("step")?.value;
    const email = cookieStore.get("email")?.value;

    if (step !== "EMAIL-CHECK" || !email) {
        redirect("/auth/email");
    }
    return <RegisterForm email={email}/>
}
