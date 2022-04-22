import "./App.css"
import Canvas from "./components/Canvas"
import ColorSelector from "./components/Panel"

function App() {
  return <div>
    <ColorSelector />
    <Canvas height={window.innerHeight} width={window.innerWidth} />
  </div>
}

export default App
