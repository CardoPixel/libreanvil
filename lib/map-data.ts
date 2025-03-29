// Types for map data
export interface MapData {
    id: string
    name: string
    centerLat: number
    centerLng: number
    zoom: number
    layers: Layer[]
    markers: Marker[]
    polygons: Polygon[]
    timelineEvents: TimelineEvent[]
    customTileLayer?: CustomTileLayer | null
    useCustomTileLayer: boolean
  }

  export interface CustomTileLayer {
    imageUrl: string
    imageBounds: [number, number][] // [[southWest.lat, southWest.lng], [northEast.lat, northEast.lng]]
    imageWidth: number
    imageHeight: number
  }
  
  export interface Layer {
    id: string
    name: string
    color: string
    isVisible?: boolean
  }
  
  export interface Marker {
    id: string
    layerId: string
    title: string
    description?: string
    lat: number
    lng: number
    iconColor?: string
    link?: string
  }

  export interface LatLng {
    lat: number
    lng: number
  }
  
  export interface Polygon {
    id: string
    layerId: string
    title: string
    description?: string
    coordinates: LatLng[]
    fillColor?: string
    strokeColor?: string
    fillOpacity?: number
    strokeWidth?: number
    link?: string
  }
  
  export interface TimelineEvent {
    id: string
    name: string
    year?: string
    description?: string
    layerIds: string[]
  }
  
  // Helper functions to create new items
  export function createNewMap(name: string, customTileLayer?: CustomTileLayer): MapData {
    return {
      id: `map-${Date.now()}`,
      name,
      centerLat: 0,
      centerLng: 0,
      zoom: 3,
      layers: [],
      markers: [],
      polygons: [],
      timelineEvents: [],
      customTileLayer,
      useCustomTileLayer: !!customTileLayer,
    }
  }
  
  export function createNewLayer(name: string, color: string): Layer {
    return {
      id: `layer-${Date.now()}`,
      name,
      color,
      isVisible: true,
    }
  }
  
  export function createNewMarker(layerId: string, title: string, lat: number, lng: number): Marker {
    return {
      id: `marker-${Date.now()}`,
      layerId,
      title,
      description: "",
      lat,
      lng,
      iconColor: "#ff0000",
    }
  }

  export function createNewPolygon(layerId: string, title: string, coordinates: LatLng[], fillColor: string): Polygon {
    return {
      id: `polygon-${Date.now()}`,
      layerId,
      title,
      description: "",
      coordinates,
      fillColor,
      strokeColor: fillColor,
      fillOpacity: 0.3,
      strokeWidth: 2,
    }
  }
  
  export function createNewTimelineEvent(
    name: string,
    year?: string,
    description?: string,
    layerIds: string[] = [],
  ): TimelineEvent {
    return {
      id: `event-${Date.now()}`,
      name,
      year,
      description,
      layerIds,
    }
  }
  
  // Default data for initial load
  export const defaultMaps: MapData[] = [
    {
      id: "default-map",
      name: "Fantasy World",
      centerLat: 0,
      centerLng: 0,
      zoom: 3,
      layers: [
        {
          id: "layer-1",
          name: "Kingdoms",
          color: "#ff0000",
          isVisible: true,
        },
        {
          id: "layer-2",
          name: "Landmarks",
          color: "#00ff00",
          isVisible: true,
        },
        {
          id: "layer-3",
          name: "Routes",
          color: "#0000ff",
          isVisible: true,
        },
      ],
      markers: [
        {
          id: "marker-1",
          layerId: "layer-1",
          title: "Kingdom of Eldoria",
          description: "The central kingdom of the realm",
          lat: 10,
          lng: 5,
          iconColor: "#ff0000",
        },
        {
          id: "marker-2",
          layerId: "layer-2",
          title: "Ancient Tower",
          description: "A mysterious tower from a forgotten age",
          lat: -5,
          lng: 15,
          iconColor: "#00ff00",
        },
        {
          id: "marker-3",
          layerId: "layer-3",
          title: "Trade Route",
          description: "Main trade route between kingdoms",
          lat: 0,
          lng: 0,
          iconColor: "#0000ff",
        },
      ],
      polygons: [
        {
          id: "polygon-1",
          layerId: "layer-1",
          title: "Kingdom Territory",
          description: "The territory of the Kingdom of Eldoria",
          coordinates: [
            { lat: 8, lng: 3 },
            { lat: 12, lng: 3 },
            { lat: 12, lng: 7 },
            { lat: 8, lng: 7 },
          ],
          fillColor: "#ff0000",
          strokeColor: "#ff0000",
          fillOpacity: 0.3,
          strokeWidth: 2,
        },
      ],
      timelineEvents: [
        {
          id: "event-1",
          name: "Age of Foundation",
          year: "1000 BE",
          description: "The founding of the first kingdoms",
          layerIds: ["layer-1"],
        },
        {
          id: "event-2",
          name: "Age of Discovery",
          year: "500 BE",
          description: "Explorers discover ancient landmarks",
          layerIds: ["layer-1", "layer-2"],
        },
        {
          id: "event-3",
          name: "Age of Trade",
          year: "Present",
          description: "Trade routes established between kingdoms",
          layerIds: ["layer-1", "layer-2", "layer-3"],
        },
      ],
      useCustomTileLayer: false,
    },
  ]
  
  