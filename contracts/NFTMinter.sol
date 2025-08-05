// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error CannotMintToZeroAddress();
error TokenURICannotBeEmpty();

contract NFTMinter is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MCP NFTs", "MCP-NFT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mint an NFT to the specified address
     * @param to Address to mint the NFT to
     * @param tokenMetadataURI Metadata URI for the NFT (can be data URI or IPFS)
     * @return tokenId The ID of the newly minted token
     */
    function mintNFT(address to, string calldata tokenMetadataURI)
        external
        returns (uint256)
    {
        if(to == address(0)) revert CannotMintToZeroAddress();
        if(bytes(tokenMetadataURI).length == 0) revert TokenURICannotBeEmpty();

        uint256 tokenId = _nextTokenId++;

        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenMetadataURI);

        emit NFTMinted(to, tokenId, tokenMetadataURI);

        return tokenId;
    }

    /**
     * @dev Get the next token ID that will be minted
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Get total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

}
