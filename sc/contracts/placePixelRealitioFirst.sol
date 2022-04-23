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
    address public arbitrator = 0x99489D7bb33539F3D1A401741E56e8f02B9AE0Cf; // realitio kleros with appeals on kovan
    RealityETH_v3_0 public reality = RealityETH_v3_0(0xcB71745d032E16ec838430731282ff6c10D29Dea);
    //event lockRequest(bytes32 questionID);
    constructor(uint256 _costPerPixel) {
        costPerPixel = _costPerPixel;
    }

    function changePixels(bytes calldata _pixels) external{
    }

    function lock(uint16 _x, uint16 _y, uint16 _xx, uint16 _yy) external payable returns(bytes32 qID){
        require(msg.value >= (_xx-_x+1)*(_yy-_y+1)*costPerPixel, "Insufficient deposit.");
        string memory question= string(abi.encodePacked(Strings.toString(_x),"\xE2\x90\x9F",Strings.toString(_y),"\xE2\x90\x9F",Strings.toString(_xx),"\xE2\x90\x9F",Strings.toString(_yy)));
        bytes32 questionID = reality.askQuestion(20, question, arbitrator, challengePeriod, 0, 0);
        reality.submitAnswer{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000000000000000000000000000000);
        return questionID;
    }

    //function withdrawDeposit(bytes32 questionID) external{
    //    reality.claimMultipleAndWithdrawBalance([questionID], );
    //}
}
