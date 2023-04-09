const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    var tokenId = 1;
    var instance = await StarNotary.deployed();

    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('let account1 put up their star for sale', async() => {
    var instance = await StarNotary.deployed();
    var account1 = accounts[1];
    var idOfStar = 2;
    var priceOfStar = web3.utils.toWei(".001", "ether");

    await instance.createStar('bhuvan star', idOfStar, {from: account1});
    await instance.putStarUpForSale(idOfStar, priceOfStar, {from: account1});

    assert.equal(await instance.starsForSale.call(idOfStar), priceOfStar);
});

it('let account1 get the funds after the sale', async() => {
    var instance = await StarNotary.deployed();
    var account1 = accounts[1];
    var account2 = accounts[2];
    var idOfStar = 3;
    var priceOfStar = web3.utils.toWei(".001", "ether");
    var balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('bhuvan star', idOfStar, {from: account1});
    await instance.putStarUpForSale(idOfStar, priceOfStar, {from: account1});

    var balanceOfaccount1BeforeTransaction = await web3.eth.getBalance(account1);

    await instance.buyStar(idOfStar, {from: account2, value: balance});

    var balanceOfaccount1AfterTransaction = await web3.eth.getBalance(account1);
    var value1 = Number(balanceOfaccount1BeforeTransaction) + Number(priceOfStar);
    var value2 = Number(balanceOfaccount1AfterTransaction);
    assert.equal(value1, value2);
});

it('let account2 buy a star, if it is put up for sale', async() => {
    var instance = await StarNotary.deployed();
    var account1 = accounts[1];
    var account2 = accounts[2];

    var idOfStar = 4;

    var priceOfStar = web3.utils.toWei(".001", "ether");
    var balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('bhuvan star', idOfStar, {from: account1});
    await instance.putStarUpForSale(idOfStar, priceOfStar, {from: account1});

    var balanceOfaccount1BeforeTransaction = await web3.eth.getBalance(account2);

    await instance.buyStar(idOfStar, {from: account2, value: balance});

    assert.equal(await instance.ownerOf.call(idOfStar), account2);
});

it('let account2 buy a star and decreases its balance in ether', async() => {
    var instance = await StarNotary.deployed();
    var account1 = accounts[1];
    var account2 = accounts[2];

    var idOfStar = 5;

    var priceOfStar = web3.utils.toWei(".001", "ether");
    var balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('bhuvan star', idOfStar, {from: account1});
    await instance.putStarUpForSale(idOfStar, priceOfStar, {from: account1});
    
    var balanceOfaccount1BeforeTransaction = await web3.eth.getBalance(account2);
    const balanceOfaccount2BeforeTransaction = await web3.eth.getBalance(account2);

    await instance.buyStar(idOfStar, {from: account2, value: balance, gasPrice:0});

    const balanceAfteraccount2BuysStar = await web3.eth.getBalance(account2);
    var value = Number(balanceOfaccount2BeforeTransaction) - Number(balanceAfteraccount2BuysStar);
    assert.equal(value, priceOfStar);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // Do I need to lookup the token name and symbol actually?
    // At least this is what is mentioned in Udacity: "The token name and token symbol are added properly."
    // In this case I used given functionality of the constructor of the ERC721 smart contract
    var instance = await StarNotary.deployed();
    assert.equal("Star Notary", await instance.name.call())
    assert.equal("ST", await instance.symbol.call())
    // 1. create a Star with different tokenId
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
});

it('let 2 users exchange stars', async() => {
    var instance = await StarNotary.deployed();
    var account1 = accounts[0]
    var account2 = accounts[1]

    // 1. create 2 Stars with different tokenId
    await instance.createStar('Test Star 1', 6, { from: account1 })
    await instance.createStar('Test Star 2', 7, { from: account2 })

    // 1.2. verify owners
    assert.equal(account1, await instance.ownerOf(6))
    assert.equal(account2, await instance.ownerOf(7))

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(6, 7, { from: account1 })

    // 3. Verify that the owners changed
    assert.equal(account1, await instance.ownerOf(7))
    assert.equal(account2, await instance.ownerOf(6))
});

it('let a user transfer a star', async() => {
    var instance = await StarNotary.deployed();
    var goatUser = accounts[5]

    // 1. create a Star with different tokenId
    await instance.createStar('Goat Star', 77, { from: owner })

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(goatUser, 77, { from:owner })

    // 3. Verify the star owner changed.
    assert.equal(goatUser, await instance.ownerOf(77))
});

it('lookUptokenIdToStarInfo test', async() => {
    var instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId

    await instance.createStar('Last test star', 9, { from: owner })
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same

    assert.equal('Last test star', await instance.lookUptokenIdToStarInfo.call(9))
});
