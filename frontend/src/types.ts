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
  color: Bytes
  lock: Bytes
}

export type Pixel = {
  color: string
  locked?: boolean
}

export interface LocalChunk {
  data: Chunk | undefined
  fetchedIn: number
  rendered: boolean
  fetching: boolean
  chunkId: string
  relativeVector: Point
  absoluteVector: Point
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

export type ChunkMap = { [chunkId: string]: LocalChunk | undefined }

export type LockingArea = { start: Point | undefined; end: Point | undefined }
export interface State {
  cursorMode: string
  colorId: number
  pixelChangesMap: PixelChangesMap
  chunkMap: ChunkMap
  lockingArea: LockingArea
  cellSize: number
  pointedPixel: Point
}
