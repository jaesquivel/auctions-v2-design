export type NavigationItem = {
  href: string
  key: string
  icon:
    | "properties"
    | "vehicles"
    | "other"
    | "overview"
    | "alerts"
    | "team"
    | "plans"
    | "settings"
    | "tags"
    | "extraction"
    | "system"
}
export type NavigationSection = { key: string; items: NavigationItem[] }
export function navigationSections(
  canManageTags: boolean,
  isSysadmin: boolean
): NavigationSection[] {
  return [
    {
      key: "auctionsSection",
      items: [
        { href: "/properties", key: "properties", icon: "properties" },
        { href: "/vehicles", key: "vehicles", icon: "vehicles" },
        { href: "/other", key: "other", icon: "other" },
        { href: "/overview", key: "overview", icon: "overview" },
        { href: "/alerts", key: "alerts", icon: "alerts" },
      ],
    },
    {
      key: "extractionSection",
      items: [{ href: "/extraction", key: "review", icon: "extraction" }],
    },
    {
      key: "configurationSection",
      items: [
        { href: "/settings", key: "settings", icon: "settings" },
        { href: "/team", key: "team", icon: "team" },
        { href: "/plans", key: "plans", icon: "plans" },
        ...(canManageTags
          ? [{ href: "/tags", key: "tags", icon: "tags" } as const]
          : []),
      ],
    },
    ...(isSysadmin
      ? [
          {
            key: "systemSection",
            items: [
              { href: "/system", key: "systemTitle", icon: "system" } as const,
            ],
          },
        ]
      : []),
  ]
}
