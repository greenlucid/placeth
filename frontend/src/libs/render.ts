import { ChunkData, LocalChunk, LockingArea, Point } from "../types"
import { palette } from "./colors"
import { mockLocalChunk } from "./decode-chunk"

const colorStringToUint8s = (color: string): number[] => {
  const r = Number.parseInt(color.substring(1, 3), 16)
  const g = Number.parseInt(color.substring(3, 5), 16)
  const b = Number.parseInt(color.substring(5, 7), 16)
  return [r, g, b, 255]
}

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

const colorIdToUint8s = (colorId: number): number[] => {
  return colorStringToUint8s(palette[colorId])
}

const chunkToClampedArray = (chunk: LocalChunk): Uint8ClampedArray => {
  const clampedArray: number[] = []
  const chunkData = chunk.data ? chunk.data : nullChunk
  for (const color of chunkData.color as number[]) {
    const uint8s = colorIdToUint8s(color)
    uint8s.forEach((uint) => clampedArray.push(uint))
  }
  return Uint8ClampedArray.from(clampedArray)
}

export const chunkToImage = (chunk: LocalChunk): ImageData => {
  const imageData = new ImageData(8, 8)
  const clampedArray = chunkToClampedArray(chunk)
  clampedArray.forEach((b, i) => {
    imageData.data[i] = b
  })
  return imageData
}

const defaultifyChunks = (
  chunks: Array<LocalChunk | undefined>
): LocalChunk[] => {
  const newChunks: LocalChunk[] = []
  for (const chunk of chunks) {
    if (chunk === undefined || chunk.data === undefined) {
      // loading chunk
      newChunks.push({ ...mockLocalChunk("loading"), data: loadingChunk })
    } else {
      newChunks.push(chunk)
    }
  }

  return newChunks
}

// rather not justify myself
const chunksToClampedArray = (
  chunks: Array<LocalChunk | undefined>,
  rowLength: number,
  columnLength: number
): Uint8ClampedArray => {
  const clampedArray: number[] = []
  const reChunks = defaultifyChunks(chunks)
  for (let chunkRow = 0; chunkRow < columnLength; chunkRow++) {
    for (let row = 0; row < 8; row++) {
      for (let iChunk = 0; iChunk < rowLength; iChunk++) {
        const chunk = reChunks[iChunk]
        for (let c = 0; c < 8; c++) {
          const i = row * 8 + c
          const arr = colorIdToUint8s((chunk.data as ChunkData).color[i])
          arr.forEach(e => clampedArray.push(e))
        }
      }
    }
  }

  return Uint8ClampedArray.from(clampedArray)
}

export const chunksToImage = (
  chunks: Array<LocalChunk | undefined>,
  rowLength: number,
  columnLength: number
): ImageData => {
  const imageData = new ImageData(8, 8)
  const clampedArray = chunksToClampedArray(chunks, rowLength, columnLength)
  clampedArray.forEach((b, i) => {
    imageData.data[i] = b
  })
  return imageData
}

/**
 *
 * @param zoom size of a cell
 * @param offset absolute cell in the top left corner
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
  console.log("AAAAAAAAAAAAAAA")
  const rowLength = Math.ceil(width / zoom)
  const columnLength = Math.ceil(height / zoom)
  const firstChunkVector = {
    x: Math.floor(offset.x / (zoom * 8)),
    y: Math.floor(offset.y / (zoom * 8)),
  }
  const lastChunkVector = {
    x: Math.ceil((offset.x + rowLength) / (zoom * 8)),
    y: Math.ceil((offset.y + columnLength) / (zoom * 8)),
  }
  const chunkVectors = []

  for (let i = firstChunkVector.x; i <= lastChunkVector.x; i++) {
    for (let j = firstChunkVector.y; j <= lastChunkVector.y; j++) {
      chunkVectors.push({ x: i, y: j })
    }
  }
  console.log(chunkVectors)
  return { chunkVectors, rowLength, columnLength }
}

const renderLockingArea = (
  width: number,
  height: number,
  context: CanvasRenderingContext2D,
  lockingArea: LockingArea,
  cellSize: number
): void => {
  if (lockingArea.start === undefined) return

  const lockingAreaStart = {
    x: lockingArea.start.x * cellSize + width / 2,
    y: lockingArea.start.y * cellSize + height / 2,
  }

  if (lockingArea.end === undefined) {
    context.fillStyle = "#dddd00"
    context.rect(
      lockingAreaStart.x + cellSize * 0.25,
      lockingAreaStart.y + cellSize * 0.25,
      cellSize * 0.25,
      cellSize * 0.25
    )
  } else {
    context.strokeStyle = "#dddd00"
    context.strokeRect(
      lockingAreaStart.x,
      lockingAreaStart.y,
      (lockingArea.end.x - lockingArea.start.x) * cellSize,
      (lockingArea.end.y - lockingArea.start.y) * cellSize
    )
  }
}
