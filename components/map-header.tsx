import { Wifi, WifiOff } from "lucide-react"

interface MapHeaderProps {
  isOnline: boolean
}

export function MapHeader({ isOnline }: MapHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">LibreAnvil</h1>
        <span className="text-sm">Offline Open Source Worldbuilder</span>
      </div>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center gap-1 text-green-300">
            <Wifi className="h-4 w-4" />
            <span className="text-xs">Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-yellow-300">
            <WifiOff className="h-4 w-4" />
            <span className="text-xs">Offline</span>
          </div>
        )}
      </div>
    </header>
  )
}

