import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { PreviewProvider } from "@/lib/preview-store"
import "./globals.css"
const geist = localFont({
  src: [
    {
      path: "../public/fonts/geist-latin.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/geist-latin-ext.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-geist",
  display: "swap",
})
export const metadata = {
  title: "Auctions / Remates",
  description: "Interactive preview with fictional auction data",
  icons: { icon: "/brand/favicon.svg" },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geist.variable} font-sans antialiased`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <PreviewProvider>
              {children}
              <Toaster richColors />
            </PreviewProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
