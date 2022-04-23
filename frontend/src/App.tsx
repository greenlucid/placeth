import { useState } from "react"
import "./App.css"
import Canvas from "./components/Canvas"
import Panel from "./components/Panel"
import { PixelChange, Point } from "./types"

function App() {
  const [colorId, setColorId] = useState<number | undefined>(undefined)
  const [pixelChanges, setPixelChanges] = useState<PixelChange[]>([])

  console.log("current color is", colorId)
  return (
    <div>
      <Panel
        colorId={colorId}
        setColorId={setColorId}
        pixelChanges={pixelChanges}
        setPixelChanges={setPixelChanges}
      />
      <Canvas
        colorId={colorId}
        height={window.innerHeight}
        width={window.innerWidth}
      />
    </div>
  )
}

export default App
