import { AnyAction, Dispatch } from "@reduxjs/toolkit"
import { useWeb3React } from "@web3-react/core"
import { Web3ReactContextInterface } from "@web3-react/core/dist/types"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { gatherChunks, FetchChunksParams } from "../libs/fetcher"
import { pointToString } from "../libs/pixel-changes"
import { boundChunks, chunkToImage } from "../libs/render"
import slice from "../redux/placeth"
import {
  ChunkMap,
  LocalChunk,
  LockingArea,
  PixelChangesMap,
  Point,
  State,
} from "../types"

const renderChunk = (
  context: CanvasRenderingContext2D,
  corner: Point,
  chunk: LocalChunk,
  dispatch: Dispatch<AnyAction>
): void => {
  //console.log("rendering chunk", chunk, "at corner", corner)
  //if (chunk.rendered) return
  const imageData = chunkToImage(chunk)
  context.putImageData(imageData, corner.x, corner.y)
  dispatch(slice.actions.addChunk({ ...chunk, rendered: true }))
}

const renderCanvas = (
  cellSize: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  chunkMap: ChunkMap,
  gatherChunks: (params: FetchChunksParams) => Promise<void>,
  pixelChangesMap: PixelChangesMap,
  dispatch: Dispatch<AnyAction>,
  lockingArea: LockingArea,
  web3Context: Web3ReactContextInterface<any>
) => {
  const canvas = document.getElementById("canvas") as any
  const width = canvas.width
  const height = canvas.height
  context.clearRect(0, 0, width, height)
  const chainId = web3Context.chainId ? web3Context.chainId : 1
  const chunkSize = 8
  const chunksToQuery = boundChunks(width, height, 1.5, offset)
  console.log("lets see whats up", chunksToQuery)
  const chunkIds = chunksToQuery.chunkVectors.map((vector) =>
    pointToString({ x: vector.x + 2 ** 12, y: vector.y + 2 ** 12 })
  )
  gatherChunks({ chunkIds, chainId, dispatch, chunkMap })
  const chunks = chunkIds.map((chunkId) => chunkMap[chunkId])
  const firstChunkVector = chunksToQuery.chunkVectors[0]
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    if (chunk === undefined) continue
    const chunkVector = chunksToQuery.chunkVectors[i]
    const chunkCorner = {
      x: (chunkVector.x - firstChunkVector.x) * chunkSize,
      y: (chunkVector.y - firstChunkVector.y) * chunkSize,
    }
    console.log("rendering", chunkCorner)
    renderChunk(context, chunkCorner, chunk, dispatch)
  }
  //renderLockingArea(width, height, context, lockingArea, cellSize)
}

const relativeCellCoords = (mousePoint: Point, zoom: number): Point => {
  return {
    x: Math.floor(mousePoint.x / zoom),
    y: Math.floor(mousePoint.y / zoom),
  }
}

const Canvas: React.FC = () => {
  const { pixelChangesMap, colorId, cursorMode, chunkMap, lockingArea, zoom } =
    useSelector<State, State>((state) => state)
  const dispatch = useDispatch()
  const web3Context = useWeb3React()

  const canvasRef = useRef(null)
  const [cellCorner, setCellCorner] = useState<Point>({ x: 0, y: 0 })
  const [anchorPoint, setAnchorPoint] = useState<Point>({ x: 0, y: 0 })
  const [mouseDown, setMouseDown] = useState<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (canvas) {
      const context = canvas.getContext("2d", {
        alpha: false,
      }) as CanvasRenderingContext2D
      renderCanvas(
        zoom,
        context,
        cellCorner,
        chunkMap,
        gatherChunks,
        pixelChangesMap,
        dispatch,
        lockingArea,
        web3Context
      )
    }
  }, [cellCorner, pixelChangesMap])

  /**
   *
   * new drag logic
   * offsets are always pixel based now
   * the "pixelCorner" refers to the pixel that appears top left corner
   * when you click, you store this pixel coordinates
   * drag event checks if pixel youre currently pointing is different
   * if it is, if will change the pixelCorner, update the anchor, and rerender
   *
   */

  const dragModeAnchorMouse = (event: MouseEvent) => {
    const absoluteCell = getAbsoluteCellPos(event, zoom)
    setAnchorPoint(absoluteCell)
    setMouseDown(true)
  }

  const dragModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const currentCell = getAbsoluteCellPos(event, zoom)
      const anchorDistance = {
        x: currentCell.x - anchorPoint.x,
        y: currentCell.y - anchorPoint.y,
      }
      if (anchorDistance.x === 0 && anchorDistance.y === 0) return

      setAnchorPoint(currentCell)
      const newOffset = {
        x: cellCorner.x + anchorDistance.x,
        y: cellCorner.y + anchorDistance.y,
      }
      setCellCorner(newOffset)
    }
  }

  const getAbsoluteCellPos = (event: MouseEvent, zoom: number): Point => {
    const chunkSize = zoom * 8
    const firstChunkVector = {
      x: Math.floor(cellCorner.x / (zoom * 8)),
      y: Math.floor(cellCorner.y / (zoom * 8)),
    }
    // get absolute pixel coordinates
    const firstCellAbsoluteCoords = {
      x: firstChunkVector.x * 8 + 2 ** 15,
      y: firstChunkVector.y * 8 + 2 ** 15,
    }
    const rel = relativeCellCoords({ x: event.clientX, y: event.clientY }, zoom)
    const p: Point = {
      x: firstCellAbsoluteCoords.x + rel.x,
      y: firstCellAbsoluteCoords.y + rel.y,
    }
    return p
  }

  const paintModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, zoom)
    dispatch(slice.actions.addPixelChange({ p, c: colorId }))
    setMouseDown(true)
  }

  const paintModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const p = getAbsoluteCellPos(event, zoom)
      dispatch(slice.actions.addPixelChange({ p, c: colorId }))
    }
  }

  const eraseModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, zoom)
    dispatch(slice.actions.addPixelChange({ p, c: undefined }))
    setMouseDown(true)
  }

  const eraseModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const p = getAbsoluteCellPos(event, zoom)
      dispatch(slice.actions.addPixelChange({ p, c: undefined }))
    }
  }

  const lockModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, zoom)
    dispatch(slice.actions.setLockingArea(p))
  }

  const updateMousePointer = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, zoom)
    const point = { x: p.x - 2 ** 15, y: p.y - 2 ** 15 }
    dispatch(slice.actions.changePointedPixel(point))
  }

  const modeHandlers = {
    drag: [dragModeAnchorMouse, dragModeMoveMouse],
    paint: [paintModeAnchorMouse, paintModeMoveMouse],
    erase: [eraseModeAnchorMouse, eraseModeMoveMouse],
    lock: [lockModeAnchorMouse, () => {}],
  }
  // @ts-ignore
  const [anchorMouse, moveMouse] = modeHandlers[cursorMode]

  return (
    <div
      className="canvasContainer"
      style={{ transform: `scale(${2}) translate(${200}px, ${200}px)` }}
    >
      <canvas
        id="canvas"
        style={{ border: "2px", borderStyle: "double", borderColor: "blue" }}
        ref={canvasRef}
        onMouseDown={anchorMouse as any}
        onMouseMove={(e) => {
          moveMouse(e)
          updateMousePointer(e as any)
        }}
        onMouseUp={() => setMouseDown(false)}
      />
    </div>
  )
}

export default Canvas
