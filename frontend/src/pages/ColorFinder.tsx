import { useState } from "react"
import { palette } from "../libs/colors"

const ColorGrid = () => {
  const [s, setS] = useState<number | undefined>()
  const [arr, setArr] = useState<string[]>(palette)

  const handleChange = (i: number) => {
    if (s) {
      const copy = [...arr]
      const store = arr[s]
      copy[s] = copy[i]
      copy[i] = store
      setArr(copy)
      setS(undefined)
      console.log(copy)
    } else {
      setS(i)
    }
  }

  const createHandleColorChange = (i: number) => () => {
    handleChange(i)
  }

  const getCellStyle = (
    x: number,
    y: number,
    color: string
  ): React.CSSProperties => {
    const SIZE = 40
    return {
      position: "absolute",
      height: SIZE,
      width: SIZE,
      left: x * SIZE,
      top: y * SIZE,
      backgroundColor: color,
    }
  }

  return (
    <div className="colorGrid">
      {arr.map((color, i) => {
        const [x, y] = [i % 16, Math.floor(i / 16)]
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

const ColorFinder = () => {
  return <ColorGrid />
}

export default ColorFinder
