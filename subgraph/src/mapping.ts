import { Bytes } from "@graphprotocol/graph-ts"
import { placePixel, ChangePixelsCall, LockCall, lockRequest, unlockRule} from "../generated/placePixel/placePixel"
import { Chunk, LockRequest } from "../generated/schema"

export function handleChangePixels(call: ChangePixelsCall): void{
    let data = call.inputs._pixels
    for (let i = 0; i< data.length/5; i+=5){
        let x = data[i]*256 + data[i+1]
        let y = data[i+2]*256 + data[i+3]
        let id =  (x/8).toString()+","+(y/8).toString()
        let chunk = Chunk.load(id)
        if (chunk == null){
            chunk = new Chunk(id)
            chunk.color = new Bytes(64)
            for(let j =0; j<64;j++)
                chunk.color[j] = 255
            chunk.lock = new Bytes(8)
        }
        // don't color if locked.
        let xx = x-x/8*8
        let yy = y-y/8*8
        if((chunk.lock[yy] >> u8(xx)) == 0){
            chunk.color[(yy)*8 + xx] = data[i+4]
            chunk.save()
        }
    } 
}

export function handleLock(event: lockRequest): void{
    let x = event.params.x //uin16
    let y = event.params.y
    let xx = event.params.xx
    let yy = event.params.yy
    let lockreq = new LockRequest(event.params.questionID.toString())
    lockreq.x = x
    lockreq.xx = xx
    lockreq.y = y
    lockreq.yy = yy
    lockreq.deleted = false
    lockreq.save()
    // first check that all the interior chunks are unlocked
    for (let x_c = x; x_c/8<=xx/8; x_c+=8){ // iterate through chunks
        for (let y_c = y; y_c/8<=yy/8; y_c+=8){
            let id =  (x_c/8).toString()+","+(y_c/8).toString()
            let chunk = Chunk.load(id)
            if (chunk == null){
                chunk = new Chunk(id.toString())
                chunk.color = new Bytes(64)
                for(let j =0; j<64;j++)
                    chunk.color[j] = 255
                chunk.lock = new Bytes(8)
                chunk.save()
            }
            let x_low = 0
            let y_low = 0
            let x_up = 7
            let y_up = 7
            if(y_c == y){ // top boundary
                y_low = y-y/8*8
            }
            if(x_c == x){// left boundary
                x_low = x-x/8*8
            }
            if (x_c/8 == xx/8){ // right boundary
                x_up = 8+xx/8*8-xx
            }
            if (y_c/8 == yy/8){//bottom boundary
                y_up = 8+yy/8*8-yy
            }
            for(let y_l=y_low; y_l<=y_up;y_l++){
                let lock = chunk.lock[y_l]
                for(let x_l=x_low; x_l<=x_up;x_l++){
                    if(((lock >> u8(x_l)) & 1) == 1){ // overlaps locked pixel
                        return
                    }
                }
            }
        }
    }

    // second lock all the chunks
    for (let x_c = x; x_c/8<=xx/8; x_c+=8){ // iterate through chunks
        for (let y_c = y; y_c/8<=yy/8; y_c+=8){
            let id =  (x_c/8).toString()+","+(y_c/8).toString()
            let chunk = Chunk.load(id)
            if (chunk == null){
                chunk = new Chunk(id.toString())
                chunk.color = new Bytes(64)
                for(let j =0; j<64;j++)
                    chunk.color[j] = 255
                chunk.lock = new Bytes(8)
                chunk.save()
            }
            let x_low = 0
            let y_low = 0
            let x_up = 7
            let y_up = 7
            if(y_c == y){ // top boundary
                y_low = y-y/8*8
            }
            if(x_c == x){// left boundary
                x_low = x-x/8*8
            }
            if (x_c/8 == xx/8){ // right boundary
                x_up = xx-xx/8*8
            }
            if (y_c/8 == yy/8){//bottom boundary
                y_up = yy-yy/8*8
            }
            for(let y_l=y_low; y_l<=y_up;y_l++){
                let lock = chunk.lock[y_l]
                for(let x_l=x_low; x_l<=x_up;x_l++){
                    lock += 1 << u8(7-x_l)
                }
                chunk.lock[y_l] = lock;
            }
            chunk.save()
        }
    }
}

export function handleUnlockRule(event: unlockRule): void{
    let x = event.params.x //uin16
    let y = event.params.y
    let xx = event.params.xx
    let yy = event.params.yy
    // second lock all the chunks
    let lock = LockRequest.load(event.params.questionID.toString())
    if(lock == null){
        lock = new LockRequest(event.params.questionID.toString())
        lock.x = x
        lock.xx = xx
        lock.y = y
        lock.yy = yy
        lock.deleted = true;
    }
    lock.deleted = true;
    for (let x_c = x; x_c/8<=xx/8; x_c+=8){ // iterate through chunks
        for (let y_c = y; y_c/8<=yy/8; y_c+=8){
            let id =  (x_c/8).toString()+","+(y_c/8).toString()
            let chunk = Chunk.load(id)
            if (chunk == null){
                chunk = new Chunk(id.toString())
                chunk.color = new Bytes(64)
                for(let j =0; j<64;j++)
                    chunk.color[j] = 255
                chunk.lock = new Bytes(8)
                chunk.save()
            }
            let x_low = 0
            let y_low = 0
            let x_up = 7
            let y_up = 7
            if(y_c == y){ // top boundary
                y_low = y-y/8*8
            }
            if(x_c == x){// left boundary
                x_low = x-x/8*8
            }
            if (x_c/8 == xx/8){ // right boundary
                x_up = xx-xx/8*8
            }
            if (y_c/8 == yy/8){//bottom boundary
                y_up = yy-yy/8*8
            }
            for(let y_l=y_low; y_l<=y_up;y_l++){
                let lock = chunk.lock[y_l]
                for(let x_l=x_low; x_l<=x_up;x_l++){
                    if(((lock >> u8(x_l)) & 1) == 1){ // if locked, unlock
                        lock -= 1 << u8(7-x_l)
                    }
                }
                chunk.lock[y_l] = lock;
            }
            chunk.save()
        }
    }
}
