import { LocalChunk, Point } from "../types"

export const loadChangeCursorMode = (cursorMode: string) => ({
  type: "placeth/changeCursorMode",
  payload: cursorMode,
})

export const loadChangeColorId = (colorId: number | undefined) => ({
  type: "placeth/changeColorId",
  payload: colorId,
})

export const loadSetLockingArea = (p: Point) => ({
  type: "placeth/setLockingArea",
  payload: p
})

export const loadAddPixelChange = (p: Point, c: number | undefined) => ({
  type: "placeth/addPixelChange",
  payload: { p, c },
})

export const loadDeletePixelChanges = () => ({
  type: "placeth/deletePixelChanges",
})
