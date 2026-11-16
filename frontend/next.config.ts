import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
}
export default createNextIntlPlugin()(nextConfig)
