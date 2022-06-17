import { AnyAction, Dispatch } from "@reduxjs/toolkit"
import { Web3ReactContextInterface } from "@web3-react/core/dist/types"
import conf from "../config"
import {
  ChunkData,
  ChunkMap,
  LocalChunk,
  LockingArea,
  PixelChange,
  Point,
} from "../types"
import { colors } from "./colors"
import chunkToColors from "./decode-chunk"
import { FetchChunksParams } from "./fetcher"
import { pointToString } from "./pixel-changes"

export const nullChunk: ChunkData = {
  color: [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255,
  ],
  lock: [0, 0, 0, 0, 0, 0, 0, 0],
}

export const loadingChunk: ChunkData = {
  color: [
    255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 255, 255,
    255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255,
    255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 0, 0, 0, 0, 255, 255, 255, 255, 0,
    0, 0, 0, 255, 255, 255, 255,
  ],
  lock: [0, 0, 0, 0, 0, 0, 0, 0],
}

/**
 *
 * @param zoom size of a cell
 * @param offset relative chunk in the top left corner
 * @returns chunkVectors gives an array with all point identifiers of vectors
 * bounded by the screen
 *
 * rowLength is how many cells fit in a row
 *
 * columnLength is how many cells fit in a column
 */
export const boundChunks = (
  width: number,
  height: number,
  zoom: number,
  offset: Point
): { chunkVectors: Point[]; rowLength: number; columnLength: number } => {
  const chunkSize = zoom * conf.CHUNK_SIDE
  const firstChunkVector = offset
  const lastChunkVector = {
    x: Math.ceil(offset.x + width / chunkSize),
    y: Math.ceil(offset.y + height / chunkSize),
  }
  const chunkVectors = []

  for (let j = firstChunkVector.y; j <= lastChunkVector.y; j++) {
    for (let i = firstChunkVector.x; i <= lastChunkVector.x; i++) {
      chunkVectors.push({ x: i, y: j })
    }
  }
  const rowLength = lastChunkVector.x + 1 - firstChunkVector.x
  const columnLength = lastChunkVector.y + 1 - firstChunkVector.y

  return { chunkVectors, rowLength, columnLength }
}

const renderLockingArea = (
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  lockingArea: LockingArea,
  zoom: number,
  offset: Point
): void => {
  if (lockingArea.start === undefined) return

  const relLockingAreaStart = {
    x: lockingArea.start.x - (offset.x * 8 + 2 ** 15),
    y: lockingArea.start.y - (offset.y * 8 + 2 ** 15),
  }
  const screenStart = {
    x: relLockingAreaStart.x * zoom,
    y: relLockingAreaStart.y * zoom,
  }

  if (lockingArea.end === undefined) {
    if (
      screenStart.x >= 0 &&
      screenStart.x < width &&
      screenStart.y >= 0 &&
      screenStart.y < height
    ) {
      context.fillStyle = "#ff0000"
      context.lineWidth = 5
      context.beginPath()
      context.moveTo(screenStart.x - zoom * 5, screenStart.y)
      context.lineTo(screenStart.x + zoom * 5, screenStart.y)
      context.moveTo(screenStart.x, screenStart.y - zoom * 5)
      context.lineTo(screenStart.x, screenStart.y + zoom * 5)
      context.stroke()
    } else return
  } else {
    const relLockingAreaEnd = {
      x: lockingArea.end.x - (offset.x * 8 + 2 ** 15),
      y: lockingArea.end.y - (offset.y * 8 + 2 ** 15),
    }
    const screenEnd = {
      x: relLockingAreaEnd.x * zoom,
      y: relLockingAreaEnd.y * zoom,
    }
    context.strokeStyle = "#ff0000"
    context.lineWidth = 5
    context.strokeRect(
      screenStart.x,
      screenStart.y,
      screenEnd.x - screenStart.x,
      screenEnd.y - screenStart.y
    )
  }
}

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

const renderPixelChanges = (
  zoom: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  pixelChanges: PixelChange[],
  width: number,
  height: number
) => {
  for (const pixel of pixelChanges) {
    const relPos = {
      x: pixel.p.x - offset.x * conf.CHUNK_SIDE - 2 ** 15,
      y: pixel.p.y - offset.y * conf.CHUNK_SIDE - 2 ** 15,
    }
    const screenPos = {
      x: relPos.x * zoom,
      y: relPos.y * zoom,
    }
    if (
      screenPos.x >= 0 &&
      screenPos.x < width &&
      screenPos.y >= 0 &&
      screenPos.y < height
    ) {
      context.fillStyle = colors[pixel.c]
      context.fillRect(screenPos.x, screenPos.y, zoom, zoom)
    }
  }
}

export const renderCanvas = (
  cellSize: number,
  context: CanvasRenderingContext2D,
  offset: Point,
  chunkMap: ChunkMap,
  gatherChunks: (params: FetchChunksParams) => Promise<void>,
  dispatch: Dispatch<AnyAction>,
  web3Context: Web3ReactContextInterface<any>,
  pixelChanges: PixelChange[],
  lockingArea: LockingArea
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
  renderPixelChanges(cellSize, context, offset, pixelChanges, width, height)
  renderLockingArea(width, height, context, lockingArea, cellSize, offset)
}
