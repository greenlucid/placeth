import { useEffect, useRef, useState } from "react"
import { Point } from "../types"

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
