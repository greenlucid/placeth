import { useEffect, useRef, useState } from "react"
import { Chunk, Point } from "../types"

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
  }, [canvasOffset])

  return <canvas
    ref={canvasRef} {...props}
    onMouseDown={anchorMouse as any}
    onMouseMove={moveMouse as any}
    onMouseUp={() => setMouseDown(false)}
  />
}

export default Canvas
