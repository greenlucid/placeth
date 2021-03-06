import { PixelChange, PixelChangesMap, Point } from "../types"
import { Bytes } from "ethers"

export const pointToString = (p: Point): string => {
  return `${p.x},${p.y}`
}

export const stringToPoint = (s: string): Point => {
  const [x, y] = s.split(",").map((n) => Number(n))
  return { x, y }
}

export const pixelChangesMapToArr = (
  pixelChangesMap: PixelChangesMap
): PixelChange[] => {
  const keys = Object.keys(pixelChangesMap)
  const pixelChanges: PixelChange[] = []
  for (const key of keys) {
    const p = stringToPoint(key)
    const c = pixelChangesMap[key]
    const pixelChange = { p, c }
    if (pixelChange.c !== undefined)
      pixelChanges.push(pixelChange as PixelChange)
  }
  return pixelChanges
}

const encodePixelChanges = (pixelChanges: PixelChange[]): Bytes => {
  const bytes = []
  for (const pc of pixelChanges) {
    const b1 = pc.p.x >> 8
    const b2 = pc.p.x % 256
    const b3 = pc.p.y >> 8
    const b4 = pc.p.y % 256
    const b5 = pc.c
    bytes.push(b1, b2, b3, b4, b5)
  }
  return bytes
}

export default encodePixelChanges
