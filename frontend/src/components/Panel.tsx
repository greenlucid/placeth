import { ethers } from "ethers"
import { ColorResult, SwatchesPicker } from "react-color"
import { useDispatch, useSelector } from "react-redux"
import { hexToColorId, palette } from "../libs/colors"
import encodePixelChanges, { pixelChangesMapToArr } from "../libs/pixel-changes"

import placeAbi from "../abis/place.json"
import slice from "../redux/placeth"
import { PixelChangesMap, Point, State } from "../types"
import { useWeb3React } from "@web3-react/core"

const DragButton: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(slice.actions.changeColorId(undefined))
        dispatch(slice.actions.changeCursorMode("drag"))
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
        dispatch(slice.actions.changeColorId(undefined))
        dispatch(slice.actions.changeCursorMode("erase"))
      }}
    >
      Erase Mode
    </button>
  )
}

const LockModeButton: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(slice.actions.changeColorId(undefined))
        dispatch(slice.actions.changeCursorMode("lock"))
      }}
    >
      Lock Mode
    </button>
  )
}

const ZoomButtons: React.FC = () => {
  const dispatch = useDispatch()
  const zoom = useSelector<State, number>((state) => state.zoom)
  return (
    <>
      <button
        onClick={() => {
          dispatch(slice.actions.changeZoom(zoom - 1))
        }}
      >
        - Zoom
      </button>
      <button
        onClick={() => {
          dispatch(slice.actions.changeZoom(zoom + 1))
        }}
      >
        + Zoom
      </button>
      Current zoom: {zoom}
    </>
  )
}

const DeleteChangesButton: React.FC = () => {
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => {
        dispatch(slice.actions.deletePixelChanges())
      }}
    >
      Delete All Changes
    </button>
  )
}

const CommitButton: React.FC = () => {
  const web3React = useWeb3React()
  const pixelChangesMap = useSelector<State, PixelChangesMap>(
    (state) => state.pixelChangesMap
  )
  const dispatch = useDispatch()
  const clickable = Object.values(pixelChangesMap).length !== 0
  const commitChanges = async () => {
    if (!web3React.account) return
    // @ts-ignore
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner(
      web3React.account
    )
    const gtcr = new ethers.Contract(
      "0xb25ba694e53ed11fa7e1aeca8cc640f85af5b436",
      placeAbi,
      signer
    )

    const pixelChanges = pixelChangesMapToArr(pixelChangesMap)
    const calldata = encodePixelChanges(pixelChanges)
    await gtcr.changePixels(calldata)

    dispatch(slice.actions.deletePixelChanges())
  }
  return (
    <button disabled={!clickable} onClick={commitChanges}>
      Commit Changes
    </button>
  )
}

const PointedPixel: React.FC = () => {
  const pointedPixel = useSelector<State, Point>((state) => state.pointedPixel)
  const rel = {
    x: pointedPixel.x - 2 ** 15,
    y: pointedPixel.y - 2 ** 15
  }
  return (
    <div>
      ({rel.x}, {rel.y})
    </div>
  )
}

const empackArray = (items: any, size: number) => {
  const packs = []
  items = [].concat(...items)

  while (items.length) {
    packs.push(items.splice(0, size))
  }

  return packs
}

const packedPalette = empackArray(palette, 2)

const Panel: React.FC = () => {
  const dispatch = useDispatch()
  const colorId = useSelector<State, number>((state) => state.colorId)

  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    dispatch(slice.actions.changeColorId(newColorId))
    dispatch(slice.actions.changeCursorMode("paint"))
  }

  return (
    <div className="panel">
      drag around to keep reloading the canvas! :)
      <PointedPixel />
      <DragButton />
      <EraseButton />
      <LockModeButton />
      <DeleteChangesButton />
      <ZoomButtons />
      <SwatchesPicker
        className="colorPicker"
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
