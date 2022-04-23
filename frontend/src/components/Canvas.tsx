import { useEffect, useRef, useState } from "react"
import useChunk from "../hooks/useChunk"
import chunkToColors from "../libs/decode-chunk"
import { Chunk, Point } from "../types"

const boundChunks = (
  width: number,
  height: number,
  chunkSize: number,
  offset: Point
): Point[] => {
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
  return chunksToQuery
}

const renderChunk = (
  context: CanvasRenderingContext2D,
  corner: Point,
  chunkSize: number,
  pixelSize: number,
  chunk: Chunk | undefined
): void => {
  if (chunk === undefined) {
    // loading...
    const lightgray = "#999999"
    context.fillStyle = lightgray
    context.fillRect(corner.x, corner.y, chunkSize, chunkSize)
  } else {
    // render loaded chunk
    const pixels = chunkToColors(chunk)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const pixel = pixels[i * 8 + j]
        context.fillStyle = pixel.color
        const pixelCorner = {
          x: corner.x + i * pixelSize,
          y: corner.y + j * pixelSize,
        }
        context.fillRect(pixelCorner.x, pixelCorner.y, pixelSize, pixelSize)
      }
    }
  }
}

const renderCanvas = (
  context: CanvasRenderingContext2D,
  offset: Point,
  getChunk: (coords: Point) => Chunk | undefined
) => {
  const [width, height] = [context.canvas.width, context.canvas.height]
  const cellSize = 15
  const chunkSize = cellSize * 8
  const chunksToQuery = boundChunks(width, height, chunkSize, offset)
  const chunks = chunksToQuery.map((c) => getChunk(c))

}

const Canvas: React.FC<{ height: number; width: number, colorId: number | undefined }> = (props) => {
  const canvasRef = useRef(null)
  const getChunk = useChunk()
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })
  const [anchorPoint, setAnchorPoint] = useState<Point>({ x: 0, y: 0 })
  const [mouseDown, setMouseDown] = useState<boolean>(false)

  const anchorMouse = (event: MouseEvent) => {
    console.log(event.clientX, event.clientY, mouseDown)
    setAnchorPoint({ x: event.clientX, y: event.clientY })
    setMouseDown(true)
  }

  const moveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const anchorDistance = {
        x: event.clientX - anchorPoint.x,
        y: event.clientY - anchorPoint.y,
      }
      setAnchorPoint({ x: event.clientX, y: event.clientY })
      const newOffset = {
        x: canvasOffset.x + anchorDistance.x,
        y: canvasOffset.y + anchorDistance.y,
      }
      setCanvasOffset(newOffset)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (!canvas) return
    const context = canvas.getContext("2d") as CanvasRenderingContext2D
    renderCanvas(context, canvasOffset, getChunk)
  }, [canvasOffset])

  return (
    <canvas
      ref={canvasRef}
      {...props}
      onMouseDown={anchorMouse as any}
      onMouseMove={moveMouse as any}
      onMouseUp={() => setMouseDown(false)}
    />
  )
}

export default Canvas
