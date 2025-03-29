"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MapData, Layer, Marker, TimelineEvent, Polygon } from "@/lib/map-data"
import { MapSettings } from "@/components/map-settings"
import { LayerManager } from "@/components/layer-manager"
import { MarkerManager } from "@/components/marker-manager"
import { PolygonManager } from "@/components/polygon-manager"
import { TimelineManager } from "@/components/timeline-manager"

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>,
})

interface MapEditorProps {
  map: MapData
  onUpdateMap: (map: MapData) => void
}

export function MapEditor({ map, onUpdateMap }: MapEditorProps) {
  const [activeTab, setActiveTab] = useState("map")
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null)
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null)
  const [activeTimelineEventId, setActiveTimelineEventId] = useState<string | null>(null)

  // Set initial selections
  useEffect(() => {
    if (map.layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(map.layers[0].id)
    }
    if (map.timelineEvents.length > 0 && !activeTimelineEventId) {
      setActiveTimelineEventId(map.timelineEvents[0].id)
    }
  }, [map, selectedLayerId, activeTimelineEventId])

  // Get active layers based on timeline event
  const getActiveLayerIds = () => {
    if (!activeTimelineEventId) return map.layers.map((layer) => layer.id)

    const event = map.timelineEvents.find((e) => e.id === activeTimelineEventId)
    return event ? event.layerIds : map.layers.map((layer) => layer.id)
  }

  const activeLayerIds = getActiveLayerIds()
  const activeLayers = map.layers.filter((layer) => activeLayerIds.includes(layer.id))

  // Update map handlers
  const handleUpdateLayers = (layers: Layer[]) => {
    onUpdateMap({
      ...map,
      layers,
    })
  }

  const handleUpdateMarkers = (markers: Marker[]) => {
    onUpdateMap({
      ...map,
      markers,
    })
  }

  const handleUpdatePolygons = (polygons: Polygon[]) => {
    onUpdateMap({
      ...map,
      polygons,
    })
  }

  const handleUpdateTimelineEvents = (timelineEvents: TimelineEvent[]) => {
    onUpdateMap({
      ...map,
      timelineEvents,
    })
  }

  const handleUpdateMapSettings = (updatedMap: Partial<MapData>) => {
    onUpdateMap({
      ...map,
      ...updatedMap,
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border">
          <TabsList className="w-full justify-start h-12 px-4 bg-transparent">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="markers">Markers</TabsTrigger>
            <TabsTrigger value="polygons">Polygons</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="map" className="h-full m-0 data-[state=active]:flex flex-col">
            <div className="flex-1 relative">
              <MapComponent
                map={map}
                activeLayers={activeLayers}
                activeTimelineEventId={activeTimelineEventId}
                onUpdateMarkers={handleUpdateMarkers}
                onUpdatePolygons={handleUpdatePolygons}
              />
            </div>
          </TabsContent>

          <TabsContent value="layers" className="h-full m-0 data-[state=active]:flex">
            <LayerManager
              layers={map.layers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={setSelectedLayerId}
              onUpdateLayers={handleUpdateLayers}
            />
          </TabsContent>

          <TabsContent value="markers" className="h-full m-0 data-[state=active]:flex">
            <MarkerManager
              markers={map.markers}
              layers={map.layers}
              selectedMarkerId={selectedMarkerId}
              onSelectMarker={setSelectedMarkerId}
              onUpdateMarkers={handleUpdateMarkers}
            />
          </TabsContent>

          <TabsContent value="polygons" className="h-full m-0 data-[state=active]:flex">
            <PolygonManager
              polygons={map.polygons || []}
              layers={map.layers}
              selectedPolygonId={selectedPolygonId}
              onSelectPolygon={setSelectedPolygonId}
              onUpdatePolygons={handleUpdatePolygons}
            />
          </TabsContent>

          <TabsContent value="timeline" className="h-full m-0 data-[state=active]:flex">
            <TimelineManager
              timelineEvents={map.timelineEvents}
              layers={map.layers}
              selectedTimelineEventId={selectedTimelineEventId}
              activeTimelineEventId={activeTimelineEventId}
              onSelectTimelineEvent={setSelectedTimelineEventId}
              onActivateTimelineEvent={setActiveTimelineEventId}
              onUpdateTimelineEvents={handleUpdateTimelineEvents}
            />
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 data-[state=active]:flex">
            <MapSettings map={map} onUpdateMap={handleUpdateMapSettings} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

