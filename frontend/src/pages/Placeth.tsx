import Canvas from "../components/Canvas"
import Panel from "../components/Panel"

const Placeth: React.FC<{width: number, height: number}> = ({width, height}) => {
  return (
    <div>
      <Panel />
      <Canvas width={width} height={height}/>
    </div>
  )
}

export default Placeth
