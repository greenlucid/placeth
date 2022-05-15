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
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 *  @title placeERC721
 *  @author Shotaro N. - <shawtarohgn@gmail.com>
 *  @dev A simple erc721 for placeth.
 **/
contract placeERC721 is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("placeth", "PLC") {}

    function _baseURI() internal view override returns (string memory) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return string(abi.encodePacked("https://www.placeth.art/#/nft/", Strings.toString(id), "/"));
    }

    function totalSupply() public view returns (uint256){
        return _tokenIdCounter.current();
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}
