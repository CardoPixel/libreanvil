"use client"

import { useState } from "react"
import { Plus, Map, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { type MapData, type CustomTileLayer, createNewMap } from "@/lib/map-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageUpload } from "@/components/image-upload"
import { calculateImageBounds } from "@/lib/custom-tile-layer"

interface MapListProps {
  maps: MapData[]
  selectedMapId: string | null
  onSelectMap: (id: string) => void
  onCreateMap: (map: MapData) => void
  onDeleteMap: (id: string) => void
}

export function MapList({ maps, selectedMapId, onSelectMap, onCreateMap, onDeleteMap }: MapListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newMapName, setNewMapName] = useState("")
  const [deleteMapId, setDeleteMapId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("osm")
  const [customImage, setCustomImage] = useState<{
    dataUrl: string
    width: number
    height: number
    file: File
  } | null>(null)

  const handleCreateMap = () => {
    if (newMapName.trim()) {
      let customTileLayer: CustomTileLayer | undefined = undefined

      if (activeTab === "custom" && customImage) {
        // Calculate bounds based on image dimensions
        const bounds = calculateImageBounds(0, 0, 3, customImage.width, customImage.height)

        customTileLayer = {
          imageUrl: customImage.dataUrl,
          imageBounds: bounds as unknown as [[number, number], [number, number]],
          imageWidth: customImage.width,
          imageHeight: customImage.height,
        }
      }

      onCreateMap(createNewMap(newMapName, customTileLayer))
      resetForm()
      setIsCreateDialogOpen(false)
    }
  }

  const resetForm = () => {
    setNewMapName("")
    setCustomImage(null)
    setActiveTab("osm")
  }

  const confirmDelete = (id: string) => {
    setDeleteMapId(id)
  }

  const handleDelete = () => {
    if (deleteMapId) {
      onDeleteMap(deleteMapId)
      setDeleteMapId(null)
    }
  }

  return (
    <div className="w-64 bg-muted border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Map
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {maps.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No maps yet. Create your first map!</div>
          ) : (
            <ul className="space-y-1">
              {maps.map((map) => (
                <li key={map.id}>
                  <div
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedMapId === map.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-1 truncate" onClick={() => onSelectMap(map.id)}>
                      <Map className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{map.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(map.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>

      {/* Create Map Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm()
          setIsCreateDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md max-h-9/10 h-full z-[1200]">
          <ScrollArea className="sm:max-w-md mt-2 mb-4 pr-4 relative mx-0 w-full max-h-8/10 max-w-fit">
            <DialogHeader>
              <DialogTitle>Create New Map</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="map-name" className="text-sm font-medium">
                  Map Name
                </label>
                <Input
                  id="map-name"
                  placeholder="Map Name"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  autoFocus
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="osm">OpenStreetMap</TabsTrigger>
                  <TabsTrigger value="custom">Custom Image</TabsTrigger>
                </TabsList>

                <TabsContent value="osm" className="space-y-4 pt-2">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <p className="text-sm">
                      Using OpenStreetMap as the base layer. This provides a standard world map that works well for
                      real-world locations.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 pt-2">
                  <ImageUpload
                    onImageSelected={setCustomImage}
                    onClearImage={() => setCustomImage(null)}
                    selectedImage={customImage?.dataUrl}
                  />
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMap}
                disabled={!newMapName.trim() || (activeTab === "custom" && !customImage)}
              >
                Create
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteMapId !== null} onOpenChange={(open) => !open && setDeleteMapId(null)}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Delete Map</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this map? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMapId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

