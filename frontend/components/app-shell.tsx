"use client"
import { type ReactNode, type ComponentProps, useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations, useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import {
  ChevronRight,
  ChevronsUpDown,
  Gavel,
  ShieldCheck,
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
import { type NavigationSection, navigationSections } from "@/lib/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { TooltipProvider as SidebarTooltipProvider } from "@/components/ui/base/tooltip"
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/base/collapsible"
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

const icons = {
  properties: Building2,
  vehicles: Car,
  other: Package,
  overview: LayoutDashboard,
  alerts: Bell,
  team: Users,
  plans: CreditCard,
  settings: Settings,
  tags: Tags,
  extraction: Workflow,
  system: Settings,
}

function SidebarSection({ section }: { section: NavigationSection }) {
  const t = useTranslations()
  const pathname = usePathname()
  const { state, setOpen, isMobile } = useSidebar()
  const [expanded, setExpanded] = useState(true)
  const sectionIcons = {
    auctionsSection: Gavel,
    extractionSection: Workflow,
    configurationSection: Settings,
    systemSection: ShieldCheck,
  }
  const SectionIcon = sectionIcons[section.key as keyof typeof sectionIcons]
  return (
    <Collapsible
      open={expanded}
      onOpenChange={(next) => {
        if (state === "collapsed" && !isMobile) {
          setOpen(true)
          setExpanded(true)
        } else setExpanded(next)
      }}
      className="group/navigation-section"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={t(section.key)} />}
      >
        <SectionIcon />
        <span>{t(section.key)}</span>
        <ChevronRight className="ml-auto transition-transform group-data-open/navigation-section:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {section.items.map((item) => {
            const Icon = icons[item.icon]
            return (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  render={<AppNavLink href={item.href} />}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  }
                >
                  <Icon />
                  <span>{t(item.key)}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
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
  const sections = navigationSections(
    canManage,
    !!state.sysadmins?.[state.user]
  )

  return (
    <SidebarTooltipProvider>
      <SidebarProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-3"
        >
          {locale === "es" ? "Saltar al contenido" : "Skip to content"}
        </a>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  render={<AppNavLink href="/properties" />}
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Image
                      width={28}
                      height={28}
                      src="/brand/gavel-dark.svg"
                      alt=""
                      className="size-5 invert dark:invert-0"
                    />
                  </span>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{t("appName")}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip={t("organization")}
                      aria-label={t("organization")}
                    >
                      <Building2 />
                      <span className="truncate">
                        {state.organizationNames[state.organization]}
                      </span>
                      <ChevronsUpDown className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuLabel>{t("organization")}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={state.organization}
                      onValueChange={(organization) =>
                        update((s) => ({ ...s, organization }))
                      }
                    >
                      {Object.entries(state.organizationNames).map(
                        ([value, label]) => (
                          <DropdownMenuRadioItem key={value} value={value}>
                            {label}
                          </DropdownMenuRadioItem>
                        )
                      )}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {sections.map((section) => (
                  <SidebarSection key={section.key} section={section} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                {clerkEnabled ? (
                  <ClerkControls />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        tooltip={
                          state.user === "DEMO-USER-01" ? "Demo 01" : "Demo 02"
                        }
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FlaskConical className="size-4" />
                        </span>
                        <span className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {state.user === "DEMO-USER-01"
                              ? "Demo 01"
                              : "Demo 02"}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {role}
                          </span>
                        </span>
                        <ChevronsUpDown className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end">
                      <DropdownMenuLabel>
                        {t("demoUserLabel")}
                      </DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={state.user}
                        onValueChange={(user) =>
                          update((s) => ({ ...s, user }))
                        }
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
                              [`${s.user}:${s.organization}`]:
                                value as typeof role,
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
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-w-0">
          <header className="flex min-h-16 flex-wrap items-center gap-3 border-b px-4 md:px-6">
            <SidebarTrigger aria-label={t("toggleSidebar")} />
            <Separator orientation="vertical" className="h-4" />

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
    </SidebarTooltipProvider>
  )
}
