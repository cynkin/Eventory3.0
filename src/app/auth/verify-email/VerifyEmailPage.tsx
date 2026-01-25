'use client';
import Image from "next/image"
import logo from "@/images/logo.png"
import React, {useEffect, useState} from "react";
import {sendOTP} from "@/lib/email/sendOTP";
import Spinner from "@/components/ui/Spinner";
import {verifyEmail} from "@/server-components/auth/verify-email";

type VerifyOTPResult =
    | { success: true }
    | { success: false; error: string };


const inputStyle = " my-6 placeholder:text-[#222] focus:outline-none focus:ring-2 focus:ring-[#1568e3] w-full border py-3.5 px-4 text-lg tracking-wide border-gray-400 rounded-lg"
const buttonStyle = "w-full transition-all duration-200 tracking-wider  rounded-full px-9 py-3.5 text-lg font-semibold mt-3 bg-[#1568e3] text-white hover:bg-[#0d4eaf]"

export default function VerifyEmailPage({email}: {email: string}) {
    const [otp, setOTP] = useState('');
    const [error, setError] = useState("");
    const hasSentRef = React.useRef(false);

    const [cooldown, setCooldown] = useState(0);
    const COOLDOWN_TIME = 60; // seconds

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((c) => c - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);


    async function handleSendOtp() {
        try {
            setError("");
            await sendOTP({purpose:"VERIFY_EMAIL", passed_email: email});
            setCooldown(COOLDOWN_TIME);
        } catch {
            setError("Failed to send OTP. Please try again later.");
        }
    }

    useEffect(() => {
        if (hasSentRef.current) return;
        hasSentRef.current = true;

        sendOTP({purpose:"VERIFY_EMAIL", passed_email: email})
            .then(() => {
                setCooldown(COOLDOWN_TIME);
            })
            .catch(() => {
                setError("Failed to send OTP. Please try again later.");
            });
    }, []);

    const verifyOTP = async(): Promise<VerifyOTPResult> =>{
        if(!email) return {success: false, error: "No email found in session"};
        const res = await fetch(`/api/auth/verify-otp`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                otp,
                purpose: "VERIFY_EMAIL",
                passed_email: email
            })
        });
        const data = await res.json();
        if(!res.ok) return {success: false, error: data.error};
        return {success: true};
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const res = await verifyOTP();
        if(!res.success){
            setError(res.error);
            return;
        }
        try {
            await verifyEmail();
        } catch {
            setError("Failed to verify email. Try again.");
        }
    }

    return (
        <div className="flex justify-center items-center">
            <div className="w-115">
                <div className="flex flex-col items-center ">
                    <Image src={logo} alt="logo" className="m-9" width={200} height={120} />
                    <div className="self-start text-3xl tracking-wide font-semibold">Let&#39;s confirm your email</div>
                    <div className="mt-2 pl-2 self-start text-gray-700 text-md">
                        <div>To continue, enter the secure code sent to {email}. Check junk mail if it’s not in your inbox.</div>
                        <div className="tracking-wide text-lg"></div>
                    </div>


                    <form onSubmit={handleSubmit} className="w-full" method="post">
                        <input type="text" name="otp" placeholder="6-digit code" className={inputStyle}
                               value={otp} onChange={(e) => {setOTP(e.target.value); setError("");}}/>

                        <button type="submit"
                                className={buttonStyle}>
                            Continue
                        </button>
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={cooldown > 0}
                            className="mt-4 text-sm text-[#1568e3] hover:underline disabled:text-gray-400"
                        >
                            {cooldown > 0
                                ? `Resend OTP in ${cooldown}s`
                                : "Resend OTP"}
                        </button>
                        {error && <div className="text-lg text-red-500 mt-4 transition-all duration-400">{error}</div>}
                    </form>
                </div>
            </div>
        </div>

    )
}