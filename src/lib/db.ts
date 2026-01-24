import { PrismaClient } from '@prisma/client';
import { Redis } from "@upstash/redis";

const prisma = new PrismaClient();
export default prisma;

export const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
})
