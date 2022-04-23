interface Config {
  SUBGRAPH_URL: string
}

const getSanitizedConfig = (config: unknown): Config => {
  for (const [key, value] of Object.entries(
    config as { [value: string]: string | undefined },
  )) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`)
    }
  }
  return config as Config
}

const sanitizedConfig = getSanitizedConfig(process.env)

export default sanitizedConfig
