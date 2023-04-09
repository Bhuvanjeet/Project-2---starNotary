// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.3;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {
    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    constructor () ERC721("Star Notary", "ST") {}

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star

        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The star must be up for sale!");

        uint256 costOfStar = starsForSale[_tokenId];
        address addressOfOwner = ownerOf(_tokenId);

        require(msg.value >= costOfStar, "Not enough Ether!");

        _transfer(addressOfOwner, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom

        payable(addressOfOwner).transfer(costOfStar);

        if(msg.value > costOfStar) {
            payable(msg.sender).transfer(msg.value - costOfStar);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        require(_exists(_tokenId), "Token doesn't exit");

        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address ownerToken1 = ownerOf(_tokenId1);
        address ownerToken2 = ownerOf(_tokenId2);

        require(ownerToken1 != ownerToken2, "Owner of both token is same");

        if (_msgSender() == ownerToken1) {
            _transfer(ownerToken1, ownerToken2, _tokenId1);
            _transfer(ownerToken2, ownerToken1, _tokenId2);

            require(ownerToken2 == ownerOf(_tokenId1), "Couldn't transfer token1 to 2nd address.");

            require(ownerToken1 == ownerOf(_tokenId2), "Couldn't transfer token2 to 1st address.");
        } else {
            _transfer(ownerToken2, ownerToken1, _tokenId1);
            _transfer(ownerToken1, ownerToken2, _tokenId2);

            require(ownerToken1 == ownerOf(_tokenId1), "Couldn't transfer token1 to 1st address");

            require(ownerToken2 == ownerOf(_tokenId2), "Couldn't transfer token2 to 2nd address");
        }
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(_msgSender() == ownerOf(_tokenId), "Sender is not the owner.");

        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(_msgSender(), _to1, _tokenId);

        require(_to1 == ownerOf(_tokenId), "Transfer of token failed!");
    }
}
