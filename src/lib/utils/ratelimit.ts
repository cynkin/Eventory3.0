import {Ratelimit} from "@upstash/ratelimit"
import { redis } from "../db"

export const sendOTPLimiter = new Ratelimit({
    redis,
    limiter : Ratelimit.slidingWindow(3, "10 m")
})

export const verifyOTPLimiter = new Ratelimit({
    redis,
    limiter : Ratelimit.slidingWindow(5, "10 m")
})