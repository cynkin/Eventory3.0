'use client'
import Link from "next/link";
import logo from "@/images/logo.png"
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";
import Profile from "@/components/main/Profile";

export default function Header() {
    return(
        <>
            <div className="flex justify-between xl:px-44 transition-all duration-1000 dark:bg-[#191e3b] shadow-md">
                <div className="w-full flex items-center">
                    <Link href="/" className="">
                        <Image src={logo} alt="logo" className="m-6" width={200} height={120}/>
                    </Link>
                    <SearchBar/>
                </div>
                <Profile/>
            </div>
            <div className="h-[1px] bg-gray-300 relative">
                <div className="absolute left-0 right-0 w-full h-[4px] bg-gradient-to-b from-gray-300 to-transparent" />
            </div>
        </>
    )
}