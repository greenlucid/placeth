import { useLazyQuery, useQuery,  } from "@apollo/client"
import { useEffect, useRef, useState } from "react"
import CHUNK from "../graphql/chunk"
import { Chunk, Point } from "../types"

const chessPattern = (context: CanvasRenderingContext2D, offset: Point) => {
  const side = 120
  const [width, height] = [context.canvas.width, context.canvas.height]
  const xCells = Math.floor(width / side) + 1
  const yCells = Math.floor(height / side) + 1
  for (let i = 0; i < xCells; i++) {
    for (let j = 0; j < yCells; j++) {
      const color = (i + j) % 2 === 0 ? "#00FF00" : "#FF00FF"
      context.fillStyle = color
      const posAttempt = {
        x: offset.x + i * side,
        y: offset.y + j * side
      }
      const posFlanned = {
        x: posAttempt.x < 0 ? 0 : posAttempt.x >= width ? width-1 : posAttempt.x,
        y: posAttempt.y < 0 ? 0 : posAttempt.y >= height ? height-1 : posAttempt.y,
      }
      
      context.fillRect(posFlanned.x, posFlanned.y, side, side)
    }
  }
}

const boundChunks =
    (width: number, height: number, chunkSize: number, offset: Point): Point[] => {
  const firstChunk = {
    x: Math.floor((offset.x - width/2) / chunkSize),
    y: Math.floor((offset.y - height/2) / chunkSize)
  }
  const lastChunk = {
    x: Math.ceil((offset.x + width/2) / chunkSize),
    y: Math.ceil((offset.y + height/2) / chunkSize)
  }
  const chunksToQuery = []
  for (let i = firstChunk.x; i <= lastChunk.x; i++) {
    for (let j = firstChunk.y; j<= lastChunk.y; j++) {
      chunksToQuery.push({x: i, y: j})
    }
  }
  return chunksToQuery
}

const useGetChunk = (x: number, y: number): Chunk | undefined | null => {
  // null is undefined
  // null will render white chunk
  const chunkId = `${x}${y}`
  const chunkQuery = useQuery(CHUNK, {variables: {chunkId}})
  if (chunkQuery.loading) return undefined
  if (chunkQuery.data) return chunkQuery.data.chunk
}

const useCanvas = (context: CanvasRenderingContext2D, offset: Point) => {
  const [width, height] = [context.canvas.width, context.canvas.height]
  const cellSize = 15
  const chunkSize = cellSize * 8
  const chunksToQuery = boundChunks(width, height, chunkSize, offset)
}

const Canvas: React.FC<{ height: number; width: number }> = (props) => {
  const canvasRef = useRef(null)
  const [canvasOffset, setCanvasOffset] = useState<Point>({x:0, y:0})
  const [anchorPoint, setAnchorPoint] = useState<Point>({x:0, y:0})
  const [mouseDown, setMouseDown] = useState<boolean>(false)

  const anchorMouse = (event: MouseEvent) => {
    console.log(event.clientX, event.clientY, mouseDown)
    setAnchorPoint({x: event.clientX, y: event.clientY})
    setMouseDown(true)
  }

  const moveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const anchorDistance = {
        x: event.clientX - anchorPoint.x,
        y: event.clientY - anchorPoint.y
      }
      setAnchorPoint({x: event.clientX, y: event.clientY})
      const newOffset = {
        x: canvasOffset.x + anchorDistance.x,
        y: canvasOffset.y + anchorDistance.y
      }
      setCanvasOffset(newOffset)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (!canvas) return
    const context = canvas.getContext("2d") as CanvasRenderingContext2D
    chessPattern(context, canvasOffset)
  }, [canvasOffset])

  return <canvas
    ref={canvasRef} {...props}
    onMouseDown={anchorMouse as any}
    onMouseMove={moveMouse as any}
    onMouseUp={() => setMouseDown(false)}
  />
}

export default Canvas
