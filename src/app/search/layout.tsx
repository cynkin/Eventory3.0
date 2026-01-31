import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";
import { SessionProvider } from "next-auth/react";

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SessionProvider>
                <Header />
                <main className="flex-grow min-h-[60vh]">{children}</main>
            </SessionProvider>
            <Footer />
        </>
    );
}
