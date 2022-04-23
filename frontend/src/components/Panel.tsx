import { ColorResult, SwatchesPicker } from "react-color"
import { hexToColorId, palette } from "../libs/colors"

const DragButton: React.FC<{
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = ({ setColorId }) => {
  return <button onClick={() => setColorId(undefined)}>Drag Mode</button>
}

const CommitButton: React.FC = () => {
  return <button>Commit Changes</button>
}

const Panel: React.FC<{
  colorId: number | undefined
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = (props) => {
  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    props.setColorId(newColorId)
  }

  return (
    <div className="panel">
      <DragButton setColorId={props.setColorId} />
      <SwatchesPicker
        color={props.colorId ? palette[props.colorId] : undefined}
        colors={[palette]}
        onChange={handleChange}
      />
      <CommitButton />
    </div>
  )
}

export default Panel
