import { useState } from "react"
import "./App.css"
import Canvas from "./components/Canvas"
import Panel from "./components/Panel"
import { PixelChangesMap, Point } from "./types"

function App() {
  const [colorId, setColorId] = useState<number | undefined>(undefined)
  const [pixelChangesMap, setPixelChangesMap] = useState<PixelChangesMap>({})

  console.log("current color is", colorId)
  return (
    <div>
      <Panel
        colorId={colorId}
        setColorId={setColorId}
        pixelChangesMap={pixelChangesMap}
        setPixelChangesMap={setPixelChangesMap}
      />
      <Canvas
        colorId={colorId}
        height={window.innerHeight}
        width={window.innerWidth}
        pixelChangesMap={pixelChangesMap}
        setPixelChangesMap={setPixelChangesMap}
      />
    </div>
  )
}

export default App
