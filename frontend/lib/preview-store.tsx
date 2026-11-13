"use client"
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { Query, Category, Role, Research, defaultQuery } from "./domain"
export const colors = [
  "gray",
  "blue",
  "green",
  "amber",
  "red",
  "purple",
] as const
export type Tag = {
  id: string
  label: string
  color: string
  deleted?: boolean
}
export type SavedFilter = {
  id: string
  owner: string
  name: string
  organization: string
  query: Query
  enabled: boolean
}
export type PreviewState = {
  version: 1
  user: string
  organization: string
  roles: Record<string, Role>
  sysadmin: boolean
  sysadmins?: Record<string, boolean>
  organizationNames: Record<string, string>
  tags: Record<string, Tag[]>
  assignments: Record<string, Record<string, string[]>>
  research: Record<string, Research>
  savedFilters: SavedFilter[]
  queries: Record<string, Query>
  columns: Record<string, string[]>
  members: { id: string; name: string; role: Role; organization: string }[]
  system: { enabled: boolean; interval: number; runs: number }
}
export const initialState: PreviewState = {
  version: 1,
  user: "DEMO-USER-01",
  organization: "org",
  roles: { org: "MANAGER", solo: "ADMIN" },
  sysadmin: false,
  sysadmins: {},
  organizationNames: {
    org: "Organización de ejemplo",
    solo: "Organización individual",
  },
  tags: {
    org: [
      { id: "DEMO-TAG-O1", label: "Pendiente de estudio", color: "amber" },
      { id: "DEMO-TAG-O2", label: "Consultar fuente", color: "blue" },
      ...Array.from({ length: 25 }, (_, i) => ({
        id: `DEMO-TAG-TEST-${i + 1}`,
        label: `Prueba ${String(i + 1).padStart(2, "0")}${i % 5 === 0 ? " · Seguimiento de documentación pendiente" : ""}`,
        color: colors[i % 6],
      })),
    ],
    solo: [{ id: "DEMO-TAG-S1", label: "Revisar documentos", color: "purple" }],
  },
  assignments: {
    org: {
      "DEMO-A01": ["DEMO-TAG-O1", "DEMO-TAG-O2"],
      "DEMO-A02": ["DEMO-TAG-O2", "DEMO-TAG-O1"],
    },
    solo: {},
  },
  research: {},
  savedFilters: [],
  queries: {},
  columns: {},
  members: [
    {
      id: "DEMO-ADMIN-03",
      name: "Administración de ejemplo",
      role: "ADMIN",
      organization: "org",
    },
    {
      id: "DEMO-USER-01",
      name: "Persona de ejemplo",
      role: "MANAGER",
      organization: "org",
    },
    {
      id: "DEMO-USER-02",
      name: "Analista de ejemplo",
      role: "USER",
      organization: "org",
    },
  ],
  system: { enabled: true, interval: 60, runs: 0 },
}
const storageKey = "auctions-react-preview:v1"
let snapshot: PreviewState | undefined
const listeners = new Set<() => void>()
function getSnapshot() {
  if (!snapshot) {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "null")
      snapshot = value?.version === 1 ? value : initialState
    } catch {
      snapshot = initialState
    }
  }
  return snapshot!
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function update(updater: (s: PreviewState) => PreviewState) {
  snapshot = updater(getSnapshot())
  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot))
  } catch {
    /* Browser storage may be unavailable; keep session state. */
  }
  listeners.forEach((fn) => fn())
}
const Context = createContext<{
  state: PreviewState
  update: typeof update
} | null>(null)
export function PreviewProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initialState)
  return (
    <Context.Provider value={{ state, update }}>{children}</Context.Provider>
  )
}
export function usePreview() {
  const context = useContext(Context)
  if (!context) throw Error("Missing preview provider")
  const { state } = context
  const role =
    state.roles[`${state.user}:${state.organization}`] ??
    (state.user === "DEMO-USER-02" ? "USER" : state.roles[state.organization])
  return {
    ...context,
    role,
    canManage: role === "ADMIN" || role === "MANAGER",
    scope: `${state.organization}:`,
    userKey: `${state.user}:`,
  }
}
export const queryKey = (user: string, category: Category) =>
  `${user}:${category}`
export function storedQuery(state: PreviewState, category: Category) {
  return state.queries[queryKey(state.user, category)] ?? defaultQuery(category)
}
