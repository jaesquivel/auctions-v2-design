"use client"
import { MapContainer, CircleMarker, Popup, TileLayer } from "react-leaflet"
import { useLocale, useTranslations } from "next-intl"
import { Item, title } from "@/lib/domain"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "@/i18n/navigation"
import "leaflet/dist/leaflet.css"
export default function PropertyMap({ items }: { items: Item[] }) {
  const t = useTranslations()
  const locale = useLocale()
  const properties = items.filter(
    (i) => i.category === "properties" && i.mapped
  )
  const tiles = process.env.NEXT_PUBLIC_MAP_TILE_URL
  const attribution = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION
  return (
    <div className="space-y-3">
      <Alert>
        <AlertDescription>
          {t("demoMap")} {tiles && attribution ? "" : t("tileUnavailable")}
        </AlertDescription>
      </Alert>
      <MapContainer
        center={[9.95, -84.1]}
        zoom={9}
        className="z-0 h-96 w-full rounded-lg border"
        scrollWheelZoom={false}
      >
        {tiles && attribution && (
          <TileLayer url={tiles} attribution={attribution} />
        )}{" "}
        {properties.map((i, index) => (
          <CircleMarker
            key={i.id}
            center={[9.94 + index * 0.035, -84.08 - index * 0.045]}
            radius={8}
          >
            <Popup>
              <Link href={`/properties/${i.id}`}>{title(i, locale)}</Link>
              <p>{t("demoMap")}</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {!properties.length && (
        <p className="text-sm text-muted-foreground">{t("mapUnavailable")}</p>
      )}
    </div>
  )
}
