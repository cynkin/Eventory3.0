'use client';
import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";
import SidePanel from "./SidePanel";
import {useSearchParams} from "next/navigation";

export default function MainLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
})
{
    const searchParams = useSearchParams();
    const edit = searchParams.get('edit');
    return(
        <>
            <Header />
            <main className="flex-grow">
                <div className="flex xl:px-44 text-[#151515] transition-all duration-1100">
                    <div className="w-full flex flex-row">
                        {!edit && <SidePanel/> }
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}