import { AnyAction, Dispatch } from "@reduxjs/toolkit"
import conf from "../config"
import slice from "../redux/placeth"
import { ChunkMap, FetchedChunk, LocalChunk } from "../types"
import { loadingChunk, nullChunk } from "./render"
import { hexStringToBytes, mockLocalChunk } from "./decode-chunk"

export interface FetchChunksParams {
  chunkIds: string[]
  dispatch: Dispatch<AnyAction>
  chainId: number
  chunkMap: ChunkMap
}

const setChunksAsFetching = (
  chunkIds: string[],
  dispatch: Dispatch<AnyAction>,
  chunkMap: ChunkMap
): void => {
  for (const id of chunkIds) {
    const chunk = chunkMap[id]
    if (chunk !== undefined) {
      const fetchingChunk: LocalChunk = {
        ...chunk,
        fetching: true,
        rendered: false,
      }
      dispatch(slice.actions.addChunk(fetchingChunk))
    } else {
      const mockedChunk: LocalChunk = mockLocalChunk(id)
      mockedChunk.fetching = true
      mockedChunk.data = loadingChunk
      dispatch(slice.actions.addChunk(mockedChunk))
    }
  }
}

const fetchChunks = async ({
  chunkIds,
  dispatch,
  chainId,
  chunkMap,
}: FetchChunksParams): Promise<void> => {
  setChunksAsFetching(chunkIds, dispatch, chunkMap)

  const idInString = `[${chunkIds.map((s) => `"${s}"`).join(",")}]`
  const subgraphQuery = {
    query: `
      {
        chunks(where: {id_in: ${idInString}}) {
          id
          color
          lock
        }
      }
    `,
  }
  const response = await fetch(conf.SUBGRAPH_URL_MAP[chainId], {
    method: "POST",
    body: JSON.stringify(subgraphQuery),
  })

  const { data } = await response.json()
  const tempMap: { [chunkId: string]: FetchedChunk | undefined } = {}
  const returnedChunks = data.chunks as FetchedChunk[]
  for (const chunk of returnedChunks) {
    tempMap[chunk.id] = chunk
  }
  for (const chunkId of chunkIds) {
    const fetchedChunk = tempMap[chunkId]
    if (fetchedChunk === undefined) {
      const chunk: LocalChunk = {
        ...mockLocalChunk(chunkId),
        data: nullChunk,
      }
      dispatch(slice.actions.addChunk(chunk))
    } else {
      const chunk: LocalChunk = {
        ...mockLocalChunk(chunkId),
        data: {
          color: hexStringToBytes(fetchedChunk.color),
          lock: hexStringToBytes(fetchedChunk.lock),
        },
        id: fetchedChunk.id,
      }
      dispatch(slice.actions.addChunk(chunk))
    }
  }
}

// removes chunkIds that shouldn't be fetched
export const gatherChunks = async ({
  chunkIds,
  dispatch,
  chainId,
  chunkMap,
}: FetchChunksParams): Promise<void> => {
  const now = new Date().getTime()
  const shouldBeFetched = (chunk: LocalChunk | undefined): boolean => {
    if (chunk === undefined) return true
    if (chunk.fetching) return false
    if (chunk.fetchedIn + conf.EXPIRY_TIME < now) return true
    return false
  }
  const fetchableIds = chunkIds.filter((id) => shouldBeFetched(chunkMap[id]))
  // only bother the graph if query is big enough. hardcoded as 1 for now.
  if (fetchableIds.length > 5)
    fetchChunks({ chunkIds: fetchableIds, dispatch, chainId, chunkMap })
}
