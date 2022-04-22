import { PixelChange } from "../types";
import { Bytes } from "ethers"

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