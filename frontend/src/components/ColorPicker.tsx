import { useDispatch, useSelector } from "react-redux"
import { colors } from "../libs/colors"
import slice from "../redux/placeth"
import { State } from "../types"

const ColorPicker: React.FC = () => {
  const dispatch = useDispatch()
  const colorId = useSelector<State, number>((state) => state.colorId)

  const createHandleColorChange = (i: number) => () => {
    dispatch(slice.actions.changeColorId(i))
    dispatch(slice.actions.changeCursorMode("paint"))
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <span className="font-bold" style={{ color: colors[colorId] }}>
          Picked
        </span>
        <div
          className="w-8 h-8 m-1"
          style={{ backgroundColor: colors[colorId] }}
        />
      </div>
      <div className="grid grid-rows-16 grid-cols-16 gap-0">
        {colors.map((color, i) => (
          <div
            key={i}
            className="h-2 w-2"
            style={{ background: color }}
            onClick={createHandleColorChange(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker
