import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// Next.js 16 renamed the "middleware" convention to "proxy".
// Build a lightweight, edge-safe auth instance from the split config.
// (Importing from @/auth would pull bcrypt/crypto into the Edge Runtime.)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const role = (req.auth?.user as any)?.role as string | undefined;
    const isLoggedIn = !!req.auth;

    // Must be authenticated
    if (pathname.startsWith("/account") && !isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Must be vendor or admin
    if (pathname.startsWith("/createForm") && role !== "vendor" && role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Must be admin
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/account/:path*", "/createForm/:path*", "/admin/:path*"],
};
