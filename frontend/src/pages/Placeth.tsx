import Canvas from "../components/Canvas"
import Panel from "../components/Panel"

const Placeth: React.FC = () => {
  return (
    <div>
      <Panel />
      <Canvas height={window.innerHeight} width={window.innerWidth} />
    </div>
  )
}

export default Placeth
