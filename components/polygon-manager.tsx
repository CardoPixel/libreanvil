"use client"

import { useState } from "react"
import { Hexagon, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Polygon, Layer } from "@/lib/map-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "@/components/ui/color-picker"
import { Slider } from "@/components/ui/slider"

interface PolygonManagerProps {
  polygons: Polygon[]
  layers: Layer[]
  selectedPolygonId: string | null
  onSelectPolygon: (id: string) => void
  onUpdatePolygons: (polygons: Polygon[]) => void
}

export function PolygonManager({
  polygons,
  layers,
  selectedPolygonId,
  onSelectPolygon,
  onUpdatePolygons,
}: PolygonManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPolygon, setEditingPolygon] = useState<Polygon | null>(null)
  const [deletePolygonId, setDeletePolygonId] = useState<string | null>(null)

  const handleEditPolygon = () => {
    if (editingPolygon) {
      onUpdatePolygons(polygons.map((polygon) => (polygon.id === editingPolygon.id ? editingPolygon : polygon)))
      setEditingPolygon(null)
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeletePolygonId(id)
  }

  const handleDelete = () => {
    if (deletePolygonId) {
      onUpdatePolygons(polygons.filter((polygon) => polygon.id !== deletePolygonId))
      if (selectedPolygonId === deletePolygonId) {
        onSelectPolygon(polygons.find((polygon) => polygon.id !== deletePolygonId)?.id || "")
      }
      setDeletePolygonId(null)
    }
  }

  const startEditPolygon = (polygon: Polygon) => {
    setEditingPolygon({ ...polygon })
    setIsEditDialogOpen(true)
  }

  // Group polygons by layer
  const polygonsByLayer = polygons.reduce(
    (acc, polygon) => {
      const layerId = polygon.layerId
      if (!acc[layerId]) {
        acc[layerId] = []
      }
      acc[layerId].push(polygon)
      return acc
    },
    {} as Record<string, Polygon[]>,
  )

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {polygons.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No polygons yet. Add polygons by clicking the polygon tool on the map.
            </div>
          ) : (
            <div className="space-y-6">
              {layers.map((layer) => {
                const layerPolygons = polygonsByLayer[layer.id] || []
                if (layerPolygons.length === 0) return null

                return (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                      <h3 className="font-medium">{layer.name}</h3>
                    </div>
                    <ul className="space-y-2 pl-5">
                      {layerPolygons.map((polygon) => (
                        <li key={polygon.id}>
                          <div
                            className={`flex items-center justify-between p-3 rounded-md border ${selectedPolygonId === polygon.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                              }`}
                          >
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => onSelectPolygon(polygon.id)}
                            >
                              <div
                                className="w-4 h-4 flex items-center justify-center"
                                style={{
                                  backgroundColor: polygon.fillColor || layer.color,
                                  opacity: polygon.fillOpacity || 0.3,
                                }}
                              >
                                <Hexagon className="h-3 w-3 text-black opacity-70" />
                              </div>
                              <div className="truncate">
                                <div className="font-medium truncate">{polygon.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {polygon.description || "No description"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => startEditPolygon(polygon)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => confirmDelete(polygon.id)}
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

      {/* Edit Polygon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-9/10 h-full z-[1200]">
          <ScrollArea className="sm:max-w-md mt-2 mb-4 pr-4 relative mx-0 w-full max-h-7/10 max-w-fit">
            <DialogHeader>
              <DialogTitle>Edit Polygon</DialogTitle>
            </DialogHeader>
            {editingPolygon && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="edit-polygon-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="edit-polygon-title"
                    placeholder="Polygon Title"
                    value={editingPolygon.title}
                    onChange={(e) => setEditingPolygon({ ...editingPolygon, title: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-polygon-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="edit-polygon-description"
                    placeholder="Polygon Description"
                    value={editingPolygon.description || ""}
                    onChange={(e) => setEditingPolygon({ ...editingPolygon, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-polygon-layer" className="text-sm font-medium">
                    Layer
                  </label>
                  <Select
                    value={editingPolygon.layerId}
                    onValueChange={(value) => setEditingPolygon({ ...editingPolygon, layerId: value })}
                  >
                    <SelectTrigger id="edit-polygon-layer">
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
                  <label htmlFor="edit-polygon-fill-color" className="text-sm font-medium">
                    Fill Color
                  </label>
                  <ColorPicker
                    color={editingPolygon.fillColor || "#3388ff"}
                    onChange={(color) => setEditingPolygon({ ...editingPolygon, fillColor: color })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-polygon-stroke-color" className="text-sm font-medium">
                    Border Color
                  </label>
                  <ColorPicker
                    color={editingPolygon.strokeColor || "#3388ff"}
                    onChange={(color) => setEditingPolygon({ ...editingPolygon, strokeColor: color })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="edit-polygon-opacity" className="text-sm font-medium">
                      Fill Opacity
                    </label>
                    <span className="text-sm text-muted-foreground">{editingPolygon.fillOpacity || 0.3}</span>
                  </div>
                  <Slider
                    value={[editingPolygon.fillOpacity ? editingPolygon.fillOpacity * 100 : 30]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setEditingPolygon({ ...editingPolygon, fillOpacity: value[0] / 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="edit-polygon-stroke-width" className="text-sm font-medium">
                      Border Width
                    </label>
                    <span className="text-sm text-muted-foreground">{editingPolygon.strokeWidth || 2}px</span>
                  </div>
                  <Slider
                    value={[editingPolygon.strokeWidth || 2]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(value) => setEditingPolygon({ ...editingPolygon, strokeWidth: value[0] })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-polygon-link" className="text-sm font-medium">
                    Link (optional)
                  </label>
                  <Input
                    id="edit-polygon-link"
                    placeholder="Link to another part of the app"
                    value={editingPolygon.link || ""}
                    onChange={(e) => setEditingPolygon({ ...editingPolygon, link: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {`Enter an internal link (e.g., "timeline/event-1") to link to another part of the app`}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditPolygon}>Save</Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletePolygonId !== null} onOpenChange={(open) => !open && setDeletePolygonId(null)}>
        <DialogContent className="z-[1200]">
          <DialogHeader>
            <DialogTitle>Delete Polygon</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this polygon? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePolygonId(null)}>
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

