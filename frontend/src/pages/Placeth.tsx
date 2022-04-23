import { useState } from "react"
import Canvas from "../components/Canvas"
import Panel from "../components/Panel"
import { PixelChangesMap, Point } from "../types"

const Placeth: React.FC = () => {
  const [colorId, setColorId] = useState<number | undefined>(undefined)
  const [pixelChangesMap, setPixelChangesMap] = useState<PixelChangesMap>({})
  const [cursorMode, setCursorMode] = useState<string>("drag")
  const [lockingArea, setLockingArea] = useState<
    { a: Point; b: Point } | undefined
  >()

  return (
    <div>
      <Panel
        colorId={colorId}
        setColorId={setColorId}
        pixelChangesMap={pixelChangesMap}
        setPixelChangesMap={setPixelChangesMap}
        lockingArea={lockingArea}
        setLockingArea={setLockingArea}
        cursorMode={cursorMode}
        setCursorMode={setCursorMode}
      />
      <Canvas
        colorId={colorId}
        height={window.innerHeight}
        width={window.innerWidth}
        pixelChangesMap={pixelChangesMap}
        setPixelChangesMap={setPixelChangesMap}
        lockingArea={lockingArea}
        setLockingArea={setLockingArea}
        cursorMode={cursorMode}
        setCursorMode={setCursorMode}
      />
    </div>
  )
}

export default Placeth
