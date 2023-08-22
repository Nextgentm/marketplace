const {
  expectEvent, // Assertions for emitted events
  expectRevert,
  time
} = require("@openzeppelin/test-helpers");
const { italic } = require("ansi-colors");
const { use, Assertion } = require("chai");
let chai = require("chai");
const { on } = require("events");
const { ethers } = require("ethers");

let { expect } = chai;
const ERC721 = artifacts.require("NFTMarketplace");
const ERC1155 = artifacts.require("LootmogulUser1155Token");
const BeaconContractForERC721 = artifacts.require("BeaconContract");
const BeaconContractForERC1155 = artifacts.require("BeaconContract");
const Factory721 = artifacts.require("Factory721");
const Factory1155 = artifacts.require("Factory1155");
const TransferProxy = artifacts.require("TransferProxy");
const Trade = artifacts.require("Trade");
const ERC20 = artifacts.require("token");

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
//truffle wallet private key's for signature
const wallet1PrivateKey = "276e8ee4b4b62a902c037f31bd5d4c2df2dc2df04d40b9f6e752889986652f65";
const wallet2PrivateKey = "d431515afb70213c9ee5c62f687285b3b719886b7d7137e78b8c68891f20000c";

contract("Marketplace", (accounts) => {
  before(async () => {
    erc721Instance = await ERC721.new();
    erc1155Instance = await ERC1155.new();
    beaconERC721Instance = await BeaconContractForERC721.new(erc721Instance.address);
    beaconERC1155Instance = await BeaconContractForERC1155.new(erc1155Instance.address);
    factoryERC721Instance = await Factory721.new(beaconERC721Instance.address);
    factoryERC1155Instance = await Factory1155.new(beaconERC1155Instance.address);
    transferProxyInstance = await TransferProxy.new();
    tradeInstance = await Trade.new(25, 25, transferProxyInstance.address);
    await transferProxyInstance.changeOperator(tradeInstance.address, {
      from: accounts[0]
    });
    tokenInstance = await ERC20.new(accounts[2]);
  });

  describe(`NFTmarketplace contract address`, async () => {
    let erc721ContractInstance, erc1155ContractInstance, erc721TokenId, erc1155TokenId;
    it(`All Contract Address`, async () => {
      console.log(erc721Instance.address);
      console.log(erc1155Instance.address);
      console.log(beaconERC721Instance.address);
      console.log(beaconERC1155Instance.address);
      console.log(factoryERC721Instance.address);
      console.log(factoryERC1155Instance.address);
      console.log(transferProxyInstance.address);
      console.log(tradeInstance.address);
      console.log(tokenInstance.address);
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

    it(`Mint and Transfer erc721`, async () => {
      let mint = await erc721ContractInstance.createToken("", 10, { from: accounts[1] });
      const event = mint.receipt.logs[0];
      nftID = Number(event.args[2]);
      const transaction = await erc721ContractInstance.transferFrom(accounts[1], accounts[2], nftID, {
        from: accounts[1]
      });
      // console.log(transaction);
    });

    it(`setApproval Functionality for erc721`, async () => {
      let transaction = await erc721ContractInstance.setApprovalForAll(transferProxyInstance.address, true, {
        from: accounts[1]
      });
    });

    describe(`NFTmarketplace direct buy ERC721`, async () => {
      let sellerSignature, buyerSignature;
      const convertedPrice = 100;
      const date = new Date();
      const startTimestamp = Math.floor(date.getTime() / 1000);
      const endTimeStamp = Math.floor((date.getTime() + 1000 * 60 * 60) / 1000);

      it(`create seller Signature`, async () => {
        const orderSellerHash = await tradeInstance.getOrderSellerHash([
          accounts[1], // seller
          accounts[2], // buyer (skip)
          tokenInstance.address, // erc20Address
          erc721ContractInstance.address, // NFT contractAddress
          1, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          1, // total onsale quantity
          false, // skip royalty
          startTimestamp,
          endTimeStamp,
          erc721TokenId, // tokenID
          convertedPrice, // total price (skip)
          1, // total purchase quantity (skip)
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderSellerHash);
        // Sign the message using the private key of the signer account
        // Sign the message using the etherjs wallet signer account
        const wallet = new ethers.Wallet(wallet1PrivateKey, provider);
        sellerSignature = await wallet.signMessage(ethers.utils.arrayify(orderSellerHash));
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderSellerHash, sellerSignature);

        expect(recoveredSigner).to.equal(accounts[1]);
      });

      it(`Approve ERC20 Token`, async () => {
        const transaction = await tokenInstance.increaseAllowance(transferProxyInstance.address, convertedPrice, {
          from: accounts[2]
        });
        // console.log(transaction);
      });

      it(`create buyer Signature`, async () => {
        const orderBuyerHash = await tradeInstance.getOrderBuyerHash([
          accounts[1], // seller (skip)
          accounts[2], // buyer
          tokenInstance.address, // erc20Address
          erc721ContractInstance.address, // NFT contractAddress
          1, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          1, // total onsale quantity (skip)
          false, // skip royalty (skip)
          startTimestamp, // (skip)
          endTimeStamp, // (skip)
          erc721TokenId, // tokenID
          convertedPrice, // total price
          1, // total purchase quantity
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderBuyerHash);
        // Sign the message using the private key of the signer account
        const wallet = new ethers.Wallet(wallet2PrivateKey, provider);
        buyerSignature = await wallet.signMessage(ethers.utils.arrayify(orderBuyerHash));
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderBuyerHash, buyerSignature);

        expect(recoveredSigner).to.equal(accounts[2]);
      });

      it(`Failed Direct Buy NFT without signature`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.buyAsset(
            [
              accounts[1], // seller
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc721ContractInstance.address, // NFT contractAddress
              1, // nftType 1-erc721 | 0- erc1155
              convertedPrice, // unit price
              1, // total onsale quantity
              false, // skip royalty
              startTimestamp,
              endTimeStamp,
              erc721TokenId, // tokenID
              convertedPrice, // total price
              1, // total purchase quantity
              "0x", // seller signaure
              buyerSignature // buyer signaure
            ],
            { from: accounts[2] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Failed Direct Buy NFT with wrong price`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.buyAsset(
            [
              accounts[1], // seller
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc721ContractInstance.address, // NFT contractAddress
              1, // nftType 1-erc721 | 0- erc1155
              5, // unit price
              1, // total onsale quantity
              false, // skip royalty
              startTimestamp,
              endTimeStamp,
              erc721TokenId, // tokenID
              5, // total price
              1, // total purchase quantity
              sellerSignature, // seller signaure
              buyerSignature // buyer signaure
            ],
            { from: accounts[2] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Direct Buy NFT`, async () => {
        let transaction = await tradeInstance.buyAsset(
          [
            accounts[1], // seller
            accounts[2], // buyer
            tokenInstance.address, // erc20Address
            erc721ContractInstance.address, // NFT contractAddress
            1, // nftType 1-erc721 | 0- erc1155
            convertedPrice, // unit price
            1, // total onsale quantity
            false, // skip royalty
            startTimestamp,
            endTimeStamp,
            erc721TokenId, // tokenID
            convertedPrice, // total price
            1, // total purchase quantity
            sellerSignature, // seller signaure
            buyerSignature // buyer signaure
          ],
          { from: accounts[2] }
        );
        // console.log(transaction);

        newOwner = await erc721ContractInstance.ownerOf(erc721TokenId);
        assert.equal(newOwner, accounts[2], "NFT havn't transfer successfully");
      });
    });

    describe(`NFTmarketplace Auction buy ERC721`, async () => {
      let sellerSignature, buyerSignature;
      const convertedPrice = 100;
      const date = new Date();
      const startTimestamp = Math.floor(date.getTime() / 1000);
      const endTimeStamp = Math.floor((date.getTime() + 1000 * 60 * 60) / 1000);

      it(`Mint ERC721 Token`, async () => {
        let mint = await erc721ContractInstance.createToken("", 10, { from: accounts[1] });
        const event = mint.receipt.logs[0];
        erc721TokenId = Number(event.args[2]);
        // console.log(erc721TokenId);
      });

      it(`create seller Signature`, async () => {
        const orderSellerHash = await tradeInstance.getOrderSellerHash([
          accounts[1], // seller
          accounts[2], // buyer (skip)
          tokenInstance.address, // erc20Address
          erc721ContractInstance.address, // NFT contractAddress
          1, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          1, // total onsale quantity
          false, // skip royalty
          startTimestamp,
          endTimeStamp,
          erc721TokenId, // tokenID
          convertedPrice, // total price (skip)
          1, // total purchase quantity (skip)
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderSellerHash);
        // Sign the message using the etherjs wallet signer account
        const wallet = new ethers.Wallet(wallet1PrivateKey, provider);
        sellerSignature = await wallet.signMessage(ethers.utils.arrayify(orderSellerHash));
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderSellerHash, sellerSignature);

        expect(recoveredSigner).to.equal(accounts[1]);
      });

      it(`Approve ERC20 Token`, async () => {
        const transaction = await tokenInstance.increaseAllowance(transferProxyInstance.address, convertedPrice, {
          from: accounts[2]
        });
        // console.log(transaction);
      });

      it(`create buyer Signature`, async () => {
        const orderBuyerHash = await tradeInstance.getOrderBuyerHash([
          accounts[1], // seller (skip)
          accounts[2], // buyer
          tokenInstance.address, // erc20Address
          erc721ContractInstance.address, // NFT contractAddress
          1, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          1, // total onsale quantity (skip)
          false, // skip royalty (skip)
          startTimestamp, // (skip)
          endTimeStamp, // (skip)
          erc721TokenId, // tokenID
          convertedPrice, // total price
          1, // total purchase quantity
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderBuyerHash);
        // Sign the message using the private key of the signer account
        const wallet = new ethers.Wallet(wallet2PrivateKey, provider);
        buyerSignature = await wallet.signMessage(ethers.utils.arrayify(orderBuyerHash));
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderBuyerHash, buyerSignature);

        expect(recoveredSigner).to.equal(accounts[2]);
      });

      it(`Failed Auction Buy NFT without signature`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.executeBid(
            [
              accounts[1], // seller
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc721ContractInstance.address, // NFT contractAddress
              1, // nftType 1-erc721 | 0- erc1155
              convertedPrice, // unit price
              1, // total onsale quantity
              false, // skip royalty
              startTimestamp,
              endTimeStamp,
              erc721TokenId, // tokenID
              convertedPrice, // total price
              1, // total purchase quantity
              "0x", // seller signaure
              "0x" // buyer signaure
            ],
            { from: accounts[1] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Failed Auction Buy NFT with wrong price`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.executeBid(
            [
              accounts[1], // seller
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc721ContractInstance.address, // NFT contractAddress
              1, // nftType 1-erc721 | 0- erc1155
              5, // unit price
              1, // total onsale quantity
              false, // skip royalty
              startTimestamp,
              endTimeStamp,
              erc721TokenId, // tokenID
              5, // total price
              1, // total purchase quantity
              sellerSignature, // seller signaure
              buyerSignature // buyer signaure
            ],
            { from: accounts[1] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Accept Bid`, async () => {
        // console.log(erc721TokenId);
        let transaction = await tradeInstance.executeBid(
          [
            accounts[1], // seller
            accounts[2], // buyer
            tokenInstance.address, // erc20Address
            erc721ContractInstance.address, // NFT contractAddress
            1, // nftType 1-erc721 | 0- erc1155
            convertedPrice, // unit price
            1, // total onsale quantity
            false, // skip royalty
            startTimestamp,
            endTimeStamp,
            erc721TokenId, // tokenID
            convertedPrice, // total price
            1, // total purchase quantity
            sellerSignature, // seller signaure
            buyerSignature // buyer signaure
          ],
          { from: accounts[1] }
        );
        // console.log(transaction);

        newOwner = await erc721ContractInstance.ownerOf(erc721TokenId);
        assert.equal(newOwner, accounts[2], "NFT havn't transfer successfully");
      });
    });

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
      erc1155TokenId = Number(event.args[3]);
      // console.log(erc1155TokenId);
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
      let transaction = await erc1155ContractInstance.setApprovalForAll(transferProxyInstance.address, true, {
        from: accounts[1]
      });
    });

    describe(`NFTmarketplace direct buy ERC1155`, async () => {
      let sellerSignature, buyerSignature;
      const convertedPrice = 100;
      const date = new Date();
      const startTimestamp = Math.floor(date.getTime() / 1000);
      const endTimeStamp = Math.floor((date.getTime() + 1000 * 60 * 60) / 1000);

      it(`create seller Signature`, async () => {
        const orderSellerHash = await tradeInstance.getOrderSellerHash([
          accounts[1], // seller
          accounts[2], // buyer (skip)
          tokenInstance.address, // erc20Address
          erc1155ContractInstance.address, // NFT contractAddress
          0, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          10, // total onsale quantity
          false, // skip royalty
          startTimestamp,
          endTimeStamp,
          erc1155TokenId, // tokenID
          convertedPrice * 10, // total price (skip)
          10, // total purchase quantity (skip)
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderSellerHash);
        // Sign the message using the etherjs wallet signer account
        const wallet = new ethers.Wallet(wallet1PrivateKey, provider);
        sellerSignature = await wallet.signMessage(ethers.utils.arrayify(orderSellerHash));
        // console.log(sellerSignature);
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderSellerHash, sellerSignature);

        expect(recoveredSigner).to.equal(accounts[1]);
      });

      it(`Approve ERC20 Token`, async () => {
        const transaction = await tokenInstance.increaseAllowance(transferProxyInstance.address, convertedPrice * 10, {
          from: accounts[2]
        });
        // console.log(transaction);
      });

      it(`create buyer Signature`, async () => {
        const orderBuyerHash = await tradeInstance.getOrderBuyerHash([
          accounts[1], // seller (skip)
          accounts[2], // buyer
          tokenInstance.address, // erc20Address
          erc1155ContractInstance.address, // NFT contractAddress
          0, // nftType 1-erc721 | 0- erc1155
          convertedPrice, // unit price
          10, // total onsale quantity (skip)
          false, // skip royalty (skip)
          startTimestamp, // (skip)
          endTimeStamp, // (skip)
          erc1155TokenId, // tokenID
          convertedPrice * 10, // total price
          10, // total purchase quantity
          "0x", // seller signaure (skip)
          "0x" // buyer signaure (skip)
        ]);
        // console.log(orderBuyerHash);
        // Sign the message using the private key of the signer account
        const wallet = new ethers.Wallet(wallet2PrivateKey, provider);
        buyerSignature = await wallet.signMessage(ethers.utils.arrayify(orderBuyerHash));
        // console.log(buyerSignature);
        // Verify the signature
        const recoveredSigner = await web3.eth.accounts.recover(orderBuyerHash, buyerSignature);

        expect(recoveredSigner).to.equal(accounts[2]);
      });

      it(`Failed Direct Buy NFT without signature`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.buyAsset(
            [
              accounts[1], // seller (skip)
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc1155ContractInstance.address, // NFT contractAddress
              0, // nftType 1-erc721 | 0- erc1155
              convertedPrice, // unit price
              10, // total onsale quantity (skip)
              false, // skip royalty (skip)
              startTimestamp, // (skip)
              endTimeStamp, // (skip)
              erc1155TokenId, // tokenID
              convertedPrice * 10, // total price
              10, // total purchase quantity
              "0x", // seller signaure
              buyerSignature // buyer signaure
            ],
            { from: accounts[2] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Failed Direct Buy NFT with wrong price`, async () => {
        let error = false;
        try {
          let transaction = await tradeInstance.buyAsset(
            [
              accounts[1], // seller (skip)
              accounts[2], // buyer
              tokenInstance.address, // erc20Address
              erc1155ContractInstance.address, // NFT contractAddress
              0, // nftType 1-erc721 | 0- erc1155
              5, // unit price
              10, // total onsale quantity (skip)
              false, // skip royalty (skip)
              startTimestamp, // (skip)
              endTimeStamp, // (skip)
              erc1155TokenId, // tokenID
              5 * 10, // total price
              10, // total purchase quantity
              sellerSignature, // seller signaure
              buyerSignature // buyer signaure
            ],
            { from: accounts[2] }
          );
          // console.log(transaction);
        } catch (err) {
          // console.log(err);
          error = true;
        }

        expect(error).to.equal(true);
      });

      it(`Direct Buy NFT`, async () => {
        let transaction = await tradeInstance.buyAsset(
          [
            accounts[1], // seller (skip)
            accounts[2], // buyer
            tokenInstance.address, // erc20Address
            erc1155ContractInstance.address, // NFT contractAddress
            0, // nftType 1-erc721 | 0- erc1155
            convertedPrice, // unit price
            10, // total onsale quantity (skip)
            false, // skip royalty (skip)
            startTimestamp, // (skip)
            endTimeStamp, // (skip)
            erc1155TokenId, // tokenID
            convertedPrice * 10, // total price
            10, // total purchase quantity
            sellerSignature, // seller signaure
            buyerSignature // buyer signaure
          ],
          { from: accounts[2] }
        );
        // console.log(transaction);
      });
    });
  });
});
