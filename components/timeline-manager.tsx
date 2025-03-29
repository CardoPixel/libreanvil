"use client"

import { useState } from "react"
import { Plus, Trash2, Edit, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { type TimelineEvent, type Layer, createNewTimelineEvent } from "@/lib/map-data"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimelineManagerProps {
  timelineEvents: TimelineEvent[]
  layers: Layer[]
  selectedTimelineEventId: string | null
  activeTimelineEventId: string | null
  onSelectTimelineEvent: (id: string) => void
  onActivateTimelineEvent: (id: string) => void
  onUpdateTimelineEvents: (timelineEvents: TimelineEvent[]) => void
}

export function TimelineManager({
  timelineEvents,
  layers,
  selectedTimelineEventId,
  activeTimelineEventId,
  onSelectTimelineEvent,
  onActivateTimelineEvent,
  onUpdateTimelineEvents,
}: TimelineManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newEventName, setNewEventName] = useState("")
  const [newEventYear, setNewEventYear] = useState("")
  const [newEventDescription, setNewEventDescription] = useState("")
  const [newEventLayerIds, setNewEventLayerIds] = useState<string[]>([])
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)

  const handleCreateEvent = () => {
    if (newEventName.trim()) {
      const newEvent = createNewTimelineEvent(newEventName, newEventYear, newEventDescription, newEventLayerIds)
      onUpdateTimelineEvents([...timelineEvents, newEvent])
      resetNewEventForm()
      setIsCreateDialogOpen(false)
      onSelectTimelineEvent(newEvent.id)
    }
  }

  const resetNewEventForm = () => {
    setNewEventName("")
    setNewEventYear("")
    setNewEventDescription("")
    setNewEventLayerIds([])
  }

  const handleEditEvent = () => {
    if (editingEvent && editingEvent.name.trim()) {
      onUpdateTimelineEvents(timelineEvents.map((event) => (event.id === editingEvent.id ? editingEvent : event)))
      setEditingEvent(null)
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteEventId(id)
  }

  const handleDelete = () => {
    if (deleteEventId) {
      onUpdateTimelineEvents(timelineEvents.filter((event) => event.id !== deleteEventId))
      if (selectedTimelineEventId === deleteEventId) {
        onSelectTimelineEvent(timelineEvents.find((event) => event.id !== deleteEventId)?.id || "")
      }
      if (activeTimelineEventId === deleteEventId) {
        onActivateTimelineEvent(timelineEvents.find((event) => event.id !== deleteEventId)?.id || "")
      }
      setDeleteEventId(null)
    }
  }

  const startEditEvent = (event: TimelineEvent) => {
    setEditingEvent({ ...event })
    setIsEditDialogOpen(true)
  }

  const toggleLayerForNewEvent = (layerId: string) => {
    setNewEventLayerIds((prev) => (prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]))
  }

  const toggleLayerForEditingEvent = (layerId: string) => {
    if (!editingEvent) return

    setEditingEvent({
      ...editingEvent,
      layerIds: editingEvent.layerIds.includes(layerId)
        ? editingEvent.layerIds.filter((id) => id !== layerId)
        : [...editingEvent.layerIds, layerId],
    })
  }

  // Sort timeline events by year
  const sortedEvents = [...timelineEvents].sort((a, b) => {
    const yearA = a.year ? Number.parseInt(a.year) : 0
    const yearB = b.year ? Number.parseInt(b.year) : 0
    return yearA - yearB
  })

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          New Timeline Event
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {timelineEvents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No timeline events yet. Create your first event!
            </div>
          ) : (
            <div className="relative pl-6 border-l border-border">
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="mb-6 relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute w-4 h-4 rounded-full border-2 left-[-10px] top-1.5 ${activeTimelineEventId === event.id
                        ? "bg-primary border-primary"
                        : "bg-background border-muted-foreground"
                      }`}
                  />

                  <div
                    className={`ml-4 p-4 rounded-md border ${selectedTimelineEventId === event.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => onSelectTimelineEvent(event.id)}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{event.name}</div>
                          {event.year && <div className="text-sm text-muted-foreground">{event.year}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={activeTimelineEventId === event.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => onActivateTimelineEvent(event.id)}
                        >
                          {activeTimelineEventId === event.id ? "Active" : "Activate"}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditEvent(event)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => confirmDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {event.description && <div className="mt-2 text-sm">{event.description}</div>}

                    {event.layerIds.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Visible Layers:</div>
                        <div className="flex flex-wrap gap-1">
                          {event.layerIds.map((layerId) => {
                            const layer = layers.find((l) => l.id === layerId)
                            if (!layer) return null

                            return (
                              <div
                                key={layerId}
                                className="text-xs px-2 py-1 rounded-full bg-muted flex items-center gap-1"
                              >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                                <span>{layer.name}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Timeline Event</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="event-name" className="text-sm font-medium">
                Event Name
              </label>
              <Input
                id="event-name"
                placeholder="Event Name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="event-year" className="text-sm font-medium">
                Year/Date (optional)
              </label>
              <Input
                id="event-year"
                placeholder="e.g., 1500 BCE, Third Age, etc."
                value={newEventYear}
                onChange={(e) => setNewEventYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="event-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="event-description"
                placeholder="Event Description"
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visible Layers</label>
              <div className="border rounded-md p-3 space-y-2">
                {layers.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No layers available</div>
                ) : (
                  layers.map((layer) => (
                    <div key={layer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`layer-${layer.id}`}
                        checked={newEventLayerIds.includes(layer.id)}
                        onCheckedChange={() => toggleLayerForNewEvent(layer.id)}
                      />
                      <label
                        htmlFor={`layer-${layer.id}`}
                        className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                        {layer.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Select which layers should be visible when this event is active
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timeline Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-event-name" className="text-sm font-medium">
                  Event Name
                </label>
                <Input
                  id="edit-event-name"
                  placeholder="Event Name"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-event-year" className="text-sm font-medium">
                  Year/Date (optional)
                </label>
                <Input
                  id="edit-event-year"
                  placeholder="e.g., 1500 BCE, Third Age, etc."
                  value={editingEvent.year || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-event-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="edit-event-description"
                  placeholder="Event Description"
                  value={editingEvent.description || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visible Layers</label>
                <div className="border rounded-md p-3 space-y-2">
                  {layers.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No layers available</div>
                  ) : (
                    layers.map((layer) => (
                      <div key={layer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-layer-${layer.id}`}
                          checked={editingEvent.layerIds.includes(layer.id)}
                          onCheckedChange={() => toggleLayerForEditingEvent(layer.id)}
                        />
                        <label
                          htmlFor={`edit-layer-${layer.id}`}
                          className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                          {layer.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which layers should be visible when this event is active
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEvent}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteEventId !== null} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timeline Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">Are you sure you want to delete this timeline event? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEventId(null)}>
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

