import { Bytes } from "ethers"
import { Chunk, Pixel, PixelChangesMap, Point } from "../types"
import { palette } from "./colors"
import { pointToString } from "./pixel-changes"

export const hexStringToBytes = (s: string): Bytes => {
  const hex = s.substring(2)
  const bytes = []
  for (let i = 0; i < hex.length; i+=2) {
    bytes.push(Number.parseInt(hex.substring(i, i+2), 16))
  }
  return bytes
}

const chunkToColors = (chunk: Chunk): Pixel[] => {
  const pixels: Pixel[] = []
  for (let i = 0; i < chunk.color.length; i++) {
    const color = palette[chunk.color[i]]
    const lByte = Math.floor(i / 8)
    const lOffset = i % 8
    const locked = (chunk.lock[lByte] & (1 << (7 - lOffset))) !== 0
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
