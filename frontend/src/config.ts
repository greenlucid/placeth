interface Config {
  SUBGRAPH_URL: string
  CELL_SIZE: number
  EXPIRY_TIME: number
}

const conf: Config = {
  SUBGRAPH_URL:
    "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
  CELL_SIZE: 10,
  EXPIRY_TIME: 15_000,
}

export default conf
