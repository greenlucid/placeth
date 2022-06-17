import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"

const useWeb3 = () => useWeb3React<Web3Provider>()

export default useWeb3
