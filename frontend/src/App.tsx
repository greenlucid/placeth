import { useState } from "react"
import "./App.css"
import Canvas from "./components/Canvas"
import Panel from "./components/Panel"
import { PixelChange, Point } from "./types"

function App() {
  const [colorId, setColorId] = useState<number | undefined>(undefined)
  const [pixelChanges, setPixelChanges] = useState<PixelChange[]>([])
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })

  console.log("current color is", colorId)
  return (
    <div>
      <Panel colorId={colorId} setColorId={setColorId} />
      <Canvas colorId={colorId} height={window.innerHeight} width={window.innerWidth} />
    </div>
  )
}

export default App
