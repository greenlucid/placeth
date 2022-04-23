import { ColorResult, SwatchesPicker } from "react-color"
import { hexToColorId, palette } from "../libs/colors"
import encodePixelChanges, { pixelChangesMapToArr } from "../libs/pixel-changes"
import { PixelChangesMap } from "../types"

const DragButton: React.FC<{
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = ({ setColorId }) => {
  return <button onClick={() => setColorId(undefined)}>Drag Mode</button>
}

const CommitButton: React.FC<{
  pixelChangesMap: PixelChangesMap
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
}> = (props) => {
  const commitChanges = async () => {
    const pixelChanges = pixelChangesMapToArr(props.pixelChangesMap)
    const calldata = encodePixelChanges(pixelChanges)
    console.log(calldata)

    // whatever
    // when confirmed, flush the changes
    props.setPixelChangesMap({})
  }
  return <button onClick={commitChanges}>Commit Changes</button>
}

const Panel: React.FC<{
  colorId: number | undefined
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
  pixelChangesMap: PixelChangesMap
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
}> = (props) => {
  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    props.setColorId(newColorId)
  }

  return (
    <div className="panel">
      drag around to load! :)
      <DragButton setColorId={props.setColorId} />
      <SwatchesPicker
        color={props.colorId ? palette[props.colorId] : undefined}
        colors={[palette]}
        onChange={handleChange}
      />
      <CommitButton
        pixelChangesMap={props.pixelChangesMap}
        setPixelChangesMap={props.setPixelChangesMap}
      />
      <a href="/help">HELP</a>
    </div>
  )
}

export default Panel
