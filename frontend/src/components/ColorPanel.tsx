import { ColorResult, SwatchesPicker } from "react-color"
import { hexToColorId, palette } from "../libs/colors"

const ColorPanel: React.FC<{
  colorId: number
  setColorId: React.Dispatch<React.SetStateAction<number>>
}> = (props) => {
  const handleChange = (color: ColorResult) => {
    const newColorId = hexToColorId[color.hex]
    props.setColorId(newColorId)
  }

  return (
    <SwatchesPicker
      color={palette[props.colorId]}
      colors={[palette]}
      onChange={handleChange}
    />
  )
}

export default ColorPanel
