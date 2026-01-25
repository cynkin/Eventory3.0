'use server'
import {redis} from "@/lib/db";
import {sendOTPLimiter} from "@/lib/utils/ratelimit";
import { headers } from "next/headers";
import {sendEmail} from "@/lib/email/send-email";
import {auth} from "@/auth";
import crypto from "crypto";
import {generateOTP, hashOTP} from "@/lib/utils/hash";

export const sendOTP = async () => {
    const session = await auth();
    if(!session) throw new Error("Unauthorized");

    console.log(session);
    const email = session.user.email;
    if(!email) throw new Error("Unauthorized");

    const emailLimit = await sendOTPLimiter.limit(
        `otp:send:email:${email}`
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
        `otp:code:change-password:${email}`,
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