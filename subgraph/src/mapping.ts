import { Bytes } from "@graphprotocol/graph-ts"
import { placePixel, ChangePixelsCall } from "../generated/placePixel/placePixel"
import { Chunk } from "../generated/schema"

export function handleChangePixels(call: ChangePixelsCall): void{
    let data = call.inputs._pixels
    for (let i = 0; i< data.length/5; i+=5){
        let y = data[i+2]<<8 + data[i+2]
        let x = data[i+2]<<8 + data[i+3]
        let id = y/8 * 8192 + x/8
        let chunk = Chunk.load(id.toString())
        if (chunk == null){
            chunk = new Chunk(id.toString())
            chunk.color = new Bytes(64)
            chunk.color[y/8 * 8 + x/8] = data[i+4]
        }
        chunk.save()
    }
}