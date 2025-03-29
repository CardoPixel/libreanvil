"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fileToDataUrl, getImageDimensions } from "@/lib/custom-tile-layer"

interface ImageUploadProps {
  onImageSelected: (imageData: {
    dataUrl: string
    width: number
    height: number
    file: File
  }) => void
  onClearImage: () => void
  selectedImage?: string | null
}

export function ImageUpload({ onImageSelected, onClearImage, selectedImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(selectedImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Convert file to data URL
      const dataUrl = await fileToDataUrl(file)

      // Get image dimensions
      const dimensions = await getImageDimensions(dataUrl)

      // Set preview
      setPreview(dataUrl)

      // Call callback with image data
      onImageSelected({
        dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        file,
      })
    } catch (err) {
      setError("Error processing image. Please try another file.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClearImage()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="map-image">Map Image</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="map-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          {preview && (
            <Button variant="outline" size="icon" onClick={handleClearImage} title="Clear image">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Image Preview</Label>
        <div className="border rounded-md p-2 flex items-center justify-center bg-muted/30 h-48">
          {isUploading ? (
            <div className="text-center text-muted-foreground">Loading preview...</div>
          ) : preview ? (
            <div className="relative w-full h-full">
              <img src={preview || "/placeholder.svg"} alt="Map preview" className="object-contain w-full h-full" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
              <ImageIcon className="h-12 w-12 opacity-30" />
              <p>No image selected</p>
              <p className="text-xs max-w-64">
                Recommended: 2048×2048px PNG or JPEG. Larger images will provide better detail when zooming.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Recommended image size: 2048×2048 pixels or larger</p>
        <p>• Supported formats: PNG, JPEG, WebP</p>
        <p>• Maximum file size: 10MB</p>
        <p>• Square images work best for maps</p>
      </div>
    </div>
  )
}

