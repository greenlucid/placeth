import { useState } from "react"
import Canvas from "../components/Canvas"
import Panel from "../components/Panel"
import { PixelChangesMap } from "../types"

const Placeth: React.FC = () => {
  const [colorId, setColorId] = useState<number | undefined>(undefined)
  const [pixelChangesMap, setPixelChangesMap] = useState<PixelChangesMap>({})

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

export default Placeth
