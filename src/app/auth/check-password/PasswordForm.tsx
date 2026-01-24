'use client';
import Image from "next/image"
import logo from "@/images/logo.png"
import {verifyPassword} from "@/server-components/auth/verify-password";
import React, { useState } from "react";
import Link from "next/link";

const inputStyle = " my-6 placeholder:text-[#222] focus:outline-none focus:ring-2 focus:ring-[#1568e3] w-full border py-3.5 px-4 text-lg tracking-wide border-gray-400 rounded-lg"
const buttonStyle = "w-full transition-all duration-200 tracking-wider  rounded-full px-9 py-3.5 text-lg font-semibold mt-8 bg-[#1568e3] text-white hover:bg-[#0d4eaf]"

export default function PasswordForm({email} : {email : string}) {

    const [password, setPassword] = useState('');
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        //const formData = new FormData(e.currentTarget);
        //const password = formData.get("password") as string;

        const res = await verifyPassword(password);
        if(res?.error) setError(res.error);
    }

    return (
        <>
            <Image src={logo} alt="logo" className="m-9" width={200} height={120}/>
            <div className="self-start text-3xl tracking-wide font-semibold">Enter your password</div>
            <div className="mt-2 pl-4 self-start text-md">
                <div>Email</div>
                <div className="tracking-wide text-lg">{email}</div>
            </div>


            <form onSubmit={handleSubmit} className="w-full ">
                <input type="password" name="password" placeholder="Password" className={inputStyle}
                       value={password} onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                }}/>

                <Link href={`/login/email/verification?forgot=true&&email=${email}&register=false`}
                      className="text-lg text-blue-500">Forgot password?</Link>
                <button type="submit"
                        className={buttonStyle}>
                    Sign in
                </button>
                {error && <div className="text-lg text-red-500 mt-4 transition-all duration-400">{error}</div>}
            </form>
        </>
    )
}