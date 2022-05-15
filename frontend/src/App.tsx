import "./App.css"
import { HashRouter, Route, Routes } from "react-router-dom"
import Placeth from "./pages/Placeth"
import { Fragment, useEffect } from "react"
import Help from "./pages/Help"
import Lockings from "./pages/Lockings"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"

function App() {
  const context = useWeb3React()
  const { activate } = context

  const connectToWeb3 = () => {
    const injected = new InjectedConnector({ supportedChainIds: [1, 42] })
    
    activate(injected)
    // @ts-ignore
    window.ethereum.enable()
  }

  useEffect(() => {
    connectToWeb3()
  }, [])

  return (
    <HashRouter>
      <Fragment>
        <Routes>
          <Route path="/help" element={<Help />} />
          <Route path="/lockings" element={<Lockings />} />
          <Route path="/" element={<Placeth />} />
        </Routes>
      </Fragment>
    </HashRouter>
  )
}

export default App
