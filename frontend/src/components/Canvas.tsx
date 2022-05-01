import { AnyAction, Dispatch } from "@reduxjs/toolkit"
import { useWeb3React } from "@web3-react/core"
import { Web3ReactContextInterface } from "@web3-react/core/dist/types"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import conf from "../config"
import chunkToColors from "../libs/decode-chunk"
import { gatherChunks, FetchChunksParams } from "../libs/fetcher"
import { pointToString } from "../libs/pixel-changes"
import { boundChunks } from "../libs/render"
import slice from "../redux/placeth"
import { ChunkMap, LocalChunk, Point, State } from "../types"

const renderLoadingChunk = (
  context: CanvasRenderingContext2D,
  corner: Point,
  zoom: number
): void => {
  context.fillStyle = "#aaaaaa"
  context.fillRect(
    corner.x,
    corner.y,
    zoom * conf.CHUNK_SIDE,
    zoom * conf.CHUNK_SIDE
  )
}

const renderChunk = (
  context: CanvasRenderingContext2D,
  corner: Point,
  chunk: LocalChunk | undefined,
  zoom: number
): void => {
  if (chunk === undefined || chunk.data === undefined) {
    renderLoadingChunk(context, corner, zoom)
  } else {
    const pixels = chunkToColors(chunk.data)
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const pixel = pixels[j * 8 + i] // XD
        context.fillStyle = pixel.color
        const pixelCorner = {
          x: corner.x + i * zoom,
          y: corner.y + j * zoom,
        }
        context.fillRect(pixelCorner.x, pixelCorner.y, zoom, zoom)
      }
    }
  }
}

const renderCanvas = (
  cellSize: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  chunkMap: ChunkMap,
  gatherChunks: (params: FetchChunksParams) => Promise<void>,
  dispatch: Dispatch<AnyAction>,
  web3Context: Web3ReactContextInterface<any>
) => {
  const canvas = document.getElementById("canvas") as any
  const chunkSize = cellSize * 8
  const width = canvas.width
  const height = canvas.height
  context.clearRect(0, 0, width, height)
  const chainId = web3Context.chainId ? web3Context.chainId : 1
  const chunksToQuery = boundChunks(width, height, cellSize, offset)
  const chunkIds = chunksToQuery.chunkVectors.map((vector) =>
    pointToString({ x: vector.x + 2 ** 12, y: vector.y + 2 ** 12 })
  )
  gatherChunks({ chunkIds, chainId, dispatch, chunkMap })
  const firstChunkVector = chunksToQuery.chunkVectors[0]
  for (let i = 0; i < chunkIds.length; i++) {
    const chunkId = chunkIds[i]
    const chunk = chunkMap[chunkId]
    const chunkVector = chunksToQuery.chunkVectors[i]
    const chunkDiff = {
      x: chunkVector.x - firstChunkVector.x,
      y: chunkVector.y - firstChunkVector.y,
    }
    const chunkCorner = {
      x: chunkDiff.x * chunkSize,
      y: chunkDiff.y * chunkSize,
    }
    renderChunk(context, chunkCorner, chunk, cellSize)
  }
}

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
    const chunkOffset = {
      x: Math.floor(cellChunkOffset.x / conf.CHUNK_SIDE),
      y: Math.floor(cellChunkOffset.y / conf.CHUNK_SIDE),
    }

    if (chunkOffset.x !== 0 || chunkOffset.y !== 0) {
      const nextCellChunkOffset = {
        x: (cellChunkOffset.x + 800) % conf.CHUNK_SIDE,
        y: (cellChunkOffset.y + 800) % conf.CHUNK_SIDE,
      }
      setChunkCorner({
        x: chunkCorner.x + chunkOffset.x,
        y: chunkCorner.y + chunkOffset.y,
      })
      setCellChunkOffset(nextCellChunkOffset)
    }
  }, [chunkCorner, cellChunkOffset])

  useEffect(() => {
    console.log(" chunk corner", chunkCorner)
    const canvas = canvasRef.current as any
    if (canvas) {
      const context = canvas.getContext("2d") as CanvasRenderingContext2D
      // this move isnt well adjusted, disregard
      // context.moveTo(chunkOffset.x * chunkSize, chunkOffset.y * chunkSize)
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
  }, [chunkCorner, canvasRef.current])

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
      setCellChunkOffset(newCellChunkOffset)

      setCellCorner(newOffset)
    }
  }

  const getAbsoluteCellPos = (event: MouseEvent, zoom: number): Point => {
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
