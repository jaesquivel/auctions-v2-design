import createMiddleware from "next-intl/middleware"
import { clerkMiddleware } from "@clerk/nextjs/server"
import { routing } from "./i18n/routing"
import type { NextRequest, NextFetchEvent } from "next/server"
const intl = createMiddleware(routing)
const clerk = clerkMiddleware(async (_auth, request) => intl(request))
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
    ? clerk(request, event)
    : intl(request)
}
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] }
