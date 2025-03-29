"use client"

import { useState, useEffect } from "react"
import { MapList } from "@/components/map-list"
import { MapEditor } from "@/components/map-editor"
import { MapHeader } from "@/components/map-header"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { type MapData, defaultMaps } from "@/lib/map-data"

export function MapDashboard() {
  const [maps, setMaps] = useLocalStorage<MapData[]>("maps", defaultMaps)
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    // Select the first map by default if none is selected
    if (maps.length > 0 && !selectedMapId) {
      setSelectedMapId(maps[0].id)
    }
  }, [maps, selectedMapId])

  const selectedMap = maps.find((map) => map.id === selectedMapId) || null

  const handleCreateMap = (newMap: MapData) => {
    setMaps([...maps, newMap])
    setSelectedMapId(newMap.id)
  }

  const handleUpdateMap = (updatedMap: MapData) => {
    setMaps(maps.map((map) => (map.id === updatedMap.id ? updatedMap : map)))
  }

  const handleDeleteMap = (mapId: string) => {
    setMaps(maps.filter((map) => map.id !== mapId))
    if (selectedMapId === mapId) {
      setSelectedMapId(maps.length > 1 ? maps.find((map) => map.id !== mapId)?.id || null : null)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <MapHeader isOnline={isOnline} />
      <div className="flex flex-1 overflow-hidden">
        <MapList
          maps={maps}
          selectedMapId={selectedMapId}
          onSelectMap={setSelectedMapId}
          onCreateMap={handleCreateMap}
          onDeleteMap={handleDeleteMap}
        />
        {selectedMap && <MapEditor map={selectedMap} onUpdateMap={handleUpdateMap} />}
      </div>
    </div>
  )
}

