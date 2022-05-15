// SPDX-License-Identifier: MIT

/**
 *  @authors: [@shotaronowhere]
 */

pragma solidity ^0.8.6;

import "@reality.eth/contracts/development/contracts/RealityETH-3.0.sol";
import "@reality.eth/contracts/development/contracts/BalanceHolder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract placePixel is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public costPerPixel;
    uint32 public challengePeriod = 86400; // 1 day
    mapping(bytes32=>area) lockedAreaRequests;

    address public arbitrator = 0x29F39dE98D750eb77b5FAfb31B2837f079FcE222; // realitio kleros with appeals on gnosis chain
    RealityETH_v3_0 public reality = RealityETH_v3_0(0xE78996A233895bE74a66F451f1019cA9734205cc);

    event lockRequest(bytes32 questionID, uint16 x, uint16 y, uint16 xx, uint16 yy);
    event unlockRule(bytes32 questionID, uint16 x, uint16 y, uint16 xx, uint16 yy);
    event nftcreated(bytes32 questionID, uint16 x, uint16 y, uint16 xx, uint16 yy);

    constructor(uint256 _costPerPixel) ERC721("placeth", "PLC") {
        costPerPixel = _costPerPixel;
    }

    struct area{
        uint16 x;
        uint16 y;
        uint16 xx;
        uint16 yy;
        address requester;
    }

    function changePixels(bytes calldata _pixels) external{
    }

    function lock(uint16 _x, uint16 _y, uint16 _xx, uint16 _yy) external payable returns(bytes32 quesitonID){
        require(msg.value >= (_xx-_x+1)*(_yy-_y+1)*costPerPixel, "Insufficient deposit.");
        string memory question= string(abi.encodePacked(Strings.toString(_x),"\xE2\x90\x9F",Strings.toString(_y),"\xE2\x90\x9F",Strings.toString(_xx),"\xE2\x90\x9F",Strings.toString(_yy)));
        bytes32 questionID = reality.askQuestion(21, question, arbitrator, challengePeriod, 0, block.timestamp);
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
        lockedAreaRequests[questionID]=area({
            x: _x,
            y: _y,
            xx: _xx,
            yy: _yy,
            requester: msg.sender
        });
        emit lockRequest(questionID,_x,_y,_xx,_yy);
        return questionID;
    }

    function downvote(bytes32 questionID) external payable{
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
    }

    function upvote(bytes32 questionID) external payable{
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000001, 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);
    }

    function _baseURI() internal view override returns (string memory) {
        return "www.placeth.com/lock/";
    }

    function executeRuling(bytes32 questionID) external{
        bytes32 answer = reality.getFinalAnswer(questionID);
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000000){ // unlock
            area memory locked = lockedAreaRequests[questionID];
            delete lockedAreaRequests[questionID];
            emit unlockRule(questionID, locked.x,locked.y,locked.xx,locked.yy);
        } 
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){ // mint nft
            area memory locked = lockedAreaRequests[questionID];
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _mint(locked.requester, newItemId);
            _setTokenURI(newItemId, Strings.toString(newItemId));
            emit nftcreated(questionID, locked.x, locked.y, locked.xx, locked.yy);
            delete lockedAreaRequests[questionID];
        }
    }

}
