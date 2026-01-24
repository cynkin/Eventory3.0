import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";
import {SessionProvider} from "next-auth/react";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return(
    <>
        <SessionProvider>
            <Header />
        </SessionProvider>
            <main className="flex-grow">{children}</main>
        <Footer />
    </>
    )
}