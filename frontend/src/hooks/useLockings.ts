import { useState } from "react"
import { Locking } from "../types"
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

const temphack = (): Locking[] => {
  // gens a random lockings for testing before subgraph
  return [
    {
      id: "dsfasdf",
      requester: "afdsasf",
      timestamp: 123,
      x: 32000,
      y: 32000,
      xx: 32010,
      yy: 32010,
    },
  ]
}

const useLockings = (): Locking[] | undefined => {
  const [lockings, setLockings] = useState<Locking[]>()

  const updateLockings = async () => {
    const fetchedChunk = await temphack()
    setLockings(fetchedChunk)
  }

  if (lockings === undefined) {
    updateLockings()
    return undefined
  }

  return lockings
}

export default useLockings
