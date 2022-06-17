import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import { useConnect } from "../hooks/useConnect"
import useWeb3 from "../hooks/useWeb3"

const getLibrary = (provider: any): Web3Provider =>
  new Web3Provider(
    provider,
    typeof provider.chainId === "number"
      ? provider.chainId
      : typeof provider.chainId === "string"
      ? parseInt(provider.chainId)
      : "any"
  )

const Web3Connect: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { tried, error } = useConnect()
  const { active } = useWeb3()

  if (!active && tried && error) return <div>Error occured</div>

  return children
}

const Web3Manager: React.FC<{ children: JSX.Element }> = ({ children }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <Web3Connect>{children}</Web3Connect>
  </Web3ReactProvider>
)

export default Web3Manager
