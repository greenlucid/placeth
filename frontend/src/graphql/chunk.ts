import { gql } from "@apollo/client"

const CHUNK = gql`
  query Chunk($chunkId: String!) {
    chunk(options: { chunkId: $chunkId }) {
      chunkdata
      locks
    }
  }
`

export default CHUNK