"use client"

import { useState } from "react"
import { Trash2, Edit, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Marker, Layer } from "@/lib/map-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "@/components/ui/color-picker"

interface MarkerManagerProps {
  markers: Marker[]
  layers: Layer[]
  selectedMarkerId: string | null
  onSelectMarker: (id: string) => void
  onUpdateMarkers: (markers: Marker[]) => void
}

export function MarkerManager({
  markers,
  layers,
  selectedMarkerId,
  onSelectMarker,
  onUpdateMarkers,
}: MarkerManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null)
  const [deleteMarkerId, setDeleteMarkerId] = useState<string | null>(null)

  const handleEditMarker = () => {
    if (editingMarker) {
      onUpdateMarkers(markers.map((marker) => (marker.id === editingMarker.id ? editingMarker : marker)))
      setEditingMarker(null)
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteMarkerId(id)
  }

  const handleDelete = () => {
    if (deleteMarkerId) {
      onUpdateMarkers(markers.filter((marker) => marker.id !== deleteMarkerId))
      if (selectedMarkerId === deleteMarkerId) {
        onSelectMarker(markers.find((marker) => marker.id !== deleteMarkerId)?.id || "")
      }
      setDeleteMarkerId(null)
    }
  }

  const startEditMarker = (marker: Marker) => {
    setEditingMarker({ ...marker })
    setIsEditDialogOpen(true)
  }

  // Group markers by layer
  const markersByLayer = markers.reduce(
    (acc, marker) => {
      const layerId = marker.layerId
      if (!acc[layerId]) {
        acc[layerId] = []
      }
      acc[layerId].push(marker)
      return acc
    },
    {} as Record<string, Marker[]>,
  )

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {markers.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No markers yet. Add markers by clicking on the map in the Map tab.
            </div>
          ) : (
            <div className="space-y-6">
              {layers.map((layer) => {
                const layerMarkers = markersByLayer[layer.id] || []
                if (layerMarkers.length === 0) return null

                return (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                      <h3 className="font-medium">{layer.name}</h3>
                    </div>
                    <ul className="space-y-2 pl-5">
                      {layerMarkers.map((marker) => (
                        <li key={marker.id}>
                          <div
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              selectedMarkerId === marker.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => onSelectMarker(marker.id)}
                            >
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: marker.iconColor || "#ff0000" }}
                              >
                                <MapPin className="h-3 w-3 text-white" />
                              </div>
                              <div className="truncate">
                                <div className="font-medium truncate">{marker.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {marker.description || "No description"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => startEditMarker(marker)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => confirmDelete(marker.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Marker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Marker</DialogTitle>
          </DialogHeader>
          {editingMarker && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-marker-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="edit-marker-title"
                  placeholder="Marker Title"
                  value={editingMarker.title}
                  onChange={(e) => setEditingMarker({ ...editingMarker, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-marker-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-marker-description"
                  placeholder="Marker Description"
                  value={editingMarker.description || ""}
                  onChange={(e) => setEditingMarker({ ...editingMarker, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-marker-layer" className="text-sm font-medium">
                  Layer
                </label>
                <Select
                  value={editingMarker.layerId}
                  onValueChange={(value) => setEditingMarker({ ...editingMarker, layerId: value })}
                >
                  <SelectTrigger id="edit-marker-layer">
                    <SelectValue placeholder="Select Layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {layers.map((layer) => (
                      <SelectItem key={layer.id} value={layer.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                          {layer.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-marker-color" className="text-sm font-medium">
                  Marker Color
                </label>
                <ColorPicker
                  color={editingMarker.iconColor || "#ff0000"}
                  onChange={(color) => setEditingMarker({ ...editingMarker, iconColor: color })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-marker-link" className="text-sm font-medium">
                  Link (optional)
                </label>
                <Input
                  id="edit-marker-link"
                  placeholder="Link to another part of the app"
                  value={editingMarker.link || ""}
                  onChange={(e) => setEditingMarker({ ...editingMarker, link: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Enter an internal link (e.g., "timeline/event-1") to link to another part of the app
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-marker-lat" className="text-sm font-medium">
                    Latitude
                  </label>
                  <Input
                    id="edit-marker-lat"
                    type="number"
                    step="0.000001"
                    value={editingMarker.lat}
                    onChange={(e) => setEditingMarker({ ...editingMarker, lat: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-marker-lng" className="text-sm font-medium">
                    Longitude
                  </label>
                  <Input
                    id="edit-marker-lng"
                    type="number"
                    step="0.000001"
                    value={editingMarker.lng}
                    onChange={(e) => setEditingMarker({ ...editingMarker, lng: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMarker}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteMarkerId !== null} onOpenChange={(open) => !open && setDeleteMarkerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Marker</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this marker? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMarkerId(null)}>
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

