'use server'
import {redis} from "@/lib/db";
import {sendOTPLimiter} from "@/lib/utils/ratelimit";
import { headers } from "next/headers";
import {sendEmail} from "@/lib/email/send-email";
import {auth} from "@/auth";
import {generateOTP, hashOTP} from "@/lib/utils/hash";

type OTPPurpose = "CHANGE_PASSWORD" | "VERIFY_EMAIL";

export const sendOTP = async ({purpose, passed_email}:{purpose :OTPPurpose, passed_email?: string}) => {
    let email;
    if(purpose == "CHANGE_PASSWORD"){
        const session = await auth();
        if(!session) throw new Error("Unauthorized");
        console.log(session);
        email = session.user.email;
    }
    else if(purpose == "VERIFY_EMAIL"){
        if(!passed_email) throw new Error("Email is required");
        email = passed_email;
    }

    if(!email) throw new Error("Email not provided");

    const emailLimit = await sendOTPLimiter.limit(
        `otp:send:${purpose}:${email}`
    );
    if (!emailLimit.success) {
        throw new Error("Too many OTP requests. Please try again later.");
    }

    const h = await headers();
    const ip = h.get("x-forwarded-for");
    const ipLimit = await sendOTPLimiter.limit(
        `otp:send:ip:${ip}`
    );

    if (!ipLimit.success) {
        throw new Error("Too many requests from this IP.");
    }

    const otp = generateOTP();
    await redis.set(
        `otp:code:${purpose}:${email}`,
        hashOTP(otp),
        { ex: 300 } // 5 min
    );

    console.log(otp);
    const subject = 'OTP for Eventory';
    const text =
        `Hi,
    For your security, don't share this code.
    Your secure code is
    ${otp}
    This code expires in 5 minutes.
    If you didn't request this, you can ignore this email.
    `;

    await sendEmail(email, subject, text);
}