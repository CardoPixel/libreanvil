import L from "leaflet"

// Function to get image dimensions from a URL
export async function getImageDimensionsFromUrl(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = imageUrl;
  });
}

// Function to create a custom tile layer from an uploaded image
export async function createCustomTileLayer(
  imageUrl: string,
  centerLat: number,
  centerLng: number,
  zoom: number
): Promise<L.ImageOverlay> {
  if (typeof window === "undefined") {
    throw new Error("Leaflet can only be used in the browser environment.");
  }

  try {
    const L = await import("leaflet");

    // Fetch image dimensions
    const { width, height } = await getImageDimensionsFromUrl(imageUrl);

    // Calculate the aspect ratio of the image
    const aspectRatio = width / height;

    // Base size of the image on the map (adjust as needed based on zoom)
    const baseSize = 0.2 * Math.pow(2, 8 - zoom);

    // Calculate width and height in coordinate space based on aspect ratio
    const calculatedWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio;
    const calculatedHeight = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize;

    const southWest = L.latLng(centerLat - calculatedHeight / 2, centerLng - calculatedWidth / 2);
    const northEast = L.latLng(centerLat + calculatedHeight / 2, centerLng + calculatedWidth / 2);

    const validBounds = L.latLngBounds(southWest, northEast);

    return L.imageOverlay(imageUrl, validBounds);
  } catch (error) {
    console.error("❌ Error creating custom tile layer:", error);
    throw error;
  }
}


// Function to calculate appropriate bounds for an image based on aspect ratio
export async function calculateImageBounds(
  centerLat: number,
  centerLng: number,
  zoom: number,
  imageWidth: number,
  imageHeight: number,
): Promise<L.LatLngBoundsExpression> {
  if (typeof window === "undefined") {
    throw new Error("Leaflet can only be used in the browser environment.")
  }

  // Calculate the aspect ratio of the image
  const aspectRatio = imageWidth / imageHeight

  // Base size of the image on the map (adjust as needed based on zoom)
  // Lower zoom numbers mean more zoomed out, so we need larger bounds
  const baseSize = 0.2 * Math.pow(2, 8 - zoom)

  // Calculate width and height in coordinate space based on aspect ratio
  const width = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio
  const height = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize

  const southWest = [centerLat - height / 2, centerLng - width / 2]
  const northEast = [centerLat + height / 2, centerLng + width / 2]

  return [southWest, northEast] as L.LatLngBoundsExpression
}

// Function to convert an uploaded file to a data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Function to get image dimensions
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

// Function to validate and fix polygon coordinates if needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatePolygonCoordinates(coordinates: any[]): [number, number][] {
  // Ensure we have an array of coordinates
  if (!Array.isArray(coordinates)) {
    console.error("❌ Invalid coordinates format")
    return []
  }

  // Handle nested arrays that sometimes occur with Leaflet
  const validCoords: [number, number][] = []

  // Try to extract valid lat/lng pairs
  coordinates.forEach((coord) => {
    if (typeof coord === "object") {
      if ("lat" in coord && "lng" in coord) {
        validCoords.push([coord.lat, coord.lng])
      } else if (Array.isArray(coord) && coord.length === 2) {
        validCoords.push([coord[0], coord[1]])
      }
    }
  })

  // Ensure we have at least 3 points for a valid polygon
  if (validCoords.length < 3) {
    console.error("❌ Not enough valid coordinates for a polygon")
    return []
  }

  return validCoords
}