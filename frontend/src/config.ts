interface Config {
  SUBGRAPH_URL_MAP: { [chainId: number]: string }
  CELL_SIZE: number
  EXPIRY_TIME: number
}

const conf: Config = {
  SUBGRAPH_URL_MAP: {
    1: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
    42: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
  },
  CELL_SIZE: 30,
  EXPIRY_TIME: 15_000,
}

export default conf
