interface Config {
  SUBGRAPH_URL_MAP: { [chainId: number]: string }
  ZOOM: number
  EXPIRY_TIME: number
  CHUNK_SIDE: number
}

const conf: Config = {
  SUBGRAPH_URL_MAP: {
    1: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
    42: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
  },
  ZOOM: 12,
  EXPIRY_TIME: 60_000,
  CHUNK_SIDE: 8,
}

export default conf
