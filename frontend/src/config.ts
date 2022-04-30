interface Config {
  SUBGRAPH_URL_MAP: { [chainId: number]: string }
  ZOOM: number
  EXPIRY_TIME: number
}

const conf: Config = {
  SUBGRAPH_URL_MAP: {
    1: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
    42: "https://api.thegraph.com/subgraphs/name/shotaronowhere/placeth",
  },
  ZOOM: 5,
  EXPIRY_TIME: 15_000,
}

export default conf
