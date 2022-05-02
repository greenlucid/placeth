import { useWeb3React } from "@web3-react/core"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import conf from "../config"
import { gatherChunks } from "../libs/fetcher"
import { renderCanvas } from "../libs/render"
import slice from "../redux/placeth"
import { Point, State } from "../types"

const relativeCellCoords = (mousePoint: Point, zoom: number): Point => {
  return {
    x: Math.floor(mousePoint.x / zoom),
    y: Math.floor(mousePoint.y / zoom),
  }
}

const Canvas: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const { colorId, cursorMode, chunkMap, zoom } = useSelector<State, State>(
    (state) => state
  )
  const dispatch = useDispatch()
  const web3Context = useWeb3React()

  const canvasRef = useRef(null)
  const [cellCorner, setCellCorner] = useState<Point>({ x: 0, y: 0 })
  const [chunkCorner, setChunkCorner] = useState<Point>({ x: 0, y: 0 })
  const [cellChunkOffset, setCellChunkOffset] = useState<Point>({ x: 0, y: 0 })
  const [anchorPoint, setAnchorPoint] = useState<Point>({ x: 0, y: 0 })
  const [mouseDown, setMouseDown] = useState<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current as any
    if (canvas) {
      const context = canvas.getContext("2d") as CanvasRenderingContext2D
      renderCanvas(
        zoom,
        context,
        chunkCorner,
        chunkMap,
        gatherChunks,
        dispatch,
        web3Context
      )
    }
  }, [chunkCorner, canvasRef.current, zoom])

  const dragModeAnchorMouse = (event: MouseEvent) => {
    const absoluteCell = getWrongAbsoluteCellPos(event, zoom)
    setAnchorPoint(absoluteCell)
    setMouseDown(true)
  }

  const dragModeMoveMouse = (event: MouseEvent) => {
    if (mouseDown) {
      const currentCell = getWrongAbsoluteCellPos(event, zoom)
      // minus, to get the dragging effect
      const anchorDistance = {
        x: -(currentCell.x - anchorPoint.x),
        y: -(currentCell.y - anchorPoint.y),
      }
      if (anchorDistance.x === 0 && anchorDistance.y === 0) return

      setAnchorPoint(currentCell)
      const newOffset = {
        x: cellCorner.x + anchorDistance.x,
        y: cellCorner.y + anchorDistance.y,
      }
      const newCellChunkOffset = {
        x: cellChunkOffset.x + anchorDistance.x,
        y: cellChunkOffset.y + anchorDistance.y,
      }

      const chunkOffset = {
        x: Math.floor(newCellChunkOffset.x / conf.CHUNK_SIDE),
        y: Math.floor(newCellChunkOffset.y / conf.CHUNK_SIDE),
      }
  
      if (chunkOffset.x !== 0 || chunkOffset.y !== 0) {
        const nextCellChunkOffset = {
          x: (newCellChunkOffset.x + 800) % conf.CHUNK_SIDE,
          y: (newCellChunkOffset.y + 800) % conf.CHUNK_SIDE,
        }
        setChunkCorner({
          x: chunkCorner.x + chunkOffset.x,
          y: chunkCorner.y + chunkOffset.y,
        })
        setCellChunkOffset(nextCellChunkOffset)
      } else {
        setCellChunkOffset(newCellChunkOffset)
      }
      setCellCorner(newOffset)
    }
  }

  // this exists to avoid a shaking screen bug
  // you just use the "wrong one" that works for dragging functionality
  // and use the proper one for everything else.
  const getWrongAbsoluteCellPos = (event: MouseEvent, zoom: number): Point => {
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

  const getAbsoluteCellPos = (event: MouseEvent, zoom: number): Point => {
    // get absolute pixel coordinates
    const firstCellAbsoluteCoords = {
      x: chunkCorner.x * 8 + 2 ** 15,
      y: chunkCorner.y * 8 + 2 ** 15,
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
    dispatch(slice.actions.changePointedPixel(p))
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
    <div className="canvasContainer">
      <canvas
        id="canvas"
        style={{ border: "2px", borderStyle: "double", borderColor: "blue" }}
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
    </div>
  )
}

export default Canvas
