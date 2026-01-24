import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        role: string;
        balance: Decimal;
        pic: string | null;
        isGoogle: boolean;
    }

    interface Session {
        user: {
            id: string;
            role: string;
            balance: Decimal;
            pic: string | null;
            isGoogle: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        balance: Decimal;
        pic: string | null;
        isGoogle: boolean;
    }
}
