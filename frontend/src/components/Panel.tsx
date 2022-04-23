import { ColorResult, SwatchesPicker } from "react-color"
import { useDispatch, useSelector } from "react-redux"
import { hexToColorId, palette } from "../libs/colors"
import encodePixelChanges, { pixelChangesMapToArr } from "../libs/pixel-changes"
import {
  loadChangeColorId,
  loadChangeCursorMode,
  loadDeletePixelChanges,
} from "../redux/actions"
import slice from "../redux/placeth"
import { PixelChangesMap, Point, State } from "../types"

const DragButton: React.FC = () => {
  const actions = slice.actions
  console.log(actions)
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(loadChangeColorId(undefined))
        dispatch(loadChangeCursorMode("drag"))
      }}
    >
      Drag Mode
    </button>
  )
}

const EraseButton: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(loadChangeColorId(undefined))
        dispatch(loadChangeCursorMode("erase"))
      }}
    >
      Erase Mode
    </button>
  )
}

const DeleteChangesButton: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(loadDeletePixelChanges())
      }}
    >
      Delete All Changes
    </button>
  )
}

const CommitButton: React.FC = () => {
  const pixelChangesMap = useSelector<State, PixelChangesMap>(
    (state) => state.pixelChangesMap
  )
  const dispatch = useDispatch()
  const clickable = Object.values(pixelChangesMap).length !== 0
  const commitChanges = async () => {
    const pixelChanges = pixelChangesMapToArr(pixelChangesMap)
    const calldata = encodePixelChanges(pixelChanges)
    console.log(calldata)

    // whatever
    // when confirmed, flush the changes
    dispatch(loadDeletePixelChanges())
  }
  return (
    <button disabled={!clickable} onClick={commitChanges}>
      Commit Changes
    </button>
  )
}

const empackArray = (items: any, size: number) => {  
  const packs = []
  items = [].concat(...items)

  while (items.length) {
    packs.push(
      items.splice(0, size)
    )
  }

  return packs
}

const packedPalette = empackArray(palette, 2)

const Panel: React.FC = () => {
  const dispatch = useDispatch()
  const colorId = useSelector<State, number>(state => state.colorId)

  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    dispatch(loadChangeColorId(newColorId))
    dispatch(loadChangeCursorMode("paint"))
  }

  return (
    <div className="panel">
      drag around to load! :)
      <DragButton />
      <EraseButton />
      <DeleteChangesButton />
      <SwatchesPicker
        color={colorId ? palette[colorId] : undefined}
        colors={packedPalette}
        onChange={handleChange}
      />
      <CommitButton />
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
