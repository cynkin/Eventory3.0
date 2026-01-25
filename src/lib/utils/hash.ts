import bcrypt from "bcrypt";
import crypto from "crypto";

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export const hashOTP = (otp : string) =>{
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}

export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

export function compareOTP(otp : string, hash : string) {
    return hashOTP(otp) === hash;
}