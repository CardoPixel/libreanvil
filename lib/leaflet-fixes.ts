import L from "leaflet"

// Fix Leaflet icon issues in Next.js
export function fixLeafletIcons() {
  // Only run on client side
  if (typeof window === "undefined") return

  // @ts-expect-error Leaftlet SSR Icon Fix
  delete L.Icon.Default.prototype._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

