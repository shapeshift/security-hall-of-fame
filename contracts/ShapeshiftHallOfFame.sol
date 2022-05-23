// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ShapeshiftHallOfFame is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // Counter for autoincremented token IDs
    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to timelock end time
    mapping(uint256 => uint256) public timelocks;

    // Token timelock duration after it's minted
    uint256 public timelockDuration;

    // Check if the timelock is over for the given token
    modifier timelockLifted(uint256 tokenId) {
        require(
            block.timestamp >= timelocks[tokenId],
            "ShapeshiftHallOfFame: This token is timelocked"
        );
        _;
    }

    constructor(uint256 _timelockDuration)
        ERC721("Shapeshift Hall of Fame", "SHOF")
    {
        timelockDuration = _timelockDuration;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    /**
     * @notice Mints the NFT, setting its URI and timelock end time
     */
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        timelocks[tokenId] = block.timestamp + timelockDuration;
    }

    /**
     * @notice Allow the token owner to change their token's URI after the timelock is lifted
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        timelockLifted(tokenId)
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "ShapeshiftHallOfFame: URI can only be changed by the owner"
        );

        _setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev Standard implementation with an added timelock check
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override timelockLifted(tokenId) {
        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Standard implementation with an added timelock check
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override timelockLifted(tokenId) {
        super.safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev Standard implementation with an added timelock check
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override timelockLifted(tokenId) {
        super.safeTransferFrom(from, to, tokenId, _data);
    }

    // The following functions are overrides required by Solidity

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
