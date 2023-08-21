const {
  expectEvent, // Assertions for emitted events
  expectRevert,
  time
} = require("@openzeppelin/test-helpers");
const { italic } = require("ansi-colors");
const { use, Assertion } = require("chai");
let chai = require("chai");
const { on } = require("events");

let { expect } = chai;

const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const ERC721 = artifacts.require("NFTMarketplace");
const ERC1155 = artifacts.require("LootmogulUser1155Token");
const BeaconContractForERC721 = artifacts.require("BeaconContract");
const BeaconContractForERC1155 = artifacts.require("BeaconContract");
const Factory721 = artifacts.require("Factory721");
const Factory1155 = artifacts.require("Factory1155");
const ERC20 = artifacts.require("token");
const StakingNFT = artifacts.require("StakingNFT");

let stakingRewardRate = 100;
let stakingRewardDuration = 30; // 30 sec

contract("Staking NFT", (accounts) => {
  before(async () => {
    erc721Instance = await ERC721.new();
    erc1155Instance = await ERC1155.new();
    beaconERC721Instance = await BeaconContractForERC721.new(erc721Instance.address);
    beaconERC1155Instance = await BeaconContractForERC1155.new(erc1155Instance.address);
    factoryERC721Instance = await Factory721.new(beaconERC721Instance.address);
    factoryERC1155Instance = await Factory1155.new(beaconERC1155Instance.address);
    tokenInstance = await ERC20.new(accounts[2]);

    stakingNFTInstance = await deployProxy(
      StakingNFT,
      [tokenInstance.address, stakingRewardRate, stakingRewardDuration],
      { initializer: "initialize" }
    );
  });

  describe(`Staking ERC721 NFT contract address`, async () => {
    let erc721ContractInstance, erc721TokenId;
    it(`All Contract Address`, async () => {
      console.log(erc721Instance.address);
      console.log(erc1155Instance.address);
      console.log(beaconERC721Instance.address);
      console.log(beaconERC1155Instance.address);
      console.log(factoryERC721Instance.address);
      console.log(factoryERC1155Instance.address);
      console.log(stakingNFTInstance.address);
      console.log(tokenInstance.address);
    });

    it(`Deposite ERC20 token to staking contract`, async () => {
      let transaction = await tokenInstance.mint(stakingNFTInstance.address, 10000000000);
      // console.log(transaction);
    });

    it(`Allow pay reward in crypto`, async () => {
      let transaction = await stakingNFTInstance.setPayReward(true);
      // console.log(transaction);
    });

    it(`Grant role to mint for ERC721 contract`, async () => {
      let transaction = await factoryERC721Instance.grantRole(
        "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
        accounts[1]
      );
      // console.log(transaction);
    });

    it(`Deploy ERC721 Collection Contract Address`, async () => {
      let transaction = await factoryERC721Instance.deploy(
        "0x3078463335343861443044353838313242313632436136653137324362654431",
        "Test721",
        "TST",
        "",
        { from: accounts[1] }
      );
      const event = transaction.receipt.logs[0];
      const erc721ContractAddress = event.args.contractAddress;
      erc721ContractInstance = await ERC721.at(erc721ContractAddress);
    });

    it(`Mint ERC721 Token`, async () => {
      let mint = await erc721ContractInstance.createToken("", 10, { from: accounts[1] });
      const event = mint.receipt.logs[0];
      erc721TokenId = Number(event.args[2]);
    });

    it(`setApproval Functionality for erc721`, async () => {
      let transaction = await erc721ContractInstance.setApprovalForAll(stakingNFTInstance.address, true, {
        from: accounts[1]
      });
    });

    it(`Whitelist token contract`, async () => {
      let transaction = await stakingNFTInstance.addToWhitelist([erc721ContractInstance.address]);
      // console.log(transaction);
    });

    it(`Staking ERC721 Token`, async () => {
      const transaction = await stakingNFTInstance.stakeToken(erc721ContractInstance.address, erc721TokenId, 1, 1, {
        from: accounts[1]
      });
      // console.log(accounts[1], stakingNFTInstance.address, erc721ContractInstance.address, erc721TokenId);
    });

    it(`Unstaking ERC721 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.unStakeToken(
        erc721ContractInstance.address,
        erc721TokenId,
        1,
        0,
        1,
        { from: accounts[1] }
      );
      // console.log(transaction);
    });

    it(`Staking ERC721 Token`, async () => {
      const transaction = await stakingNFTInstance.stakeToken(erc721ContractInstance.address, erc721TokenId, 1, 1, {
        from: accounts[1]
      });
      // console.log(accounts[1], stakingNFTInstance.address, erc721ContractInstance.address, erc721TokenId);
    });

    it(`Restaking ERC721 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.reStakeToken(erc721ContractInstance.address, erc721TokenId, 1, 1, {
        from: accounts[1]
      });
      // console.log(transaction);
    });

    it(`Unstaking ERC721 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.unStakeToken(
        erc721ContractInstance.address,
        erc721TokenId,
        1,
        1,
        1,
        { from: accounts[1] }
      );
      // console.log(transaction);
    });
  });

  describe(`Staking ERC1155 NFT contract address`, async () => {
    let erc1155ContractInstance, erc1155TokenId;

    // ERC1155 contract calls
    it(`Grant role to mint for ERC1155 contract`, async () => {
      let transaction = await factoryERC1155Instance.grantRole(
        "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
        accounts[1]
      );
      // console.log(transaction);
    });

    it(`Deploy ERC1155 Collection Contract Address`, async () => {
      let transaction = await factoryERC1155Instance.deploy(
        "0x3078463335343861443044353838313242313632436136653137324362654431",
        "Test721",
        "TST",
        "",
        { from: accounts[1] }
      );
      const correctEvent = transaction.receipt.logs.find((event) => event.event === "Deployed");
      // console.log("contractAddress", correctEvent.args.contractAddress);
      const erc1155ContractAddress = correctEvent.args.contractAddress;
      erc1155ContractInstance = await ERC1155.at(erc1155ContractAddress);
    });

    it(`Mint ERC1155 Token`, async () => {
      let mint = await erc1155ContractInstance.mint("", 10, 10, { from: accounts[1] });
      const event = mint.receipt.logs[0];
      console.log(mint.receipt.logs);
      erc1155TokenId = Number(event.args[3]);
      console.log(erc1155TokenId);
    });

    it(`Mint and Transfer ERC1155`, async () => {
      let mint = await erc1155ContractInstance.mint("", 10, 10, { from: accounts[1] });
      const event = mint.receipt.logs[0];
      const nftID = Number(event.args[3]);
      // console.log(nftID);
      const transaction = await erc1155ContractInstance.safeTransferFrom(accounts[1], accounts[2], nftID, 10, [], {
        from: accounts[1]
      });
      // console.log(transaction);
    });

    it(`setApproval Functionality for ERC1155`, async () => {
      let transaction = await erc1155ContractInstance.setApprovalForAll(stakingNFTInstance.address, true, {
        from: accounts[1]
      });
    });

    it(`Whitelist token contract`, async () => {
      let transaction = await stakingNFTInstance.addToWhitelist([erc1155ContractInstance.address]);
      console.log(transaction);
    });

    it(`Staking ERC1155 Token`, async () => {
      const transaction = await stakingNFTInstance.stakeToken(erc1155ContractInstance.address, erc1155TokenId, 1, 0, {
        from: accounts[1]
      });
      console.log(transaction);
      // console.log(accounts[1], stakingNFTInstance.address, erc1155ContractInstance.address, erc1155TokenId);
    });

    it(`Unstaking ERC1155 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.unStakeToken(
        erc1155ContractInstance.address,
        erc1155TokenId,
        1,
        0,
        0,
        { from: accounts[1] }
      );
      console.log(transaction);
    });

    it(`Staking ERC1155 Token`, async () => {
      const transaction = await stakingNFTInstance.stakeToken(erc1155ContractInstance.address, erc1155TokenId, 1, 0, {
        from: accounts[1]
      });
      // console.log(accounts[1], stakingNFTInstance.address, erc721ContractInstance.address, erc1155TokenId);
    });

    it(`Restaking ERC1155 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.reStakeToken(erc1155ContractInstance.address, erc1155TokenId, 0, 1, {
        from: accounts[1]
      });
      // console.log(transaction);
    });

    it(`Unstaking ERC1155 Token and claim reward`, async () => {
      function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      await timeout(40000);
      const transaction = await stakingNFTInstance.unStakeToken(
        erc1155ContractInstance.address,
        erc1155TokenId,
        1,
        1,
        0,
        { from: accounts[1] }
      );
      // console.log(transaction);
    });
  });
});
