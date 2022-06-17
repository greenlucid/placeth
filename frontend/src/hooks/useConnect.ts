import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { useCallback, useEffect, useState } from "react"

export const injected = new InjectedConnector({ supportedChainIds: [1, 42] })

export function useConnect() {
  const [tried, setTried] = useState(false)
  const { activate, active, error } = useWeb3React()

  const tryConnect = useCallback(async () => {
    const isAuthorized = await injected.isAuthorized()
    if (isAuthorized) await activate(injected, undefined, true)
    setTried(true)
  }, [activate])

  useEffect(() => {
    if (!active) tryConnect()
  }, [active, tryConnect])

  useEffect(() => {
    if (active) setTried(true)
  }, [active])

  useEffect((): any => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on) {
      const handleChainChanged = () => activate(injected)
      const handleAccountsChanged = (accounts: string[]) =>
        accounts.length > 0 && activate(injected)

      ethereum.on("chainChanged", handleChainChanged)
      ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("chainChanged", handleChainChanged)
          ethereum.removeListener("accountsChanged", handleAccountsChanged)
        }
      }
    }
  }, [active, tried, activate])

  return { tried, error }
}
