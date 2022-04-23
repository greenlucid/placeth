import { useState } from "react"
import { Chunk, Point } from "../types"
import conf from "../config"

type ChunkMap = { [chunkId: string]: Chunk | undefined }

const nullChunk: Chunk = {
  chunkdata: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  locks: [0, 0, 0, 0, 0, 0, 0, 0],
}

const coordsToChunkId = (coords: Point): string => {
  const chunkId = `${coords.x}${coords.y}`
  return chunkId
}

const fetchChunk = async (chunkId: string): Promise<Chunk | null> => {
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

const temphack = (): Chunk => {
  // gens a random chunk for testing before subgraph
  const chunkdata = []
  for (let i = 0; i < 64; i++) {
    chunkdata.push(Math.floor(Math.random() * 256))
  }
  const locks = [0,0,0,0,0,0,0,0]
  return {chunkdata, locks}
}

const useChunk = () => {
  const [chunkMap, setChunkMap] = useState<ChunkMap>({})

  const updateChunks = async (chunkId: string) => {
    /*const fetchedChunk = await fetchChunk(chunkId)
    const storedChunk = fetchedChunk ? fetchedChunk : nullChunk*/
    const storedChunk = temphack()
    const updatedChunks = { ...chunkMap, [chunkId]: storedChunk }
    setChunkMap(updatedChunks)
  }

  const getChunk = (coords: Point): Chunk | undefined => {
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
