import { ColorResult, SwatchesPicker } from "react-color"
import { hexToColorId, palette } from "../libs/colors"
import { PixelChange } from "../types"

const DragButton: React.FC<{
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
}> = ({ setColorId }) => {
  return <button onClick={() => setColorId(undefined)}>Drag Mode</button>
}

const CommitButton: React.FC<{
  pixelChanges: PixelChange[]
  setPixelChanges: React.Dispatch<React.SetStateAction<PixelChange[]>>
}> = (props) => {
  const commitChanges = async () => {
    console.log(props.pixelChanges)

    // whatever
    // when confirmed, flush the changes
    props.setPixelChanges([])
  }
  return <button onClick={commitChanges}>Commit Changes</button>
}

const Panel: React.FC<{
  colorId: number | undefined
  setColorId: React.Dispatch<React.SetStateAction<number | undefined>>
  pixelChanges: PixelChange[]
  setPixelChanges: React.Dispatch<React.SetStateAction<PixelChange[]>>
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
      <CommitButton
        pixelChanges={props.pixelChanges}
        setPixelChanges={props.setPixelChanges}
      />
    </div>
  )
}

export default Panel
