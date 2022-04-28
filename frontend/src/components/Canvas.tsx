import { AnyAction, Dispatch } from "@reduxjs/toolkit"
import { useWeb3React } from "@web3-react/core"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import conf from "../config"
import { palette } from "../libs/colors"
import chunkToColors, {
  changesOverlay,
  hexStringToBytes,
} from "../libs/decode-chunk"
import { pointToString } from "../libs/pixel-changes"
import {
  loadAddChunk,
  loadAddPixelChange,
  loadSetLockingArea,
} from "../redux/actions"
import slice from "../redux/placeth"
import {
  Chunk,
  ChunkMap,
  LocalChunk,
  LockingArea,
  PixelChangesMap,
  Point,
  State,
} from "../types"

const boundChunks = (
  width: number,
  height: number,
  chunkSize: number,
  offset: Point
): { chunkIds: Point[]; rowLength: number; columnLength: number } => {
  const firstChunk = {
    x: Math.floor((offset.x - width / 2) / chunkSize),
    y: Math.floor((offset.y - height / 2) / chunkSize),
  }
  const lastChunk = {
    x: Math.ceil((offset.x + width / 2) / chunkSize),
    y: Math.ceil((offset.y + height / 2) / chunkSize),
  }
  const chunksToQuery = []

  for (let i = firstChunk.x; i <= lastChunk.x; i++) {
    for (let j = firstChunk.y; j <= lastChunk.y; j++) {
      chunksToQuery.push({ x: i, y: j })
    }
  }
  const rowLength = lastChunk.x + 1 - firstChunk.x
  const columnLength = lastChunk.y + 1 - firstChunk.y
  return { chunkIds: chunksToQuery, rowLength, columnLength }
}

const renderChunk = (
  context: CanvasRenderingContext2D,
  corner: Point,
  chunkSize: number,
  cellSize: number,
  chunk: LocalChunk | "loading" | undefined,
  changes: Array<number | undefined>
): void => {
  if (chunk === undefined || chunk === "loading") {
    // loading...
    const lightgray = "#999999"
    context.fillStyle = lightgray
    context.fillRect(corner.x, corner.y, chunkSize, chunkSize)
    context.fillStyle = lightgray
    context.strokeStyle = "#000000"
    context.beginPath()
    context.arc(corner.x + cellSize * 4, corner.y + cellSize * 4, 30, 0, 10)
    context.stroke()
  } else {
    // render loaded chunk
    const pixels = chunkToColors(chunk)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const pixel = pixels[j * 8 + i] // XD
        context.fillStyle = pixel.color
        const pixelCorner = {
          x: corner.x + i * cellSize,
          y: corner.y + j * cellSize,
        }
        context.fillRect(pixelCorner.x, pixelCorner.y, cellSize, cellSize)
      }
    }
    // render changes on top
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const change = changes[i * 8 + j]
        if (change !== undefined) {
          context.fillStyle = palette[change]
          const pixelCorner = {
            x: corner.x + i * cellSize,
            y: corner.y + j * cellSize,
          }
          context.fillRect(pixelCorner.x, pixelCorner.y, cellSize, cellSize)
        }
      }
    }
  }
}

const renderLockingArea = (
  context: CanvasRenderingContext2D,
  lockingArea: LockingArea,
  firstChunkId: Point,
  cellSize: number
): void => {
  const absoluteChunkId = {
    x: firstChunkId.x + 2 ** 12,
    y: firstChunkId.y + 2 ** 12,
  }
  const firstPixelId = {
    x: absoluteChunkId.x * 8,
    y: absoluteChunkId.y * 8,
  }
  if (lockingArea.start === undefined) return
  if (lockingArea.end === undefined) {
    // draw first one
    const canvasStart = {
      x: lockingArea.start.x - firstPixelId.x * cellSize,
      y: lockingArea.start.y - firstPixelId.y * cellSize,
    }
    context.fillStyle = "#dddd00"
    context.rect(
      canvasStart.x + cellSize * 0.25,
      canvasStart.x + cellSize * 0.25,
      cellSize * 0.25,
      cellSize * 0.25
    )
  } else {
    context.strokeStyle = "#dddd00"
    const canvasStart = {
      x: lockingArea.start.x - firstPixelId.x * cellSize,
      y: lockingArea.start.y - firstPixelId.y * cellSize,
    }
    context.strokeRect(
      canvasStart.x,
      canvasStart.x,
      (lockingArea.end.x - lockingArea.start.x) * cellSize,
      (lockingArea.end.y - lockingArea.start.y) * cellSize
    )
  }
}

const renderCanvas = (
  cellSize: number,
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  chunkMap: ChunkMap,
  fetchChunk: (
    chunkId: string,
    dispatch: Dispatch<AnyAction>,
    chainId: number
  ) => Promise<void>,
  pixelChangesMap: PixelChangesMap,
  dispatch: Dispatch<AnyAction>,
  lockingArea: LockingArea
) => {
  const web3Context = useWeb3React()
  const chainId = web3Context.chainId ? web3Context.chainId : 1
  const chunkSize = cellSize * 8
  const chunksToQuery = boundChunks(width, height, chunkSize, offset)
  const chunkIds = chunksToQuery.chunkIds.map((chunkId) =>
    pointToString({ x: chunkId.x + 2 ** 12, y: chunkId.y + 2 ** 12 })
  )
  chunkIds.forEach((chunkId) => {
    const chunk = chunkMap[chunkId]
    if (chunk === undefined) {
      dispatch(loadAddChunk("loading", chunkId))
      fetchChunk(chunkId, dispatch, chainId)
    } else if (
      chunk !== "loading" &&
      chunk.fetchedIn + conf.EXPIRY_TIME < new Date().getTime()
    ) {
      fetchChunk(chunkId, dispatch, chainId)
    }
  })
  const hackfirst = {
    x: 0,
    y: 0,
  }
  const firstChunkId = chunksToQuery.chunkIds[0]

  const chunks = chunkIds.map((chunkId) => chunkMap[chunkId])
  for (let i = 0; i < chunks.length; i++) {
    const chunkId = chunksToQuery.chunkIds[i]
    const chunk = chunks[i]
    const chunkDiff = {
      x: chunkId.x - firstChunkId.x,
      y: chunkId.y - firstChunkId.y,
    }
    const chunkCorner = {
      x: hackfirst.x + chunkDiff.x * chunkSize,
      y: hackfirst.y + chunkDiff.y * chunkSize,
    }
    const changes = changesOverlay(chunkId, pixelChangesMap)
    renderChunk(context, chunkCorner, chunkSize, cellSize, chunk, changes)
  }
  renderLockingArea(context, lockingArea, firstChunkId, cellSize)
}

const relativeCellCoords = (mousePoint: Point, cellSize: number): Point => {
  return {
    x: Math.floor(mousePoint.x / cellSize),
    y: Math.floor(mousePoint.y / cellSize),
  }
}

const nullChunk: Chunk = {
  color: [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255,
  ],
  lock: [0, 0, 0, 0, 0, 0, 0, 0],
}

const fetchChunk = async (
  chunkId: string,
  dispatch: Dispatch<AnyAction>,
  chainId: number
): Promise<void> => {
  const subgraphQuery = {
    query: `
      {
        chunk(id: "${chunkId}") {
          color
          lock
        }
      }
    `,
  }
  const response = await fetch(conf.SUBGRAPH_URL_MAP[chainId], {
    method: "POST",
    body: JSON.stringify(subgraphQuery),
  })

  const { data } = await response.json()
  const timestamp = new Date().getTime()
  const chunk: LocalChunk = data.chunk
    ? {
        color: hexStringToBytes(data.chunk.color),
        lock: hexStringToBytes(data.chunk.lock),
        fetchedIn: timestamp,
        rendered: false
      }
    : { ...nullChunk, rendered: false, fetchedIn: timestamp }
  console.log(chunkId, chunk)
  dispatch(loadAddChunk(chunk, chunkId))
}

const Canvas: React.FC<{
  height: number
  width: number
}> = ({ height, width }) => {
  const {
    pixelChangesMap,
    colorId,
    cursorMode,
    chunkMap,
    lockingArea,
    cellSize,
  } = useSelector<State, State>((state) => state)
  const dispatch = useDispatch()

  const canvasRef = useRef(null)
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })
  const [anchorPoint, setAnchorPoint] = useState<Point>({ x: 0, y: 0 })
  const [mouseDown, setMouseDown] = useState<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (canvas) {
      const context = canvas.getContext("2d") as CanvasRenderingContext2D
      renderCanvas(
        cellSize,
        width,
        height,
        context,
        canvasOffset,
        chunkMap,
        fetchChunk,
        pixelChangesMap,
        dispatch,
        lockingArea
      )
    }
  }, [canvasOffset, pixelChangesMap])

  const dragModeAnchorMouse = (event: MouseEvent) => {
    setAnchorPoint({ x: event.clientX, y: event.clientY })
    setMouseDown(true)
  }

  const dragModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const anchorDistance = {
        x: event.clientX - anchorPoint.x,
        y: event.clientY - anchorPoint.y,
      }
      setAnchorPoint({ x: event.clientX, y: event.clientY })
      const newOffset = {
        x: canvasOffset.x - anchorDistance.x,
        y: canvasOffset.y - anchorDistance.y,
      }
      setCanvasOffset(newOffset)
    }
  }

  const getAbsoluteCellPos = (event: MouseEvent, cellSize: number): Point => {
    const chunkSize = cellSize * 8
    const chunksToQuery = boundChunks(width, height, chunkSize, canvasOffset)
    // get absolute pixel coordinates
    const firstChunk = chunksToQuery.chunkIds[0]
    const firstCellAbsoluteCoords = {
      x: firstChunk.x * 8 + 2 ** 15,
      y: firstChunk.y * 8 + 2 ** 15,
    }
    const rel = relativeCellCoords(
      { x: event.clientX, y: event.clientY },
      cellSize
    )
    const p: Point = {
      x: firstCellAbsoluteCoords.x + rel.x,
      y: firstCellAbsoluteCoords.y + rel.y,
    }
    return p
  }

  const paintModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, cellSize)
    dispatch(loadAddPixelChange(p, colorId))
    setMouseDown(true)
  }

  const paintModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const p = getAbsoluteCellPos(event, cellSize)
      dispatch(loadAddPixelChange(p, colorId))
    }
  }

  const eraseModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, cellSize)
    dispatch(loadAddPixelChange(p, undefined))
    setMouseDown(true)
  }

  const eraseModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const p = getAbsoluteCellPos(event, cellSize)
      dispatch(loadAddPixelChange(p, undefined))
    }
  }

  const lockModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, cellSize)
    console.log("hello, lock me", p)
    console.log("lok", lockingArea)
    dispatch(loadSetLockingArea(p))
  }

  const updateMousePointer = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event, cellSize)
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
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={anchorMouse as any}
      onMouseMove={(e) => {
        moveMouse(e)
        updateMousePointer(e as any)
      }}
      onMouseUp={() => setMouseDown(false)}
    />
  )
}

export default Canvas
