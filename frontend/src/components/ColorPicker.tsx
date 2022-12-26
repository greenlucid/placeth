import { useDispatch, useSelector } from "react-redux"
import { palette } from "../libs/colors"
import slice from "../redux/placeth"
import { State } from "../types"

const Feedback = () => {
  const colorId = useSelector<State, number>((state) => state.colorId)
  const color = palette[colorId]
  return <div style={{ backgroundColor: color, height: 50, width: 50 }} />
}

const EyeDropper = () => {
  // todo. its a green rect for now.
  return <div style={{ backgroundColor: "#00ff00", height: 50, width: 50 }} />
}

const ColorGrid = () => {
  const dispatch = useDispatch()
  const createHandleColorChange = (i: number) => () => {
    dispatch(slice.actions.changeColorId(i))
    dispatch(slice.actions.changeCursorMode("paint"))
  }

  const getCellStyle = (
    x: number,
    y: number,
    color: string
  ): React.CSSProperties => {
    const SIZE = 5
    return {
      position: "relative",
      height: SIZE,
      width: SIZE,
      left: x * SIZE,
      top: y * SIZE,
      backgroundColor: color,
    }
  }

  return (
    <div className="colorGrid">
      {palette.map((color, i) => {
        const [x, y] = [i % 16, Math.floor(i / 16)]
        console.log({ color, i, x, y })
        return (
          <div
            key={i}
            className="colorGridCell"
            style={getCellStyle(x, y, color)}
            onClick={createHandleColorChange(i)}
          />
        )
      })}
    </div>
  )
}

const ColorPicker: React.FC = () => {
  return (
    <div className="colorPicker">
      <div className="colorUpperRow">
        <Feedback />
        <EyeDropper />
      </div>
      <ColorGrid />
    </div>
  )
}

export default ColorPicker
