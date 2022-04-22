import { Bytes } from "ethers"
import { RGBColor } from "react-color"

export type Point = {
  x: number,
  y: number
}

export type PixelChange = {
  p: Point,
  c: number
}

export type Chunk = {
  chunkdata: Bytes,
  locks: Bytes
}

export type Pixel = {
  color: string,
  locked?: boolean
}