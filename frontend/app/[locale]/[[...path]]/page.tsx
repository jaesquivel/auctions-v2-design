import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { ItemGrid } from "@/components/item-grid"
import { FilterView } from "@/components/filter-editor"
import { ItemDetail } from "@/components/item-detail"
import { TagManagement } from "@/components/tag-management"
import {
  Overview,
  AlertsScreen,
  SettingsScreen,
  TeamScreen,
  PlansScreen,
  SystemScreen,
  ExtractionScreen,
  AuthScreen,
} from "@/components/other-screens"
import { Category, categories } from "@/lib/domain"
import { Skeleton } from "@/components/ui/skeleton"
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; path?: string[] }>
}) {
  const { locale, path = [] } = await params
  const [section, id] = path
  if (!section) redirect(`/${locale}/properties`)
  let content
  if (categories.includes(section as Category)) {
    const category = section as Category
    if (path.length > 2) notFound()
    content =
      id === "filters" ? (
        <FilterView category={category} />
      ) : id ? (
        <ItemDetail id={id} category={category} />
      ) : (
        <ItemGrid category={category} />
      )
  } else if (
    section === "tags" &&
    (path.length === 1 || (path.length === 2 && id === "new"))
  )
    content = <TagManagement create={id === "new"} />
  else if (path.length === 1)
    content = (
      {
        overview: <Overview />,
        alerts: <AlertsScreen />,
        settings: <SettingsScreen />,
        team: <TeamScreen />,
        plans: <PlansScreen />,
        system: <SystemScreen />,
        extraction: <ExtractionScreen />,
        auth: (
          <AuthScreen
            enabled={
              !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
              !!process.env.CLERK_SECRET_KEY
            }
          />
        ),
      } as Record<string, React.ReactNode>
    )[section]
  if (!content) notFound()
  return <Suspense fallback={<Skeleton className="h-80" />}>{content}</Suspense>
}
