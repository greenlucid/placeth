import { useState } from "react"
import { Chunk, Locking, Point } from "../types"
import conf from "../config"

const fetchLockings = async (): Promise<Locking[]> => {
  const subgraphQuery = {
    query: `
      {
        lockings {
          id
          x
          y
          xx
          yy
          requester
          timestamp
        }
      }
    `,
  }
  const response = await fetch(conf.SUBGRAPH_URL, {
    method: "POST",
    body: JSON.stringify(subgraphQuery),
    
  })

  const { data } = await response.json()
  const lockings: Locking[] = data.lockings

  return lockings
}

const useLockings = (): Locking[] | undefined => {
  const [lockings, setLockings] = useState<Locking[]>()

  const updateLockings = async () => {
    const fetchedChunk = await fetchLockings()
    setLockings(fetchedChunk)
  }

  if (lockings === undefined) {
    updateLockings()
    return undefined
  }

  return lockings
}

export default useLockings
