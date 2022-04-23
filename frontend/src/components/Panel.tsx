import { ColorResult, SwatchesPicker } from "react-color"
import { hexToColorId, palette } from "../libs/colors"
import encodePixelChanges, { pixelChangesMapToArr } from "../libs/pixel-changes"
import { PixelChangesMap, Point } from "../types"

const DragButton: React.FC<{
  setCursorMode: React.Dispatch<React.SetStateAction<string>>
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = ({ setCursorMode, setColorId }) => {
  return (
    <button
      onClick={() => {
        setColorId(undefined)
        setCursorMode("drag")
      }}
    >
      Drag Mode
    </button>
  )
}

const EraseButton: React.FC<{
  setCursorMode: React.Dispatch<React.SetStateAction<string>>
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = ({ setCursorMode, setColorId }) => {
  return (
    <button
      onClick={() => {
        setColorId(undefined)
        setCursorMode("erase")
      }}
    >
      Erase Mode
    </button>
  )
}

const DeleteChangesButton: React.FC<{
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
}> = ({ setPixelChangesMap }) => {
  return (
    <button
      onClick={() => {
        setPixelChangesMap({})
      }}
    >
      Delete All Changes
    </button>
  )
}

const CommitButton: React.FC<{
  pixelChangesMap: PixelChangesMap
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
}> = ({ pixelChangesMap, setPixelChangesMap }) => {
  const clickable = Object.values(pixelChangesMap).length !== 0
  const commitChanges = async () => {
    const pixelChanges = pixelChangesMapToArr(pixelChangesMap)
    const calldata = encodePixelChanges(pixelChanges)
    console.log(calldata)

    // whatever
    // when confirmed, flush the changes
    setPixelChangesMap({})
  }
  return (
    <button disabled={!clickable} onClick={commitChanges}>
      Commit Changes
    </button>
  )
}

const Panel: React.FC<{
  colorId: number | undefined
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
  pixelChangesMap: PixelChangesMap
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
  lockingArea:
    | {
        a: Point
        b: Point
      }
    | undefined
  setLockingArea: React.Dispatch<
    React.SetStateAction<
      | {
          a: Point
          b: Point
        }
      | undefined
    >
  >
  cursorMode: string
  setCursorMode: React.Dispatch<React.SetStateAction<string>>
}> = (props) => {
  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    props.setColorId(newColorId)
    props.setCursorMode("paint")
  }

  return (
    <div className="panel">
      drag around to load! :)
      <DragButton
        setCursorMode={props.setCursorMode}
        setColorId={props.setColorId}
      />
      <EraseButton
        setCursorMode={props.setCursorMode}
        setColorId={props.setColorId}
      />
      <DeleteChangesButton setPixelChangesMap={props.setPixelChangesMap} />
      <SwatchesPicker
        color={props.colorId ? palette[props.colorId] : undefined}
        colors={[palette]}
        onChange={handleChange}
      />
      <CommitButton
        pixelChangesMap={props.pixelChangesMap}
        setPixelChangesMap={props.setPixelChangesMap}
      />
      <div>
        <a href="/lockings">LOCKINGS</a>
      </div>
      <div>
        <a href="/help">HELP</a>
      </div>
    </div>
  )
}

export default Panel
