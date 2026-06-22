import { auth } from "@/auth";
import { NextResponse } from "next/server";

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
