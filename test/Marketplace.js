const {
    expectEvent, // Assertions for emitted events
    expectRevert,
    time
} = require("@openzeppelin/test-helpers");
const { italic } = require("ansi-colors");
const { use, Assertion } = require("chai");
var chai = require("chai");
const { on } = require("events");
var expect = chai.expect;
const ERC721 = artifacts.require("NFTMarketplace")
const proxy = artifacts.require("TransferProxy")
const trade = artifacts.require("Trade")
const ERC20 = artifacts.require('token')
contract("NFTmarketplace", function (accounts) {
    before(async function () {
        ERC721Instance = await ERC721.new()
        proxyInstance = await proxy.new()
        tradeInstance = await trade.new(25, 25, proxyInstance.address)
        tokenInstance = await ERC20.new(accounts[0])
    })
    describe(`NFTmarketplace contract address`, async () => {
        var tokenId;
        it(`Contract Address`, async () => {
            console.log(ERC721Instance.address);
            console.log(tokenInstance.address);
            console.log(proxyInstance.address);
            console.log(tradeInstance.address);
        })

        it(`Trade`, async () => {
            await ERC721Instance.setApprovalForAll(proxyInstance.address, true, { from: accounts[1] })
            let getfee = await tradeInstance.getFees([accounts[0], accounts[1], tokenInstance.address, ERC721Instance.address, 1, 1, 1, "20000000000000000", 2, 'sample', 1, 10, 1])
            console.log(getfee);
            await ERC721Instance.setApprovalForAll(proxyInstance.address, true)
            await ERC721Instance.setApprovalForAll(tradeInstance.address, true)
            let mint = await ERC721Instance.createToken('sample', "10000000000000000", { from: accounts[1], value: "10000000000000000" })
            let event = mint.receipt.logs[0]
            tokenId = Number(event.args[2])
            await ERC721Instance.executeSale(tokenId, { from: accounts[0], value: "10000000000000000" })
            await proxyInstance.changeOperator(tradeInstance.address, { from: accounts[0] })
            await tokenInstance.transfer(accounts[1], "10000000000000000000", { from: accounts[0] })
            await tokenInstance.approve(proxyInstance.address, "10000000000000000000", { from: accounts[1] })
            await tokenInstance.approve(ERC721Instance.address, "10000000000000000000", { from: accounts[1] })
            let seller = accounts[0]
            console.log(seller);
            await tokenInstance.approve(ERC721Instance.address, "10000000000000000000", { from: accounts[1] })
            let owner = await ERC721Instance.ownerOf(tokenId)
            console.log(owner);
            await ERC721Instance.approve(tradeInstance.address, 1, { from: accounts[0] })
            await tradeInstance.executeBid([accounts[0], accounts[1], tokenInstance.address, ERC721Instance.address, 1, 1, 1, "20000000000000000", 1, 'sample', 1, 10, 1], { from: accounts[0] })
        })
    })

})
