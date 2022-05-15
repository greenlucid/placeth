// SPDX-License-Identifier: MIT
/*
 * ██████╗ ██╗      █████╗  ██████╗███████╗████████╗██╗  ██╗
 * ██╔══██╗██║     ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║  ██║
 * ██████╔╝██║     ███████║██║     █████╗     ██║   ███████║
 * ██╔═══╝ ██║     ██╔══██║██║     ██╔══╝     ██║   ██╔══██║
 * ██║     ███████╗██║  ██║╚██████╗███████╗   ██║   ██║  ██║
 * ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝
 * 
 *  @authors: [@shotaronowhere]
 *  @reviewers: []
 *  @auditors: []
 *  @bounties: []
 *  @deployments: []
 */

pragma solidity ^0.8.6;

import "@reality.eth/contracts/development/contracts/RealityETH-3.0.sol";
import "@reality.eth/contracts/development/contracts/BalanceHolder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./placeERC721.sol";

/**
 *  @title placePixel
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev A Graffiti wall, pixel art garden. 
 **/
contract placePixel {

    // could be toggled up to protect placeth from spam, if gas was extremely cheap.
    // the value will be verified on the subgraph, and the changes are only accepted
    // if value >= length * costPerBytePixelChanges 
    uint256 public costPerBytePixelChanges;
    uint256 public costPerPixel;
    uint256 public baseDeposit;
    uint256 public depositRatio;
    uint256 public requestCount;
    uint32 public challengePeriod;
    lockRequest[] public lockRequests;
    mapping(uint256=>challenger) public challengers;
    uint public constant DEPOSIT_RATIO_DIVISOR = 1e4; // The number to divide `alpha` by.

    address public governor; // The governor of the contract.
    address public arbitrator; 
    RealityETH_v3_0 public reality;
    placeERC721 public nftFactory;

    event lock(uint256 id, uint64 packedCoordinates);
    //event lockTest(bytes32 ID, uint64 packedCoordinates);
    event challenged(uint256 ID);
    event unlock(uint256 ID);
    event nft(uint256 ID, uint64 packedCoordinates);

    struct lockRequest{
        uint64 packedCoordinates;
        uint32 timestamp;
        address requester;
    }

    struct challenger{
        uint32 nonce;
        address challenger;
    }

    // ************************************* //
    // *        Function Modifiers         * //
    // ************************************* //


    modifier onlyByGovernor() {
        require(governor == msg.sender, "Access not allowed: Governor only.");
        _;
    }

    constructor(address _governor, RealityETH_v3_0 _reality, address _arbitrator, placeERC721 _nftFactory) {
        governor = _governor;
        // 0xcB71745d032E16ec838430731282ff6c10D29Dea
        // arb testnet 0xd3312B4e9225626F8e9a483e2A87bB3966a89f3a
        reality = _reality;
        //0x99489D7bb33539F3D1A401741E56e8f02B9AE0Cf, realitio kleros with appeals on kovan
        arbitrator = _arbitrator;
        //
        nftFactory = _nftFactory;

    }

    function changePixels(bytes calldata _pixels) external payable {
    }

    function request(uint64 _packedCoordinates) external payable returns(bytes32 id){
        uint16 _yy = uint16(_packedCoordinates);
        uint16 _xx = uint16(_packedCoordinates >> 16);
        uint16 _y = uint16(_packedCoordinates >> 32);
        uint16 _x = uint16(_packedCoordinates >> 48);
    
        require(msg.value >= (uint256(_xx-_x)+1)*(uint256(_yy-_y)+1)*costPerPixel+baseDeposit, "Insufficient deposit.");

        //emit lockTest(id, _packedCoordinates);
        emit lock(lockRequests.length, _packedCoordinates);

        lockRequests.push(lockRequest({
            packedCoordinates: _packedCoordinates,
            timestamp: uint32(block.timestamp),
            requester: msg.sender
        }));
    }

    function challenge(uint256 id) external payable {
        lockRequest memory lockRequested = lockRequests[id];
        require(lockRequested.requester !=address(0), "Invalid index.");
        require( challengers[id].challenger == address(0), "Already challenged.");
        require(block.timestamp - uint256(lockRequested.timestamp) < challengePeriod, "Challenge period elapsed.") ;

        uint64 packedCoordinates = lockRequested.packedCoordinates;
        uint16 _yy = uint16(packedCoordinates);
        uint16 _xx = uint16(packedCoordinates >> 16);
        uint16 _y = uint16(packedCoordinates >> 32);
        uint16 _x = uint16(packedCoordinates >> 48);

        require(msg.value >= (uint256(_xx-_x)+1)*(uint256(_yy-_y)+1)*costPerPixel*depositRatio/DEPOSIT_RATIO_DIVISOR+baseDeposit, "Insufficient bond.");
        string memory question= Strings.toString(id);
        bytes32 questionID = reality.askQuestion(39, question, arbitrator, challengePeriod, 0, block.timestamp);
        reality.submitAnswerFor{value: msg.value}(questionID, 0x0000000000000000000000000000000000000000000000000000000000000001, 0, msg.sender);
        challengers[id] = challenger({
            nonce: uint32(block.timestamp),
            challenger: msg.sender
        });
        emit challenged(id);
    }

    function execute(uint256 id) external{
        lockRequest memory lockRequested = lockRequests[id];
        require(lockRequested.requester != address(0));
        // must wait for challenger period to elapse
        require((block.timestamp - uint256(lockRequested.timestamp)) > challengePeriod, "Challenge period is not over.") ;

        uint64 _packedCoordinates = lockRequested.packedCoordinates;
        uint16 yy = uint16(_packedCoordinates);
        uint16 xx = uint16(_packedCoordinates >> 16);
        uint16 y = uint16(_packedCoordinates >> 32);
        uint16 x = uint16(_packedCoordinates >> 48);

        challenger memory challenge = challengers[id];
        uint256 amount = (uint256(xx-x)+1)*(uint256(yy-y)+1)*costPerPixel+baseDeposit;

        if (challenge.challenger != address(0)){
            string memory question= string(Strings.toString(id));
            bytes32 content_hash = keccak256(abi.encodePacked(uint256(39), uint32(0), question));
            bytes32 questionID = keccak256(abi.encodePacked(content_hash, arbitrator, challengePeriod, uint256(0), address(reality), address(this), uint(challenge.nonce)));
            // reverts if question is not finalized
            bytes32 answer = reality.getFinalAnswer(questionID);
            if (answer == 0x0000000000000000000000000000000000000000000000000000000000000000){ // unlock
                delete challengers[id];
                delete lockRequests[id];
                payable(challenge.challenger).send(amount/2);
                emit unlock(id);
                return;
            } else if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){ // mint nft
                address requester = lockRequested.requester;
                delete challengers[id];
                delete lockRequests[id];
                nftFactory.safeMint(requester);
                payable(requester).send(amount);
                emit nft(nftFactory.totalSupply(),_packedCoordinates);
            }
        } else { // no challenge
            address requester = lockRequested.requester;
            delete lockRequests[id];
            nftFactory.safeMint(requester);
            payable(requester).send(amount);
            emit nft(nftFactory.totalSupply(),_packedCoordinates);
        }
    }

    /* External */

    /** @dev Changes the `governor` storage variable.
     *  @param _governor The new value for the `governor` storage variable.
     */
    function changeGovernor(address _governor) external onlyByGovernor {
        governor = _governor;
    }

    /** @dev Sets the `arbitrator` storage variable.
     *  @param _arbitrator The new value for the `arbitrator` storage variable.
     */
    function setArbitrator(address _arbitrator) external onlyByGovernor {
        require( arbitrator == address(0), "Arbitrator already set");
        arbitrator = _arbitrator;
    }

    /** @dev Changes the `costPerBytePixelChanges` storage variable.
     *  @param _costPerBytePixelChanges The new value for the `costPerBytePixelChanges` storage variable.
     */
    function changeCostPerBytePixelChanges(uint256 _costPerBytePixelChanges) external onlyByGovernor {
        costPerBytePixelChanges = _costPerBytePixelChanges;
    }

    /** @dev Changes the `costPerPixel` storage variable.
     *  @param _costPerPixel The new value for the `costPerPixel` storage variable.
     */
    function changeCostPerPixel(uint256 _costPerPixel) external onlyByGovernor {
        costPerPixel = _costPerPixel;
    }


    /** @dev Changes the `baseDeposit` storage variable.
     *  @param _baseDeposit The new value for the `baseDeposit` storage variable.
     */
    function changeBaseDeposit(uint256 _baseDeposit) external onlyByGovernor {
        //20000000000000000
        baseDeposit = _baseDeposit;
    }

    /** @dev Changes the `challengePeriod` storage variable.
     *  @param _challengePeriod The new value for the `challengePeriod` storage variable.
     */
    function changeChallengePeriod(uint32 _challengePeriod) external onlyByGovernor {
        //86400, 1 day
        challengePeriod = _challengePeriod;
    }

    /** @dev Changes the `depositRatio` storage variable.
     *  @param _depositRatio The new value for the `depositRatio` storage variable.
     */
    function changeDepositRatio(uint256 _depositRatio) external onlyByGovernor {
        //1000, 10%
        depositRatio = _depositRatio;
    }

    /** @dev Transfers the 'nftFactory' ownership.
     *  @param _owner The new value for the 'owner` of the NFT Factory.
     */
    function transferOwnership(address _owner) external onlyByGovernor {
        nftFactory.transferOwnership(_owner);
    }

    /** @dev Lets the governor call anything on behalf of the contract.
     *  @param _destination The destination of the call.
     *  @param _amount The value sent with the call.
     *  @param _data The data sent with the call.
     */
    function executeGovernorProposal(address _destination, uint _amount, bytes calldata _data) external onlyByGovernor {
        (bool success, ) = _destination.call{value: _amount}(_data);
        require(success, "Unsuccessful call");    
    }
}
