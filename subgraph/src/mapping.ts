import { Bytes } from "@graphprotocol/graph-ts"
import { placePixel, ChangePixelsCall, LockCall} from "../generated/placePixel/placePixel"
import { Chunk } from "../generated/schema"

export function handleChangePixels(call: ChangePixelsCall): void{
    let data = call.inputs._pixels
    for (let i = 0; i< data.length/5; i+=5){
        let y = data[i+2]<<8 + data[i+2]
        let x = data[i+2]<<8 + data[i+3]
        let id =  x.toString+","+y.toString
        let chunk = Chunk.load(id)
        if (chunk == null){
            chunk = new Chunk(id)
            chunk.color = new Bytes(64)
            chunk.lock = new Bytes(8)
            chunk.color[y/8 * 8 + x/8] = data[i+4]
        }
        chunk.save()
    }
}

export function handleLock(call: LockCall): void{
    let x = call.inputs._x
    let y = call.inputs._y
    let xx = call.inputs._xx
    let yy = call.inputs._yy
    let id1 = x.toString+","+y.toString
    let id2 = xx.toString+","+yy.toString
    // first check that all the interior chunks are unlocked
    for (let x_c = x; x_c/8<=xx/8; x_c+=8){ // iterate through chunks
        for (let y_c = y; y_c/8<=yy/8; y_c+=8){
            let id = y/8 * 8192 + x/8
            let chunk = Chunk.load(id.toString())
            if (chunk == null){
                chunk = new Chunk(id.toString())
                chunk.color = new Bytes(64)
                chunk.lock = new Bytes(8)
                chunk.save()
            }
            let x_low = 0
            let y_low = 0
            let x_up = 7
            let y_up = 7
            if(y_c == y){ // top boundary
                y_low = y
            }
            if(x_c == x){
                x_low = x
            }
            if (x_c/8 == xx/8){
                x_up = xx
            }
            if (y_c/8 == yy/8){
                y_up = yy
            }
            for(let y_l=y_low; y_l<=y_up;y_l++){
                let lock = chunk.lock[y_l]
                for(let x_l=x_low; x_l<=x_up;x_l++){
                    if((lock >> x_l & 1)){ // overlaps locked pixel
                        return
                    }
                }
            }
        }
    }
    // second lock all the chunks
    for (let x_c = x; x_c/8<=xx/8; x_c+=8){ // iterate through chunks
        for (let y_c = y; y_c/8<=yy/8; y_c+=8){
            let id = y/8 * 8192 + x/8
            let chunk = Chunk.load(id.toString())
            if (chunk == null){
                chunk = new Chunk(id.toString())
                chunk.color = new Bytes(64)
                chunk.lock = new Bytes(8)
                chunk.save()
            }
            let x_low = 0
            let y_low = 0
            let x_up = 7
            let y_up = 7
            if(y_c == y){ // top boundary
                y_low = y
            }
            if(x_c == x){
                x_low = x
            }
            if (x_c/8 == xx/8){
                x_up = xx
            }
            if (y_c/8 == yy/8){
                y_up = yy
            }
            for(let y_l=y_low; y_l<=y_up;y_l++){
                let lock = chunk.lock[y_l]
                for(let x_l=x_low; x_l<=x_up;x_l++){
                    lock += 1 << x_l
                }
                chunk.lock[y_l] = lock
            }
            chunk.save()
        }
    }
}