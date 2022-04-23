import { LocalChunk, Point } from "../types"

export const loadChangeCursorMode = (cursorMode: string) => ({
  type: "placeth/changeCursorMode",
  payload: cursorMode,
})

export const loadChangeColorId = (colorId: number | undefined) => ({
  type: "placeth/changeColorId",
  payload: colorId,
})

export const loadAddChunk = (
  chunk: LocalChunk | "loading" | undefined,
  chunkId: string
) => ({
  type: "placeth/addChunk",
  payload: { chunk, chunkId },
})

export const loadSetLockingArea = (start: Point, end: Point) => ({
  type: "placeth/setLockingArea",
  payload: { start, end },
})

export const loadAddPixelChange = (p: Point, c: number | undefined) => ({
  type: "placeth/addPixelChange",
  payload: { p, c },
})

export const loadDeletePixelChanges = () => ({
  type: "placeth/deletePixelChanges",
})
