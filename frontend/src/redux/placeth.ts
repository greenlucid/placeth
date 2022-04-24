import { Action, ActionCreatorWithPayload, createSlice } from "@reduxjs/toolkit"
import { pointToString } from "../libs/pixel-changes"
import { LocalChunk, State } from "../types"

const initialState: State = {
  chunkMap: {},
  colorId: 0,
  cursorMode: "drag",
  lockingArea: undefined,
  pixelChangesMap: {},
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
      state.lockingArea = action.payload
    },
    addPixelChange(state, action) {
      const key = pointToString(action.payload.p)
      state.pixelChangesMap[key] = action.payload.c
    },
    deletePixelChanges(state) {
      state.pixelChangesMap = {}
    },
  },
})

export default slice
