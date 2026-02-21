import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HistoryPage from "./HistoryPage";
import { getUserTickets, getVendorTickets } from "@/server-components/account/getTickets";

export default async function Page() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/email");
    }

    const role = session.user.role ?? "user";
    const userId = session.user.id;

    if (role === "vendor") {
        const vendorData = await getVendorTickets(userId);
        return <HistoryPage role={role} vendorData={vendorData} />;
    }

    const userTickets = await getUserTickets(userId);
    return <HistoryPage role={role} userTickets={userTickets} />;
}