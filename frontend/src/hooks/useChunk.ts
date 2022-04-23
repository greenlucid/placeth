import { useState } from "react"
import { Chunk, Point } from "../types"
import conf from "../config"

type ChunkMap = {[chunkId: string]: Chunk | undefined | null}

const coordsToChunkId = (coords: Point): string => {
  const chunkId = `${coords.x}${coords.y}`
  return chunkId
}

const fetchChunk = async (
  chunkId: string
): Promise<Chunk | null> => {
  const subgraphQuery = {
    query: `
      {
        chunk(chunkId: "${chunkId}") {
          chunkdata
          locks
        }
      }
    `,
  }
  const response = await fetch(conf.SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify(subgraphQuery),
  })

  const { data } = await response.json()
  const chunk: Chunk | null = data.chunk

  return chunk
}

const useChunk = () => {
  const [chunkMap, setChunkMap] = useState<ChunkMap>({})

  const updateChunks = async (chunkId: string) => {
    const fetchedChunk = await fetchChunk(chunkId)
    const updatedChunks = {...chunkMap, chunkId: fetchedChunk}
    setChunkMap(updatedChunks)
  }

  const getChunk = (coords: Point): Chunk | undefined | null => {
    const chunkId = coordsToChunkId(coords)
    const foundChunk = chunkMap[chunkId]
    if (foundChunk === undefined) {
      updateChunks(chunkId)
      return undefined
    }

    return foundChunk
  }

  return getChunk
}

export default useChunk