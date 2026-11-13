"use client"
import { type ReactNode, type ComponentProps, useEffect } from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import {
  Building2,
  Car,
  Package,
  Tags,
  LayoutDashboard,
  Bell,
  Users,
  Settings,
  CreditCard,
  Workflow,
  Globe,
  Monitor,
  FlaskConical,
  Sun,
  Moon,
} from "lucide-react"
import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { usePreview } from "@/lib/preview-store"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Choice } from "./shared"
function AppNavLink(props: ComponentProps<typeof Link>) {
  const { setOpenMobile } = useSidebar()
  return (
    <Link
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        setOpenMobile(false)
      }}
    />
  )
}

function ClerkControls() {
  const t = useTranslations()
  const { isSignedIn } = useUser()
  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <Button variant="outline">{t("auth")}</Button>
    </SignInButton>
  )
}
export function AppShell({
  children,
  clerkEnabled,
}: {
  children: ReactNode
  clerkEnabled: boolean
}) {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { state, update, canManage, role } = usePreview()
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t("appName")
  }, [locale, t])
  const sections = [
    { href: "/properties", key: "properties", icon: Building2 },
    { href: "/vehicles", key: "vehicles", icon: Car },
    { href: "/other", key: "other", icon: Package },
    { href: "/overview", key: "overview", icon: LayoutDashboard },
    { href: "/alerts", key: "alerts", icon: Bell },
    { href: "/team", key: "team", icon: Users },
    { href: "/plans", key: "plans", icon: CreditCard },
    { href: "/settings", key: "settings", icon: Settings },
    ...(canManage ? [{ href: "/tags", key: "tags", icon: Tags }] : []),
  ]
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3"
      >
        {locale === "es" ? "Saltar al contenido" : "Skip to content"}
      </a>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <AppNavLink href="/properties">
                  <span className="inline-flex size-8 items-center justify-center">
                    <Image
                      width={28}
                      height={28}
                      src="/brand/gavel-dark.svg"
                      alt=""
                      className="size-7 dark:invert"
                    />
                  </span>
                  <span className="text-lg font-semibold tracking-tight">
                    {t("appName")}
                  </span>
                </AppNavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t("organization")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.map((n) => (
                  <SidebarMenuItem key={n.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === n.href || pathname.startsWith(n.href + "/")
                      }
                      tooltip={t(n.key)}
                    >
                      <AppNavLink href={n.href}>
                        <n.icon />
                        <span>{t(n.key)}</span>
                      </AppNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{t("operations")}</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/system"}>
                  <AppNavLink href="/system">
                    <Workflow />
                    <span>{t("system")}</span>
                  </AppNavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <FlaskConical className="size-3.5" />
              {t("proposal")}
            </div>
            Nova · Radix · Next.js
            <br />
            CR · America/Costa_Rica
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b px-4 md:px-6">
          <SidebarTrigger aria-label={t("toggleSidebar")} />
          <Separator orientation="vertical" className="h-4" />
          <Choice
            value={state.organization}
            onChange={(organization) => update((s) => ({ ...s, organization }))}
            label={t("organization")}
            options={Object.entries(state.organizationNames).map(
              ([value, label]) => ({ value, label })
            )}
          />
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("appearance")}
                >
                  <Monitor />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("appearance")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={theme ?? "system"}
                  onValueChange={setTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    <Sun />
                    {t("light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <Moon />
                    {t("dark")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    <Monitor />
                    {t("systemTheme")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("locale")}>
                  <Globe />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={(value) =>
                    router.replace(pathname, { locale: value })
                  }
                >
                  <DropdownMenuRadioItem value="es">
                    Español
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="en">
                    English
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {clerkEnabled ? (
              <ClerkControls />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FlaskConical />
                    {state.user === "DEMO-USER-01" ? "Demo 01" : "Demo 02"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("demoUserLabel")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={state.user}
                    onValueChange={(user) => update((s) => ({ ...s, user }))}
                  >
                    <DropdownMenuRadioItem value="DEMO-USER-01">
                      Demo 01
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="DEMO-USER-02">
                      Demo 02
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t("demoRole")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={role}
                    onValueChange={(value) =>
                      update((s) => ({
                        ...s,
                        roles: {
                          ...s.roles,
                          [`${s.user}:${s.organization}`]: value as typeof role,
                        },
                      }))
                    }
                  >
                    {["ADMIN", "MANAGER", "USER"].map((r) => (
                      <DropdownMenuRadioItem key={r} value={r}>
                        {r}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={state.sysadmins?.[state.user] ?? false}
                    onCheckedChange={(sysadmin) =>
                      update((s) => ({
                        ...s,
                        sysadmins: { ...s.sysadmins, [s.user]: sysadmin },
                      }))
                    }
                  >
                    {t("demoSysadmin")}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <AppNavLink href="/auth">{t("auth")}</AppNavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground md:px-6">
          <Badge variant="outline">{t("previewMode")}</Badge>
          <span>
            {t(clerkEnabled ? "previewHelpConnected" : "previewHelp")}
          </span>
        </div>
        <main
          id="main"
          className="mx-auto w-full max-w-screen-2xl min-w-0 space-y-6 p-4 md:p-6 lg:p-8"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
