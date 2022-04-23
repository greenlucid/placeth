import { useState } from "react"
import { Chunk, LocalChunk, Point } from "../types"
import conf from "../config"

type ChunkMap = { [chunkId: string]: LocalChunk | undefined }

const nullChunk: Chunk = {
  chunkdata: [
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    255, 255, 255, 255,
  ],
  locks: [0, 0, 0, 0, 0, 0, 0, 0],
}

const coordsToChunkId = (coords: Point): string => {
  const chunkId = `${coords.x}${coords.y}`
  return chunkId
}

const fetchChunk = async (chunkId: string): Promise<LocalChunk | null> => {
  const subgraphQuery = {
    query: `
      {
        chunk(id: "${chunkId}") {
          color
          lock
        }
      }
    `,
  }
  const response = await fetch(conf.SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify(subgraphQuery),
  })
  console.log(response)

  const { data } = await response.json()
  const chunk: Chunk | null = data.chunk
  if (chunk) {
    return { ...chunk, fetchedIn: new Date().getTime() }
  }

  return null
}

const temphack = (): LocalChunk => {
  // gens a random chunk for testing before subgraph
  const chunkdata = []
  const randomColor = Math.floor(Math.random() * 256)
  for (let i = 0; i < 64; i++) {
    chunkdata.push(randomColor)
  }
  chunkdata[1] = 0
  const locks = [0, 0, 0, 0, 0, 0, 0, 0]
  return { chunkdata, locks, fetchedIn: new Date().getTime() }
}

const useChunk = () => {
  const [chunkMap, setChunkMap] = useState<ChunkMap>({})

  const updateChunks = async (chunkId: string) => {
    const fetchedChunk = await fetchChunk(chunkId)
    const storedChunk = fetchedChunk
      ? fetchedChunk
      : { ...nullChunk, fetchedIn: new Date().getTime() }
    const updatedChunks = { ...chunkMap, [chunkId]: storedChunk }
    setChunkMap(updatedChunks)
  }

  const getChunk = (coords: Point): LocalChunk | undefined => {
    const chunkId = coordsToChunkId(coords)
    const foundChunk = chunkMap[chunkId]
    if (foundChunk === undefined) {
      updateChunks(chunkId)
      return undefined
    }
    if (foundChunk.fetchedIn + conf.EXPIRY_TIME < new Date().getTime()) {
      updateChunks(chunkId)
      return foundChunk
    }

    return foundChunk
  }

  return getChunk
}

export default useChunk
