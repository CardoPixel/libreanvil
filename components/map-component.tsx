"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import type { MapData, Layer, Marker, Polygon } from "@/lib/map-data"
import { Button } from "@/components/ui/button"
import { MapPin, Hexagon } from "lucide-react"

// Fix Leaflet icon issues
import { fixLeafletIcons } from "@/lib/leaflet-fixes"
import { createCustomTileLayer, getImageDimensionsFromUrl } from "@/lib/custom-tile-layer"

// Add missing type definitions for Leaflet Draw
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-explicit-any */
declare module "leaflet" {
  namespace Draw {
    namespace Event {
      const CREATED: string
      const EDITED: string
      const DELETED: string
    }

    class Polygon {
      constructor(map: L.Map, options?: any)
      enable(): void
      disable(): void
    }
  }

  namespace Control {
    interface DrawConstructorOptions extends L.ControlOptions {
      draw?: {
        polyline?: boolean | any
        polygon?: boolean | any
        rectangle?: boolean | any
        circle?: boolean | any
        marker?: boolean | any
        circlemarker?: boolean | any
      }
      edit?: {
        featureGroup: L.FeatureGroup
        remove?: boolean
      }
    }

    class Draw extends L.Control {
      constructor(options?: DrawConstructorOptions)
      options: DrawConstructorOptions
    }
  }
}

interface MapComponentProps {
  map: MapData
  activeLayers: Layer[]
  activeTimelineEventId: string | null
  onUpdateMarkers: (markers: Marker[]) => void
  onUpdatePolygons: (polygons: Polygon[]) => void
}

export default function MapComponent({
  map,
  activeLayers,
  activeTimelineEventId,
  onUpdateMarkers,
  onUpdatePolygons,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({})
  const markersRef = useRef<Record<string, L.Marker>>({})
  const polygonsRef = useRef<Record<string, L.Polygon>>({})
  const customTileLayerRef = useRef<L.ImageOverlay | null>(null)
  const baseOsmLayerRef = useRef<L.TileLayer | null>(null)
  const drawControlRef = useRef<L.Control.Draw | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isAddingMarker, setIsAddingMarker] = useState(false)
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const mapInitializedRef = useRef(false)

  // Clean up function to properly dispose of the map
  const cleanupMap = () => {
    if (mapRef.current) {
      // Remove event listeners
      mapRef.current.off()

      // Remove the map
      mapRef.current.remove()

      // Reset all refs
      mapRef.current = null
      layerGroupsRef.current = {}
      markersRef.current = {}
      polygonsRef.current = {}
      customTileLayerRef.current = null
      baseOsmLayerRef.current = null
      drawControlRef.current = null

      // Reset initialization flag
      mapInitializedRef.current = false

      // Reset state
      setMapReady(false)
    }
  }

  // FIXME: 
  // Initialize map
  useEffect(() => {
    // Skip if the map is already initialized or container is not available
    if (mapInitializedRef.current || !mapContainerRef.current) return;

    // Set flag to prevent multiple initializations
    mapInitializedRef.current = true;

    const initializeMap = async () => {
      console.log("🗺️ Map object: ", map);
      try {
        // Fix Leaflet icon issues
        fixLeafletIcons();

        // Create map instance
        const leafletMap = L.map(mapContainerRef.current!, {
          center: [map.centerLat, map.centerLng],
          zoom: map.zoom,
          minZoom: map.useCustomTileLayer ? 1 : undefined,
          maxZoom: map.useCustomTileLayer ? 8 : undefined,
          worldCopyJump: !map.useCustomTileLayer,
          maxBounds: map.useCustomTileLayer ? undefined : undefined,
        });

        // Wait for the map to be fully initialized
        leafletMap.whenReady(async () => {
          // Store map reference
          mapRef.current = leafletMap;

          // Add appropriate base layer
          if (map.useCustomTileLayer && map.customTileLayer) {
            const { imageUrl } = map.customTileLayer;

            try {
              // Create custom tile layer and calculate bounds
              const customLayer = await createCustomTileLayer(imageUrl, map.centerLat, map.centerLng, map.zoom);
              console.log("🗺️📜 CustomLayer: ", customLayer);
              customLayer.addTo(leafletMap);
              customTileLayerRef.current = customLayer;

              // Calculate bounds using the image dimensions
              const { width, height } = await getImageDimensionsFromUrl(imageUrl);
              const aspectRatio = width / height;
              const baseSize = 0.2 * Math.pow(2, 8 - map.zoom);
              const calculatedWidth = aspectRatio >= 1 ? baseSize : baseSize * aspectRatio;
              const calculatedHeight = aspectRatio >= 1 ? baseSize / aspectRatio : baseSize;

              const southWest = L.latLng(map.centerLat - calculatedHeight / 2, map.centerLng - calculatedWidth / 2);
              const northEast = L.latLng(map.centerLat + calculatedHeight / 2, map.centerLng + calculatedWidth / 2);

              const validBounds = L.latLngBounds(southWest, northEast);

              // Fit map to the calculated bounds
              leafletMap.fitBounds(validBounds);

              customLayer.addTo(leafletMap);
              customTileLayerRef.current = customLayer;
            } catch (error) {
              console.error("❌ Error calculating image bounds or adding custom tile layer:", error);
            }
          } else {
            const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(leafletMap);
            baseOsmLayerRef.current = osmLayer;
          }

          // Create layer groups for each layer
          map.layers.forEach((layer) => {
            const layerGroup = L.layerGroup().addTo(leafletMap);
            layerGroupsRef.current[layer.id] = layerGroup;
          });

          // Initialize Leaflet.Draw plugin
          const drawnItems = new L.FeatureGroup();
          leafletMap.addLayer(drawnItems);

          // Initialize draw control
          const drawControl = new L.Control.Draw({
            draw: {
              polyline: false,
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: {
                allowIntersection: false,
                showArea: true,
                drawError: {
                  color: "#e1e100",
                  message: "<strong>Error:</strong> Polygon edges cannot cross!",
                },
                shapeOptions: {
                  color: "#3388ff",
                },
                repeatMode: false,
                snapDistance: 10,
                guideLayers: [drawnItems],
              },
            },
            edit: {
              featureGroup: drawnItems,
              remove: true,
            },
          });

          // Add draw control to map
          leafletMap.addControl(drawControl);
          drawControlRef.current = drawControl;

          // Hide the control initially
          const drawContainer = document.querySelector(".leaflet-draw") as HTMLElement;
          if (drawContainer) {
            drawContainer.style.display = "none";
          }

          // Handle draw created event
          leafletMap.on(L.Draw.Event.CREATED, (event: any) => {
            const layer = event.layer;

            if (event.layerType === "polygon") {
              const activeLayer = activeLayers[0];
              if (!activeLayer) return;

              // For custom tile layers, we need to ensure we're getting the coordinates correctly
              let coordinates;

              // Check if the polygon has nested arrays (which happens sometimes with custom tile layers)
              if (Array.isArray(layer.getLatLngs()[0]) && Array.isArray(layer.getLatLngs()[0][0])) {
                coordinates = layer.getLatLngs()[0][0].map((latLng: L.LatLng) => ({
                  lat: latLng.lat,
                  lng: latLng.lng,
                }));
              } else {
                coordinates = layer.getLatLngs()[0].map((latLng: L.LatLng) => ({
                  lat: latLng.lat,
                  lng: latLng.lng,
                }));
              }

              // Ensure we have at least 3 points for a valid polygon
              if (coordinates.length < 3) {
                console.error("❌ Not enough points for a polygon");
                return;
              }

              const newPolygon: Polygon = {
                id: `polygon-${Date.now()}`,
                layerId: activeLayer.id,
                title: "New Polygon",
                description: "Click to edit this polygon",
                coordinates,
                fillColor: activeLayer.color,
                fillOpacity: 0.3,
                strokeColor: activeLayer.color,
                strokeWidth: 2,
              };

              // Add polygon to map data
              onUpdatePolygons([...(map.polygons || []), newPolygon]);

              // Add the polygon to the map immediately for visual feedback
              const polygonOptions: L.PolylineOptions = {
                color: newPolygon.strokeColor || "#3388ff",
                weight: newPolygon.strokeWidth || 2,
                fillColor: newPolygon.fillColor || "#3388ff",
                fillOpacity: newPolygon.fillOpacity || 0.3,
              };

              const polygon = L.polygon(
                coordinates.map((coord: { lat: any; lng: any }) => [coord.lat, coord.lng]),
                polygonOptions,
              ).bindPopup(createPolygonPopupContent(newPolygon));

              // Add to layer group
              const layerGroup = layerGroupsRef.current[activeLayer.id];
              if (layerGroup) {
                polygon.addTo(layerGroup);
                polygonsRef.current[newPolygon.id] = polygon;
              }

              // Exit drawing mode
              setIsDrawingPolygon(false);

              // Hide the draw control
              const drawContainer = document.querySelector(".leaflet-draw") as HTMLElement;
              if (drawContainer) {
                drawContainer.style.display = "none";
              }
            }
          });

          // Add markers and polygons
          addMarkersToMap();
          addPolygonsToMap();

          // Set map as ready
          setMapReady(true);
        });
      } catch (error) {
        console.error("❌ Error initializing map:", error);
        // Reset initialization flag on error
        mapInitializedRef.current = false;
      }
    };

    initializeMap();

    // Cleanup on unmount
    return cleanupMap;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.id]); // Only re-initialize when map ID changes

  // Update map when map data changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Update map center and zoom
    mapRef.current.setView([map.centerLat, map.centerLng], map.zoom, { animate: true })

    // Update layers, markers, and polygons
    updateLayersAndContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.centerLat, map.centerLng, map.zoom, mapReady, map.useCustomTileLayer, map.customTileLayer])

  // Update layers when active layers change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return
    updateLayersAndContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayers, activeTimelineEventId, map.markers, map.polygons, mapReady])

  // Function to update all layers and content
  const updateLayersAndContent = () => {
    if (!mapRef.current || !mapReady) return

    // Clear all layer groups
    Object.values(layerGroupsRef.current).forEach((group) => group.clearLayers())

    // Hide all layer groups first
    Object.keys(layerGroupsRef.current).forEach((layerId) => {
      const layerGroup = layerGroupsRef.current[layerId]
      if (mapRef.current) mapRef.current.removeLayer(layerGroup)
    })

    // Add active layer groups back to map
    activeLayers.forEach((layer) => {
      const layerGroup = layerGroupsRef.current[layer.id]
      if (layerGroup && mapRef.current) {
        mapRef.current.addLayer(layerGroup)
      }
    })

    // Re-add markers and polygons to their respective layers
    addMarkersToMap()
    addPolygonsToMap()
  }

  // Add this function after the addPolygonsToMap function
  const enablePolygonDrawing = () => {
    if (!mapRef.current || !drawControlRef.current) return

    // Disable any existing drawing handlers using the public API
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Draw.Polygon) {
        layer.disable()
      }
    })

    // Create a new polygon handler with our custom options
    const polygonDrawHandler = new L.Draw.Polygon(mapRef.current, {
      allowIntersection: false,
      showArea: true,
      drawError: {
        color: "#e1e100",
        message: "<strong>Error:</strong> Polygon edges cannot cross!",
      },
      shapeOptions: {
        color: "#3388ff",
      },
      // Add these options to fix the custom tile layer issue
      repeatMode: false,
      snapDistance: 10,
    })

    // Enable the handler
    polygonDrawHandler.enable()
  }

  // Toggle drawing mode
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    const drawContainer = document.querySelector(".leaflet-draw") as HTMLElement
    if (drawContainer) {
      drawContainer.style.display = isDrawingPolygon ? "block" : "none"
    }

    if (isDrawingPolygon) {
      // Use our custom function instead
      enablePolygonDrawing()
    }
  }, [isDrawingPolygon, mapReady])

  // Update map center and zoom when map settings change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    mapRef.current.setView([map.centerLat, map.centerLng], map.zoom, { animate: true })
  }, [map.centerLat, map.centerLng, map.zoom, mapReady])

  /* // Update layers when active layers change
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    // Clear all layer groups
    Object.values(layerGroupsRef.current).forEach((group) => group.clearLayers())

    // Hide all layer groups first
    Object.keys(layerGroupsRef.current).forEach((layerId) => {
      const layerGroup = layerGroupsRef.current[layerId]
      if (mapRef.current) mapRef.current.removeLayer(layerGroup)
    })

    // Add active layer groups back to map
    activeLayers.forEach((layer) => {
      const layerGroup = layerGroupsRef.current[layer.id]
      if (layerGroup && mapRef.current) {
        mapRef.current.addLayer(layerGroup)
      }
    })

    // Re-add markers and polygons to their respective layers
    addMarkersToMap()
    addPolygonsToMap()
  }, [activeLayers, mapReady, activeTimelineEventId, map.markers, map.polygons]) */

  // Add markers to map
  const addMarkersToMap = () => {
    if (!mapRef.current || !mapReady) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      if (mapRef.current) marker.remove()
    })
    markersRef.current = {}

    // Add markers to their respective layers
    map.markers.forEach((markerData) => {
      // Only add markers for active layers
      if (!activeLayers.some((layer) => layer.id === markerData.layerId)) return

      const markerOptions: L.MarkerOptions = {}

      // Create custom icon if specified
      if (markerData.iconColor) {
        markerOptions.icon = createCustomMarkerIcon(markerData.iconColor)
      }

      // Create marker
      const marker = L.marker([markerData.lat, markerData.lng], markerOptions).bindPopup(createPopupContent(markerData))

      // Add to layer group
      const layerGroup = layerGroupsRef.current[markerData.layerId]
      if (layerGroup) {
        marker.addTo(layerGroup)
        markersRef.current[markerData.id] = marker
      }
    })
  }

  // Add polygons to map
  const addPolygonsToMap = () => {
    if (!mapRef.current || !mapReady) return

    // Clear existing polygons
    Object.values(polygonsRef.current).forEach((polygon) => {
      if (mapRef.current) polygon.remove()
    })
    polygonsRef.current = {}

    // Add polygons to their respective layers
    map.polygons?.forEach((polygonData) => {
      // Only add polygons for active layers
      if (!activeLayers.some((layer) => layer.id === polygonData.layerId)) return

      const latLngs = polygonData.coordinates.map((coord) => L.latLng(coord.lat, coord.lng))

      const polygonOptions: L.PolylineOptions = {
        color: polygonData.strokeColor || "#3388ff",
        weight: polygonData.strokeWidth || 2,
        fillColor: polygonData.fillColor || "#3388ff",
        fillOpacity: polygonData.fillOpacity || 0.3,
      }

      // Create polygon
      const polygon = L.polygon(latLngs, polygonOptions).bindPopup(createPolygonPopupContent(polygonData))

      // Add to layer group
      const layerGroup = layerGroupsRef.current[polygonData.layerId]
      if (layerGroup) {
        polygon.addTo(layerGroup)
        polygonsRef.current[polygonData.id] = polygon
      }
    })
  }

  // Create custom marker icon
  const createCustomMarkerIcon = (color: string) => {
    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  // Create popup content for marker
  const createPopupContent = (marker: Marker) => {
    return `
      <div>
        <h3 style="font-weight: bold; margin-bottom: 5px;">${marker.title}</h3>
        <p>${marker.description || ""}</p>
        ${marker.link ? `<a href="#${marker.link}" style="color: blue; text-decoration: underline;">View Details</a>` : ""}
      </div>
    `
  }

  // Create popup content for polygon
  const createPolygonPopupContent = (polygon: Polygon) => {
    return `
      <div>
        <h3 style="font-weight: bold; margin-bottom: 5px;">${polygon.title}</h3>
        <p>${polygon.description || ""}</p>
        ${polygon.link ? `<a href="#${polygon.link}" style="color: blue; text-decoration: underline;">View Details</a>` : ""}
      </div>
    `
  }

  // Handle map click for adding markers
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isAddingMarker) return

      // Get active layer
      const activeLayer = activeLayers[0]
      if (!activeLayer) return

      // Create new marker
      const newMarker: Marker = {
        id: `marker-${Date.now()}`,
        layerId: activeLayer.id,
        title: "New Marker",
        description: "Click to edit this marker",
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        iconColor: activeLayer.color,
      }

      // Update markers
      onUpdateMarkers([...map.markers, newMarker])

      // Exit adding marker mode
      setIsAddingMarker(false)
    }

    if (isAddingMarker) {
      mapRef.current.on("click", handleMapClick)
      // Change cursor to indicate adding marker
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = "crosshair"
      }
    } else {
      mapRef.current.off("click", handleMapClick)
      // Reset cursor
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = ""
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick)
      }
    }
  }, [isAddingMarker, activeLayers, mapReady, map.markers, onUpdateMarkers])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Map controls - fixed z-index to ensure they appear above the map */}
      <div className="absolute top-4 right-4 z-[1100] flex flex-col gap-2">
        <Button
          size="sm"
          variant={isAddingMarker ? "default" : "outline"}
          onClick={() => {
            setIsAddingMarker(!isAddingMarker)
            setIsDrawingPolygon(false)
          }}
          title="Add Marker"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={isDrawingPolygon ? "default" : "outline"}
          onClick={() => {
            setIsDrawingPolygon(!isDrawingPolygon)
            setIsAddingMarker(false)
          }}
          title="Draw Polygon"
        >
          <Hexagon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
