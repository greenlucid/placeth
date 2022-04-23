import { Chunk, Pixel, PixelChangesMap, Point } from "../types"
import { palette } from "./colors"
import { pointToString } from "./pixel-changes"

const chunkToColors = (chunk: Chunk): Pixel[] => {
  const pixels: Pixel[] = []
  for (let i = 0; i < chunk.chunkdata.length; i++) {
    const color = palette[chunk.chunkdata[i]]
    const lByte = Math.floor(i / 8)
    const lOffset = i % 8
    const locked = (chunk.locks[lByte] & (1 << (7 - lOffset))) !== 0
    pixels.push({ color, locked })
  }
  return pixels
}

export const changesOverlay = (
  chunkId: Point,
  pixelChangesMap: PixelChangesMap
): Array<number | undefined> => {
  const changes = []
  const absoluteChunkId: Point = {
    x: chunkId.x + 2 ** 12,
    y: chunkId.y + 2 ** 12,
  }
  const firstPixel: Point = {
    x: absoluteChunkId.x * 8,
    y: absoluteChunkId.y * 8,
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cellPoint = { x: firstPixel.x + i, y: firstPixel.y + j }
      const pointKey = pointToString(cellPoint)
      const color = pixelChangesMap[pointKey]
      changes.push(color)
    }
  }
  return changes
}

export default chunkToColors
