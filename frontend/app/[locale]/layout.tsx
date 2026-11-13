import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { esES, enUS } from "@clerk/localizations"
import { routing } from "@/i18n/routing"
import { AppShell } from "@/components/app-shell"
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = (await import(`../../messages/${locale}.json`)).default
  const content = (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="America/Costa_Rica"
    >
      <AppShell
        clerkEnabled={
          !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
          !!process.env.CLERK_SECRET_KEY
        }
      >
        {children}
      </AppShell>
    </NextIntlClientProvider>
  )
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY ? (
    <ClerkProvider
      appearance={{ theme: shadcn }}
      localization={locale === "es" ? esES : enUS}
    >
      {content}
    </ClerkProvider>
  ) : (
    content
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return { title: locale === "es" ? "Remates" : "Auctions" }
}
