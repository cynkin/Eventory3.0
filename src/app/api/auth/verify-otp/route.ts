import { NextRequest, NextResponse } from "next/server";
import {redis} from "@/lib/db";
import {compareOTP} from "@/lib/utils/hash";
const MAX_ATTEMPTS = 5;
const OTP_TTL_SECONDS = 300;
import {auth} from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const {otp} = await req.json();
        const session = await auth();
        const email = session?.user.email;
        console.log("Email", email, otp);

        if (!email || !otp || otp.length !== 6) {
            return NextResponse.json({ error: "Missing data/Invalid OTP" }, { status: 400 });
        }
        const otpKey = `otp:code:change-password:${email}`;
        const attemptsKey = `otp:attempts:${email}`;

        const [hashedOTP, attempts] = await Promise.all([
            redis.get<string>(otpKey),
            redis.get<number>(attemptsKey),
        ]);

        if (!hashedOTP) {
            return NextResponse.json(
                { error: "OTP expired or not found" },
                { status: 400 }
            );
        }

        if ((attempts ?? 0) >= MAX_ATTEMPTS) {
            return NextResponse.json(
                { error: "Too many attempts. Request new OTP." },
                { status: 429 }
            );
        }

        const isValid = compareOTP(otp, hashedOTP)
        if (!isValid) {
            await redis.multi()
                .incr(attemptsKey)
                .expire(attemptsKey, OTP_TTL_SECONDS)
                .exec();

            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 401 }
            );
        }
        await redis.del(otpKey, attemptsKey);
        return NextResponse.json({ success: true});
    } catch (err) {
        console.error("Error sending OTP:", err);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}