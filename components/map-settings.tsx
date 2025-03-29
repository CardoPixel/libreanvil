"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { MapData } from "@/lib/map-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ImageUpload } from "@/components/image-upload"
import { calculateImageBounds } from "@/lib/custom-tile-layer"

interface MapSettingsProps {
  map: MapData
  onUpdateMap: (map: Partial<MapData>) => void
}

export function MapSettings({ map, onUpdateMap }: MapSettingsProps) {
  const [name, setName] = useState(map.name)
  const [centerLat, setCenterLat] = useState(map.centerLat.toString())
  const [centerLng, setCenterLng] = useState(map.centerLng.toString())
  const [zoom, setZoom] = useState(map.zoom)
  const [useCustomTileLayer, setUseCustomTileLayer] = useState(map.useCustomTileLayer)
  const [customImage, setCustomImage] = useState<{
    dataUrl: string
    width: number
    height: number
    file: File
  } | null>(null)

  // Initialize custom image if it exists
  useEffect(() => {
    if (map.customTileLayer?.imageUrl && !customImage) {
      // We can't fully reconstruct the File object, but we can set the dataUrl
      setCustomImage({
        dataUrl: map.customTileLayer.imageUrl,
        width: map.customTileLayer.imageWidth,
        height: map.customTileLayer.imageHeight,
        file: new File([], "existing-image.png"), // Placeholder file
      })
    }
  }, [map.customTileLayer, customImage])

  const handleSave = async () => {
    const updates: Partial<MapData> = {
      name,
      centerLat: Number.parseFloat(centerLat),
      centerLng: Number.parseFloat(centerLng),
      zoom,
      useCustomTileLayer,
    }

    // Handle custom tile layer
    if (useCustomTileLayer && customImage) {
      // If we have a new image, process it
      const bounds = calculateImageBounds(
        Number.parseFloat(centerLat),
        Number.parseFloat(centerLng),
        zoom,
        customImage.width,
        customImage.height,
      )

      updates.customTileLayer = {
        imageUrl: customImage.dataUrl,
        imageBounds: bounds as unknown as [[number, number], [number, number]],
        imageWidth: customImage.width,
        imageHeight: customImage.height,
      }
    } else if (!useCustomTileLayer) {
      // If switching to OSM, keep the custom tile layer data but don't use it
      updates.customTileLayer = map.customTileLayer
    }

    onUpdateMap(updates)
  }

  const handleImageSelected = async (imageData: {
    dataUrl: string
    width: number
    height: number
    file: File
  }) => {
    setCustomImage(imageData)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Settings</CardTitle>
          <CardDescription>{"Configure your map's basic settings"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="map-name">Map Name</Label>
            <Input id="map-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="center-lat">Center Latitude</Label>
              <Input
                id="center-lat"
                type="number"
                step="0.000001"
                value={centerLat}
                onChange={(e) => setCenterLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="center-lng">Center Longitude</Label>
              <Input
                id="center-lng"
                type="number"
                step="0.000001"
                value={centerLng}
                onChange={(e) => setCenterLng(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="zoom">Zoom Level</Label>
              <span className="text-sm text-muted-foreground">{zoom}</span>
            </div>
            <Slider id="zoom" min={1} max={18} step={1} value={[zoom]} onValueChange={(values) => setZoom(values[0])} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>World</span>
              <span>Street</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="use-custom-tile">Use Custom Map Image</Label>
              <Switch id="use-custom-tile" checked={useCustomTileLayer} onCheckedChange={setUseCustomTileLayer} />
            </div>

            {useCustomTileLayer && (
              <div className="pt-2">
                <ImageUpload
                  onImageSelected={handleImageSelected}
                  onClearImage={() => setCustomImage(null)}
                  selectedImage={customImage?.dataUrl}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={useCustomTileLayer && !customImage}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

