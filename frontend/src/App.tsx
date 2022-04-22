import { useState } from "react"
import "./App.css"
import Canvas from "./components/Canvas"
import ColorPanel from "./components/ColorPanel"
import { PixelChange, Point } from "./types"

function App() {
  const [colorId, setColorId] = useState<number>(0)
  const [pixelChanges, setPixelChanges] = useState<PixelChange[]>([])
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })

  console.log("current color is", colorId)
  return (
    <div>
      <ColorPanel colorId={colorId} setColorId={setColorId} />
      <Canvas height={window.innerHeight} width={window.innerWidth} />
    </div>
  )
}

export default App
