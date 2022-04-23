// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 */

pragma solidity ^0.8.6;

import "@reality.eth/contracts/development/contracts/RealityETH-3.0.sol";
import "@reality.eth/contracts/development/contracts/BalanceHolder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract placePixel {

    uint256 public costPerPixel;
    uint32 public challengePeriod = 86400; // 1 day
    mapping(bytes32=>area) lockedAreaRequests;

    address public arbitrator = 0x99489D7bb33539F3D1A401741E56e8f02B9AE0Cf; // realitio kleros with appeals on kovan
    RealityETH_v3_0 public reality = RealityETH_v3_0(0xcB71745d032E16ec838430731282ff6c10D29Dea);

    event lockRequest(uint16 x, uint16 y, uint16 xx, uint16 yy);
    event unlockRule(uint16 x, uint16 y, uint16 xx, uint16 yy);

    constructor(uint256 _costPerPixel) {
        costPerPixel = _costPerPixel;
    }

    struct area{
        uint16 x;
        uint16 y;
        uint16 xx;
        uint16 yy;
    }

    function changePixels(bytes calldata _pixels) external{
    }

    function lock(uint16 _x, uint16 _y, uint16 _xx, uint16 _yy) external payable returns(bytes32 quesitonID){
        require(msg.value >= (_xx-_x+1)*(_yy-_y+1)*costPerPixel, "Insufficient deposit.");
        string memory question= string(abi.encodePacked(Strings.toString(_x),"\xE2\x90\x9F",Strings.toString(_y),"\xE2\x90\x9F",Strings.toString(_xx),"\xE2\x90\x9F",Strings.toString(_yy)));
        bytes32 questionID = reality.askQuestion(20, question, arbitrator, challengePeriod, 0, 0);
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
        lockedAreaRequests[questionID]=area({
            x: _x,
            y: _y,
            xx: _xx,
            yy: _yy
        });
        emit lockRequest(_x,_y,_xx,_yy);
        return questionID;
    }

    function downvote(bytes32 questionID) external payable{
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
    }

    function upvote(bytes32 questionID) external payable{
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
    }

    function executeRuling(bytes32 questionID) external{
        bytes32 answer = reality.getFinalAnswer(questionID);
        if (answer == 0){ // unlock
            area storage locked = lockedAreaRequests[questionID];
            emit unlockRule(locked.x,locked.y,locked.xx,locked.yy);
        } else{
            //TODO mint NFT
        }
    }

}
