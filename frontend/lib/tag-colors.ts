export const tagColorNames = [
  "gray",
  "blue",
  "green",
  "amber",
  "red",
  "purple",
] as const
export const tagPalette: Record<(typeof tagColorNames)[number], string> = {
  gray: "#71717A",
  blue: "#2563EB",
  green: "#059669",
  amber: "#D97706",
  red: "#DC2626",
  purple: "#9333EA",
}
export function normalizeTagColor(value: string): string | null {
  if (Object.hasOwn(tagPalette, value))
    return tagPalette[value as keyof typeof tagPalette]
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null
  const hex = value.slice(1)
  return `#${(hex.length === 3 ? [...hex].map((char) => char + char).join("") : hex).toUpperCase()}`
}
export function tagTextColor(value: string): string {
  const color = normalizeTagColor(value) ?? tagPalette.gray
  const channels = [1, 3, 5].map((offset) => {
    const channel = parseInt(color.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05)
    ? "#000000"
    : "#FFFFFF"
}
