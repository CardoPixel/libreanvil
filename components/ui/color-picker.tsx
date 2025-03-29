"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(color)
  const presetColors = [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff",
    "#ff0080",
    "#000000",
    "#808080",
    "#ffffff",
  ]

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Validate if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onChange(value)
    }
  }

  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start", className)}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md border border-border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: color }} />
              <Input value={inputValue} onChange={handleInputChange} placeholder="#000000" className="flex-1" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Presets</div>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={cn(
                    "w-full h-6 rounded-md border border-border",
                    color === presetColor && "ring-2 ring-primary ring-offset-2",
                  )}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePresetClick(presetColor)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

