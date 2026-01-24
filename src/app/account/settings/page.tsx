'use client'
import { useSession} from "next-auth/react";
import {ChevronRight} from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
    const { data: session, status } = useSession();
    if(!session) return <div>Not logged in</div>;
    return(
        <>
            <div className="w-full border pt-13 pb-11 px-12 border-gray-300 rounded-xl m-5">
                <div className="text-3xl font-bold">
                    Security and Settings
                </div>

                <div className="text-[28px] font-medium mt-12">Sign in and Security</div>
                <div className="text-sm mb-5">Keep your account safe with a secure password and by signing out of devices you&#39;re not actively using</div>
                <div>
                    <Link href="/login/email/verification?change=email" className="flex items-center border rounded-xl p-3 border-gray-300 w-fit">
                        <div className="flex px-2 w-96 flex-col">
                            <span className="font-medium">Email</span>
                            <span className="text-sm">{session.user.email}</span>
                        </div>
                        <ChevronRight className=""/>
                    </Link>
                    <Link href="/login/email/verification?change=password" className="flex mt-4 items-center border rounded-xl p-3 border-gray-300 w-fit">
                        <div className="w-96 py-2 px-2 font-medium">Change Password</div>
                        <ChevronRight className=""/>
                    </Link>
                </div>

            </div>
        </>
    )
}