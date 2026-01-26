'use client';

import {signIn} from "next-auth/react";
import logo from "@/images/logo.png"
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import delta from "@/images/delta.png";
import {checkEmail} from "@/server-components/auth/check-email";
import Link from "next/link";

export default function LoginPage() {
    const [error, setError] = useState("");

    async function credLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const result = await checkEmail(email);
        console.log(result, email);
    }

    const dAuthLogin = () => {
        const url = `https://auth.delta.nitt.edu/authorize?${new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_DAUTH_CLIENT_ID!,
            redirect_uri: process.env.NEXT_PUBLIC_DAUTH_REDIRECT_URI!,
            response_type: "code",
            scope: "profile email user",
            state: "1234567890",
            nonce: "1234567890",
            prompt: "consent",
        })}`;
        window.location.href = url;
    };

    return (
        <>
            <Link href="/" className="">
                <Image src={logo} alt="logo" className="m-9" width={200} height={120} />
            </Link>
            <div className="self-start text-3xl tracking-wide font-semibold">Sign in or create an account</div>
            <div className="self-start text-lg">Book tickets like never before!</div>
            <button onClick={() => signIn("google", {redirectTo :"/"})} className=" transition-all cursor-pointer duration-200  flex items-center tracking-wide w-full hover:bg-orange-600 bg-orange-500 rounded-lg pl-2 pr-9 py-2 text-white text-lg mt-10">
                <div className="w-11 h-auto self-start bg-white rounded-sm">
                    <FcGoogle className="p-2 w-full h-auto"/>
                </div>
                <div className="w-full flex justify-center">Sign in with Google</div>
            </button>
            <button onClick={dAuthLogin} className=" transition-all cursor-pointer duration-200  flex items-center tracking-wide w-full hover:bg-green-700 bg-green-600 rounded-lg pl-2 pr-9 py-2 text-white text-lg mt-5">
                <div className="w-11 h-auto self-start bg-white rounded-sm">
                    <Image src={delta} alt="delta logo" className="p-0.5 w-full h-auto"/>
                </div>
                <div className="w-full flex justify-center">Sign in with DAuth</div>
            </button>

            <div className="m-5">or</div>
            <form onSubmit={credLogin} className="w-full " method="GET">
                <input type="email" autoComplete="off" name="email" placeholder="Email" className="placeholder:text-[#222] focus:outline-none focus:ring-2 focus:ring-[#1568e3] w-full border py-3.5 px-4 text-lg tracking-wide border-gray-400 rounded-lg"/>
                <button type="submit" className="w-full cursor-pointer tracking-wider transition-all duration-200 bg-[#1568e3] hover:bg-[#0d4eaf] rounded-full px-9 py-3.5 text-white text-lg font-semibold mt-5">Continue</button>
                {error && <div className="text-red-500 mt-2">{error}</div>}
            </form>
        </>
    );
}
