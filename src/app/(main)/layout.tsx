import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return(
    <>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
    </>
    )
}