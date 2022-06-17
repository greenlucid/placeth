import { Route, Routes } from "react-router-dom"
import Placeth from "./pages/Placeth"
import Help from "./pages/Help"
import Lockings from "./pages/Lockings"
import Web3Manager from "./components/Web3Connect"

const App = () => (
  <Routes>
    <Route path="/help" element={<Help />} />
    <Route path="/lockings" element={<Lockings />} />
    <Route path="/" element={<Placeth />} />
  </Routes>
)

export default App
