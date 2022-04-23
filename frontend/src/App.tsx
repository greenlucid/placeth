import "./App.css"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Placeth from "./pages/Placeth"
import { Fragment } from "react"
import Help from "./pages/Help"
import Lockings from "./pages/Lockings"

function App() {
  return (
    <BrowserRouter>
      <Fragment>
        <Routes>
          <Route path="/help" element={<Help />}/>
          <Route path="/lockings" element={<Lockings />}/>
          <Route path="/" element={<Placeth />} />
        </Routes>
      </Fragment>
    </BrowserRouter>
  )
}

export default App
