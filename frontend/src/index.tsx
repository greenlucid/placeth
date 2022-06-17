import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { configureStore } from "@reduxjs/toolkit"
import { Provider } from "react-redux"
import slice from "./redux/placeth"
import Web3Manager from "./components/Web3Connect"
import { HashRouter } from "react-router-dom"

const store = configureStore({ reducer: slice.reducer, middleware: [] })

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <HashRouter>
      <Web3Manager>
        <Provider store={store}>
          <App />
        </Provider>
      </Web3Manager>
    </HashRouter>
  </React.StrictMode>
)
