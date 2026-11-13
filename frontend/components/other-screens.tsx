"use client"
import { useState } from "react"
import { SignIn } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Bell,
  Building2,
  Car,
  Package,
  Plus,
  ArrowUpRight,
  FlaskConical,
  Play,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { usePreview } from "@/lib/preview-store"
import { Link, useRouter } from "@/i18n/navigation"
import { Role } from "@/lib/domain"
import { Choice, Confirm, PageHeading } from "./shared"
export function Overview() {
  const t = useTranslations()
  const { state } = usePreview()
  return (
    <>
      <PageHeading title={t("welcome")} description={t("overviewSub")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("featureTitle")}</CardTitle>
          <CardDescription>{t("featureBody")}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/properties">
              {t("start")}
              <ArrowUpRight />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { category: "properties", Icon: Building2 },
          { category: "vehicles", Icon: Car },
          { category: "other", Icon: Package },
        ].map(({ category, Icon }) => (
          <Card key={category}>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" />
                {t(category)}
              </CardDescription>
              <CardTitle className="text-3xl">50</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href={`/${category}`}>
                  {t("explore")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>{t("taggedCount")}</CardDescription>
            <CardTitle className="text-3xl">
              {
                Object.values(
                  state.assignments[state.organization] ?? {}
                ).filter((ids) => ids.length).length
              }
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{t("savedFiltersPanel")}</CardDescription>
            <CardTitle className="text-3xl">
              {state.savedFilters.filter((s) => s.owner === state.user).length}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/alerts">{t("manageFilters")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
export function AlertsScreen() {
  const t = useTranslations()
  const router = useRouter()
  const { state, update } = usePreview()
  const [pending, setPending] = useState<string | null>(null)
  const filters = state.savedFilters.filter((f) => f.owner === state.user)
  return (
    <>
      <PageHeading title={t("alertsTitle")} description={t("alertsSub")} />
      {!filters.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("emptyAlerts")}</CardTitle>
            <CardDescription>{t("emptyAlertsBody")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/properties/filters">{t("openFilters")}</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        filters.map((saved) => (
          <Card key={saved.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                {saved.name}
              </CardTitle>
              <CardDescription>
                {t(saved.query.category)} ·{" "}
                {state.organizationNames[saved.organization]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {t(saved.enabled ? "active" : "paused")}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("noEmail")}
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  update((s) => ({ ...s, organization: saved.organization }))
                  router.push(
                    `/${saved.query.category}/filters?load=${saved.id}`
                  )
                }}
              >
                {t("retrieveFilter")}
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    savedFilters: s.savedFilters.map((f) =>
                      f.id === saved.id && f.owner === s.user
                        ? { ...f, enabled: !f.enabled }
                        : f
                    ),
                  }))
                }
              >
                {t(saved.enabled ? "pause" : "resume")}
              </Button>
              <Button variant="ghost" onClick={() => setPending(saved.id)}>
                <Trash2 />
                {t("delete")}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
      <Confirm
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={t("deleteFilterTitle")}
        description={t("deleteFilterHelp")}
        onConfirm={() => {
          update((s) => ({
            ...s,
            savedFilters: s.savedFilters.filter(
              (f) => f.id !== pending || f.owner !== s.user
            ),
          }))
          setPending(null)
        }}
      />
    </>
  )
}
export function SettingsScreen() {
  const { state } = usePreview()
  return (
    <SettingsBody
      key={`${state.user}:${state.organization}:${state.organizationNames[state.organization]}`}
    />
  )
}
function SettingsBody() {
  const t = useTranslations()
  const { state, update, role, canManage } = usePreview()
  const [name, setName] = useState(state.organizationNames[state.organization])
  return (
    <>
      <PageHeading title={t("settingsTitle")} description={t("settingsSub")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("organization")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-lg space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (role !== "ADMIN" || !name.trim()) return
              update((s) => ({
                ...s,
                organizationNames: {
                  ...s.organizationNames,
                  [s.organization]: name.trim(),
                },
              }))
              toast.success(t("changesSaved"))
            }}
          >
            <Label htmlFor="organization-name">{t("orgName")}</Label>
            <Input
              id="organization-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={role !== "ADMIN"}
              required
              maxLength={100}
            />
            <Button disabled={role !== "ADMIN"}>{t("saveSettings")}</Button>
          </form>
        </CardContent>
      </Card>
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>{t("tagCatalog")}</CardTitle>
            <CardDescription>{t("tagHelp")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/tags">
                {t("organizationTags")}
                <ArrowUpRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t("manageBilling")}</CardTitle>
          <CardDescription>{t("billingDemo")}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/plans">{t("plans")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
export function TeamScreen() {
  const t = useTranslations()
  const { state, update, role } = usePreview()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  return (
    <>
      <PageHeading title={t("teamTitle")} description={t("teamSub")}>
        <Button disabled={role !== "ADMIN"} onClick={() => setOpen(true)}>
          <Plus />
          {t("invite")}
        </Button>
      </PageHeading>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("roles")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.members
              .filter((m) => m.organization === state.organization)
              .map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <Choice
                      label={`${t("roles")}: ${member.name}`}
                      disabled={role !== "ADMIN" || member.id === state.user}
                      value={member.id === state.user ? role : member.role}
                      options={["ADMIN", "MANAGER", "USER"].map((value) => ({
                        value,
                        label: value,
                      }))}
                      onChange={(newRole) => {
                        const orgMembers = state.members.filter(
                          (m) => m.organization === state.organization
                        )
                        if (
                          member.role === "ADMIN" &&
                          newRole !== "ADMIN" &&
                          orgMembers.filter((m) => m.role === "ADMIN")
                            .length === 1
                        ) {
                          toast.error(t("permissionDenied"))
                          return
                        }
                        update((s) => ({
                          ...s,
                          members: s.members.map((m) =>
                            m.id === member.id &&
                            m.organization === s.organization
                              ? { ...m, role: newRole as Role }
                              : m
                          ),
                          roles: {
                            ...s.roles,
                            [`${member.id}:${s.organization}`]: newRole as Role,
                          },
                        }))
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("invite")}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (role !== "ADMIN") return
              toast.info(t("invitePreview"))
              setOpen(false)
              setEmail("")
            }}
          >
            <Label htmlFor="invite-email">{t("email")}</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              {t("invitePreview")}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button>{t("invite")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
export function PlansScreen() {
  const t = useTranslations()
  return (
    <>
      <PageHeading title={t("planTitle")} description={t("planSub")} />
      <Alert>
        <AlertDescription>{t("billingDemo")}</AlertDescription>
      </Alert>
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            name: "explore",
            features: ["publicCatalog", "searchMaps", "sourceLinks"],
          },
          {
            name: "researchPlan",
            features: ["organizationTags", "savedSearches", "notes"],
          },
          {
            name: "teamPlan",
            features: ["sharedSpace", "roles", "orgBilling"],
          },
        ].map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{t(plan.name)}</CardTitle>
              <CardDescription>{t("pricePending")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f}>{t(f)}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => toast.info(t("noCharge"))}
              >
                {t("reviewPlan")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
export function SystemScreen() {
  const { state } = usePreview()
  return <SystemBody key={state.system.interval} />
}
function SystemBody() {
  const t = useTranslations()
  const { state, update } = usePreview()
  const [interval, setInterval] = useState(String(state.system.interval))
  if (!state.sysadmins?.[state.user])
    return (
      <>
        <PageHeading title={t("systemTitle")} />
        <Alert>
          <AlertDescription>{t("systemNoAccess")}</AlertDescription>
        </Alert>
      </>
    )
  return (
    <>
      <PageHeading title={t("systemTitle")} description={t("systemSub")} />
      <Alert>
        <FlaskConical />
        <AlertDescription>{t("systemDemo")}</AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>{t("systemControls")}</CardTitle>
          <CardDescription>
            CR · Costa Rica · America/Costa_Rica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-lg space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              const n = Number(interval)
              if (!Number.isInteger(n) || n < 15 || n > 1440) {
                toast.error(t("systemValidation"))
                return
              }
              update((s) => ({ ...s, system: { ...s.system, interval: n } }))
              toast.success(t("changesSaved"))
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="ingestion-enabled">{t("ingestionEnabled")}</Label>
              <Switch
                id="ingestion-enabled"
                checked={state.system.enabled}
                onCheckedChange={(enabled) =>
                  update((s) => ({ ...s, system: { ...s.system, enabled } }))
                }
              />
            </div>
            <Label htmlFor="run-interval">{t("sourceCheckInterval")}</Label>
            <Input
              id="run-interval"
              type="number"
              min={15}
              max={1440}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            />
            <Button>{t("save")}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            disabled={!state.system.enabled}
            onClick={() => {
              update((s) => ({
                ...s,
                system: { ...s.system, runs: s.system.runs + 1 },
              }))
              toast.info(t("previewOperations"))
            }}
          >
            <Play />
            {t("runIngestion")}
          </Button>
          <span className="ml-4 text-sm text-muted-foreground">
            {state.system.runs}
          </span>
        </CardFooter>
      </Card>
    </>
  )
}
export function AuthScreen({ enabled = false }: { enabled?: boolean }) {
  const t = useTranslations()
  return (
    <>
      <PageHeading title={t("authTitle")} />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{t("account")}</CardTitle>
          <CardDescription>
            {t(enabled ? "previewHelpConnected" : "authDemo")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enabled && <SignIn routing="hash" />}
          <p className="text-sm text-muted-foreground">{t("previewHelp")}</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/properties">{t("explore")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
