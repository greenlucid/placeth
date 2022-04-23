import { useEffect, useRef, useState } from "react"
import conf from "../config"
import useChunk from "../hooks/useChunk"
import { palette } from "../libs/colors"
import chunkToColors, { changesOverlay } from "../libs/decode-chunk"
import { pointToString } from "../libs/pixel-changes"
import { Chunk, PixelChange, PixelChangesMap, Point } from "../types"

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
  chunk: Chunk | undefined,
  changes: Array<number | undefined>
): void => {
  if (chunk === undefined) {
    // loading...
    const lightgray = "#999999"
    context.fillStyle = lightgray
    context.fillRect(corner.x, corner.y, chunkSize, chunkSize)
    context.fillStyle = lightgray
    context.strokeStyle = "#000000"
    context.beginPath()
    context.arc(
      corner.x + conf.CELL_SIZE * 4,
      corner.y + conf.CELL_SIZE * 4,
      30,
      0,
      10
    )
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

const renderCanvas = (
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  getChunk: (coords: Point) => Chunk | undefined,
  pixelChangesMap: PixelChangesMap
) => {
  const cellSize = conf.CELL_SIZE
  const chunkSize = cellSize * 8
  const chunksToQuery = boundChunks(width, height, chunkSize, offset)
  const chunks = chunksToQuery.chunkIds.map((c) => getChunk(c))
  const hackfirst = {
    x: 0,
    y: 0,
  }
  const firstChunkId = chunksToQuery.chunkIds[0]
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
}

const relativeCellCoords = (mousePoint: Point): Point => {
  return {
    x: Math.floor(mousePoint.x / conf.CELL_SIZE),
    y: Math.floor(mousePoint.y / conf.CELL_SIZE),
  }
}

const Canvas: React.FC<{
  height: number
  width: number
  colorId: number | undefined
  pixelChangesMap: PixelChangesMap
  setPixelChangesMap: React.Dispatch<React.SetStateAction<PixelChangesMap>>
}> = ({ height, width, ...props }) => {
  const canvasRef = useRef(null)
  const getChunk = useChunk()
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })
  const [anchorPoint, setAnchorPoint] = useState<Point>({ x: 0, y: 0 })
  const [mouseDown, setMouseDown] = useState<boolean>(false)
  const [context, setContext] = useState<CanvasRenderingContext2D>()

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (canvas) {
      const context = canvas.getContext("2d") as CanvasRenderingContext2D
      setContext(context)
    }
  }, [canvasRef])

  const handleUpdate = () => {
    if (context) {
      renderCanvas(
        width,
        height,
        context,
        canvasOffset,
        getChunk,
        props.pixelChangesMap
      )
    }
  }

  useEffect(() => {
    handleUpdate()
  }, [context, canvasOffset, props.pixelChangesMap])

  // https://stackoverflow.com/questions/65049812
  useEffect(() => {
    const interval = setInterval(() => {
      handleUpdate()
    }, 1_000)

    return () => clearInterval(interval)
  }, [])

  const dragModeAnchorMouse = (event: MouseEvent) => {
    console.log(event.clientX, event.clientY, mouseDown)
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

  const getAbsoluteCellPos = (event: MouseEvent): Point => {
    const cellSize = conf.CELL_SIZE
    const chunkSize = cellSize * 8
    const chunksToQuery = boundChunks(width, height, chunkSize, canvasOffset)
    // get absolute pixel coordinates
    const firstChunk = chunksToQuery.chunkIds[0]
    const firstCellAbsoluteCoords = {
      x: firstChunk.x * 8 + 2 ** 15,
      y: firstChunk.y * 8 + 2 ** 15,
    }
    const rel = relativeCellCoords({ x: event.clientX, y: event.clientY })
    const p: Point = {
      x: firstCellAbsoluteCoords.x + rel.x,
      y: firstCellAbsoluteCoords.y + rel.y,
    }
    return p
  }

  const paintModeAnchorMouse = (event: MouseEvent) => {
    const p = getAbsoluteCellPos(event)
    const pointKey = pointToString(p)
    const newPixelChangesMap = {
      ...props.pixelChangesMap,
      [pointKey]: props.colorId as number,
    }
    props.setPixelChangesMap(newPixelChangesMap)
    setMouseDown(true)
  }

  const paintModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const p = getAbsoluteCellPos(event)
      const pointKey = pointToString(p)
      const newPixelChangesMap = {
        ...props.pixelChangesMap,
        [pointKey]: props.colorId as number,
      }
      props.setPixelChangesMap(newPixelChangesMap)
    }
  }

  const [anchorMouse, moveMouse] =
    props.colorId === undefined
      ? [dragModeAnchorMouse, dragModeMoveMouse]
      : [paintModeAnchorMouse, paintModeMoveMouse]

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={anchorMouse as any}
      onMouseMove={moveMouse as any}
      onMouseUp={() => setMouseDown(false)}
    />
  )
}

export default Canvas
