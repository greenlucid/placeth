import { Action, ActionCreatorWithPayload, createSlice } from "@reduxjs/toolkit"
import conf from "../config"
import { pointToString } from "../libs/pixel-changes"
import { LocalChunk, State } from "../types"

const initialState: State = {
  chunkMap: {},
  colorId: 0,
  cursorMode: "drag",
  lockingArea: { start: undefined, end: undefined },
  pixelChangesMap: {},
  cellSize: conf.CELL_SIZE,
  pointedPixel: { x: 32768, y: 32768 },
}

const slice = createSlice({
  initialState,
  name: "placeth",
  reducers: {
    changeCursorMode(state, action) {
      state.cursorMode = action.payload
    },
    changeColorId(state, action) {
      state.colorId = action.payload
    },
    addChunk(state, action) {
      state.chunkMap[action.payload.chunkId] = action.payload.chunk
    },
    setLockingArea(state, action) {
      const lockingArea = state.lockingArea
      if (lockingArea.start === undefined) {
        state.lockingArea.start = action.payload
      } else if (
        lockingArea.start.x <= action.payload.x &&
        lockingArea.start.y <= action.payload.y
      ) {
        state.lockingArea.end = action.payload
      } else {
        state.lockingArea.start = action.payload
        state.lockingArea.end = undefined
      }
    },
    addPixelChange(state, action) {
      const key = pointToString(action.payload.p)
      state.pixelChangesMap[key] = action.payload.c
    },
    deletePixelChanges(state) {
      state.pixelChangesMap = {}
    },
    changeCellSize(state, action) {
      state.cellSize = action.payload
    },
    changePointedPixel(state, action) {
      state.pointedPixel = action.payload
    },
  },
})

export default slice
