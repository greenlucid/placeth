import { Bytes } from "ethers"

export type Point = {
  x: number
  y: number
}

export type PixelChange = {
  p: Point
  c: number
}

export type PixelChangesMap = { [p: string]: number | undefined }

export interface Chunk {
  chunkdata: Bytes
  locks: Bytes
}

export type Pixel = {
  color: string
  locked?: boolean
}

export interface LocalChunk extends Chunk {
  fetchedIn: number
}

export type Locking = {
  id: string
  x: number
  y: number
  xx: number
  yy: number
  requester: string
  timestamp: number
}

type ChunkMap = { [chunkId: string]: LocalChunk | undefined }

export interface State {
  cursorMode: string
  colorId: number
  pixelChangesMap: PixelChangesMap
  chunkMap: ChunkMap
  lockingArea: { start: Point; end: Point } | undefined
}
