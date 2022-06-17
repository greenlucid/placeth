import { ColorResult, SwatchesPicker } from "react-color"
import { useDispatch, useSelector } from "react-redux"
import encodePixelChanges, { pixelChangesMapToArr } from "../libs/pixel-changes"
import slice from "../redux/placeth"
import { PixelChangesMap, Point, State } from "../types"
import { Link } from "react-router-dom"
import Logo from "./Logo"
import cn from "classnames"
import { Place__factory } from "../types/ethers-contracts/factories"
import ColorPicker from "./ColorPicker"
import useWeb3 from "../hooks/useWeb3"
import { getAddress } from "ethers/lib/utils"
import { injected } from "../hooks/useConnect"

const CommitButton: React.FC = () => {
  const { account, library } = useWeb3()
  const dispatch = useDispatch()

  const pixelChangesMap = useSelector<State, PixelChangesMap>(
    (state) => state.pixelChangesMap
  )

  const commitChanges = async () => {
    if (!account || !library) return

    const placeEth = Place__factory.connect(
      "0xb25ba694e53ed11fa7e1aeca8cc640f85af5b436",
      library
    )

    const pixelChanges = pixelChangesMapToArr(pixelChangesMap)
    const calldata = encodePixelChanges(pixelChanges)

    await placeEth.changePixels(calldata)

    dispatch(slice.actions.deletePixelChanges())
  }

  return (
    <button
      className="py-2 bg-orange-500 text-white font-bold"
      disabled={!Object.values(pixelChangesMap).length}
      onClick={commitChanges}
    >
      COMMIT
    </button>
  )
}

const empackArray = (items: any[], size: number) => {
  const packs = []
  items = [...items]

  while (items.length) {
    packs.push(items.splice(0, size))
  }

  return packs
}

const Panel: React.FC = () => {
  const dispatch = useDispatch()
  const zoom = useSelector<State, number>((state) => state.zoom)
  const { x, y } = useSelector<State, Point>((state) => state.pointedPixel)
  const cursorMode = useSelector<State, string>((state) => state.cursorMode)

  const { actions } = slice
  const { account, activate } = useWeb3()

  return (
    <div className="absolute m-auto w-32 top-10 bottom-10 left-10 bg-white border-2 border-orange-500 shadow-lg shadow-orange-500 rounded flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col w-full">
        <div className="p-1">
          <Logo />
        </div>
        <div className="p-2 bg-orange-500 flex flex-col font-bold text-white">
          <span>X {x - 2 ** 15}</span>
          <span>Y {y - 2 ** 15}</span>
        </div>
        <div className="grid grid-rows-2 grid-flow-col">
          <button
            className={cn("w-16 h-16 text-3xl", {
              "bg-slate-200": cursorMode === "drag",
            })}
            onClick={() => {
              dispatch(actions.changeColorId(undefined))
              dispatch(actions.changeCursorMode("drag"))
            }}
          >
            ✊
          </button>
          <button
            className={cn("w-16 h-16 text-3xl", {
              "bg-slate-200": cursorMode === "erase",
            })}
            onClick={() => {
              dispatch(actions.changeColorId(undefined))
              dispatch(actions.changeCursorMode("erase"))
            }}
          >
            🗑️
          </button>
          <button
            className={cn("w-16 h-16 text-3xl", {
              "bg-slate-200": cursorMode === "lock",
            })}
            onClick={() => {
              dispatch(actions.changeColorId(undefined))
              dispatch(actions.changeCursorMode("lock"))
            }}
          >
            🔒
          </button>
          <button
            className="w-16 h-16 text-3xl"
            onClick={() => dispatch(actions.deletePixelChanges())}
          >
            ☢️
          </button>
        </div>
        <div className="my-8 w-full">
          <span className="mx-4 text-2xl font-bold">🔍 {zoom}</span>
          <div className="flex">
            <button
              className="w-16 h-16 text-3xl"
              onClick={() => dispatch(actions.changeZoom(zoom - 1))}
            >
              ➖
            </button>
            <button
              className="w-16 h-16 text-3xl"
              onClick={() => dispatch(actions.changeZoom(zoom + 1))}
            >
              ➕
            </button>
          </div>
        </div>
        <div className="mx-auto mb-5">
          <ColorPicker />
        </div>
        <CommitButton />
      </div>

      <div className="flex flex-col items-center">
        <div>🗿⚱🗿</div>
        <button
          className="w-full bg-orange-500 text-white font-bold"
          onClick={() => activate(injected)}
        >
          {account ? shortenAddress(account) : "Connect"}
        </button>
      </div>

      <div className="flex flex-col">
        <Link className="mx-auto font-bold" to="/lockings">
          LOCKINGS
        </Link>
        <Link className="mx-auto font-bold" to="/help">
          HELP
        </Link>
      </div>
    </div>
  )
}

export default Panel

export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}
