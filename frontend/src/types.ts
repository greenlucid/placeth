import { Bytes } from "ethers"

export type Point = {
  x: number
  y: number
}

export type PixelChange = {
  p: Point
  c: number
}

export type PixelChangesMap = { [p: string]: number }

export type Chunk = {
  chunkdata: Bytes
  locks: Bytes
}

export type Pixel = {
  color: string
  locked?: boolean
}

export type LocalChunk = Pixel[]

export type Locking = {
  id: string
  x: number
  y: number
  xx: number
  yy: number
  requester: string
  timestamp: number
}
