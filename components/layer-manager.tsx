"use client"

import { useState } from "react"
import { Plus, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { type Layer, createNewLayer } from "@/lib/map-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "@/components/ui/color-picker"

interface LayerManagerProps {
  layers: Layer[]
  selectedLayerId: string | null
  onSelectLayer: (id: string) => void
  onUpdateLayers: (layers: Layer[]) => void
}

export function LayerManager({ layers, selectedLayerId, onSelectLayer, onUpdateLayers }: LayerManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newLayerName, setNewLayerName] = useState("")
  const [newLayerColor, setNewLayerColor] = useState("#3b82f6")
  const [editingLayer, setEditingLayer] = useState<Layer | null>(null)
  const [deleteLayerId, setDeleteLayerId] = useState<string | null>(null)

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      const newLayer = createNewLayer(newLayerName, newLayerColor)
      onUpdateLayers([...layers, newLayer])
      setNewLayerName("")
      setNewLayerColor("#3b82f6")
      setIsCreateDialogOpen(false)
      onSelectLayer(newLayer.id)
    }
  }

  const handleEditLayer = () => {
    if (editingLayer && editingLayer.name.trim()) {
      onUpdateLayers(layers.map((layer) => (layer.id === editingLayer.id ? editingLayer : layer)))
      setEditingLayer(null)
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteLayerId(id)
  }

  const handleDelete = () => {
    if (deleteLayerId) {
      onUpdateLayers(layers.filter((layer) => layer.id !== deleteLayerId))
      if (selectedLayerId === deleteLayerId) {
        onSelectLayer(layers.find((layer) => layer.id !== deleteLayerId)?.id || "")
      }
      setDeleteLayerId(null)
    }
  }

  const startEditLayer = (layer: Layer) => {
    setEditingLayer({ ...layer })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Layer
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {layers.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No layers yet. Create your first layer!</div>
          ) : (
            <ul className="space-y-2">
              {layers.map((layer) => (
                <li key={layer.id}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      selectedLayerId === layer.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => onSelectLayer(layer.id)}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: layer.color }} />
                      <span className="truncate">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditLayer(layer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => confirmDelete(layer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>

      {/* Create Layer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Layer</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="layer-name" className="text-sm font-medium">
                Layer Name
              </label>
              <Input
                id="layer-name"
                placeholder="Layer Name"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="layer-color" className="text-sm font-medium">
                Layer Color
              </label>
              <ColorPicker color={newLayerColor} onChange={setNewLayerColor} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLayer}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Layer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layer</DialogTitle>
          </DialogHeader>
          {editingLayer && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-layer-name" className="text-sm font-medium">
                  Layer Name
                </label>
                <Input
                  id="edit-layer-name"
                  placeholder="Layer Name"
                  value={editingLayer.name}
                  onChange={(e) => setEditingLayer({ ...editingLayer, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-layer-color" className="text-sm font-medium">
                  Layer Color
                </label>
                <ColorPicker
                  color={editingLayer.color}
                  onChange={(color) => setEditingLayer({ ...editingLayer, color })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLayer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteLayerId !== null} onOpenChange={(open) => !open && setDeleteLayerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Layer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this layer? All markers in this layer will also be deleted. This action
            cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLayerId(null)}>
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

