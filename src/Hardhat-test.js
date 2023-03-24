const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    BN, // Big Number support
    constants, // Common constants, like the zero address and largest integers
    expectEvent, // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");
require("@nomiclabs/hardhat-truffle5");

describe("NFT Marketplace", () => {
    let proxyinstance;
    let nft721instace;
    let nft1155instance;
    let tradeinstance;
    let tokenInstance;
    const nonce_ownersignature = 1;
    const nonce_ownersignature_1 = 2;
    const nonce_sellersignature = 3;
    const nonce_buyersignature_exe = 4;
    const amount = 1000;
    const qty = 1;
    let tokenId;
    let v;
    let r;
    let s;
    let v1;
    let s1;
    let r1;
    let sellersign_v;
    let sellersign_r;
    let sellersign_s;
    let v_buyer_exec;
    let r_buyer_exec;
    let s_buyer_exec;

    it("Should return the new greeting once it's changed", async () => {
        const nft721tokenName = "NexityNFT721";
        const nft721tokenSymbol = "NFT721";
        const nft1155tokenName = "NexityNFT721";
        const nft1155tokenSymbol = "NFT1155";
        const buyerFee = 25;
        const sellerFee = 25;
        const tokenURIPrefix = "https://gateway.pinata.cloud/ipfs/";
        const Proxy = await ethers.getContractFactory("TransferProxy");
        proxyinstance = await Proxy.deploy();
        await proxyinstance.deployed();
        const NFT721 = await ethers.getContractFactory("CarrotfactoryNFT721");
        nft721instace = await NFT721.deploy(
            nft721tokenName,
            nft721tokenSymbol,
            tokenURIPrefix
        );
        await nft721instace.deployed();
        const NFT1155 = await ethers.getContractFactory("CarrotfactoryNFT1155");
        nft1155instance = await NFT1155.deploy(
            nft1155tokenName,
            nft1155tokenSymbol,
            tokenURIPrefix
        );
        await nft1155instance.deployed();
        const Trade = await ethers.getContractFactory("Trade");
        tradeinstance = await Trade.deploy(
            buyerFee,
            sellerFee,
            proxyinstance.address
        );
        await tradeinstance.deployed();
        await proxyinstance.changeOperator(tradeinstance.address);
        const Token = await ethers.getContractFactory("Token");
        tokenInstance = await Token.deploy();
        await tokenInstance.deployed();
    });

    it(`setApproval Functionality for erc721`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        await nft721instace
            .connect(user1)
            .setApprovalForAll(proxyinstance.address, true);
    });

    it(`OwnerSignature`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const uri = "sample1";
        const tokenhash = await ethers.utils.solidityKeccak256(
            ["address", "address", "string", "uint256"],
            [nft721instace.address, user1.address, uri, nonce_ownersignature]
        );
        const arrayify = await ethers.utils.arrayify(tokenhash);
        const tokensignature = await owner.signMessage(arrayify);
        const splitSign = await ethers.utils.splitSignature(tokensignature);
        v = splitSign.v;
        r = splitSign.r;
        s = splitSign.s;
    });

    it(`Mint functionality`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const uri = "sample1";
        const royaltyfee = 5;
        const mint = await nft721instace
            .connect(user1)
            .mint(uri, royaltyfee, [v, r, s, nonce_ownersignature]);
        const mint_wait = await mint.wait();
        const from_address = mint_wait.events[0].args[0];
        const to_address = mint_wait.events[0].args[1];
        tokenId = mint_wait.events[0].args[2];
    });

    it(`Revert condition - Mint functionality - Owner sign verification failed`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const uri = "sample1";
        const royaltyfee = 5;
        await expectRevert(
            nft721instace
                .connect(owner)
                .mint(uri, royaltyfee, [v, r, s, nonce_ownersignature_1]),
            "Owner sign verification failed"
        );
    });

    it(`Checking tokenId after minted`, async () => {
        const tokenId_aftermint = 1;
        expect(Number(tokenId)).equal(tokenId_aftermint);
    });

    it(`Seller sign for buyAsset`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const uri = "sample1";
        const tokenhash = await ethers.utils.solidityKeccak256(
            ["address", "uint256", "address", "uint256", "uint256"],
            [
                nft721instace.address,
                tokenId,
                tokenInstance.address,
                amount,
                nonce_sellersignature,
            ]
        );
        const arrayify = await ethers.utils.arrayify(tokenhash);
        const tokensignature = await user1.signMessage(arrayify);
        const splitSign = await ethers.utils.splitSignature(tokensignature);
        sellersign_v = splitSign.v;
        sellersign_r = splitSign.r;
        sellersign_s = splitSign.s;
    });

    it(`setApproval Functionality for erc721`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        await nft721instace
            .connect(user2)
            .setApprovalForAll(proxyinstance.address, true);
    });

    it(`Transfer Function`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const to_address = user2.address;
        const amount = 1025;
        await tokenInstance.connect(owner).transfer(to_address, amount);
        await tokenInstance
            .connect(user2)
            .approve(proxyinstance.address, amount);
    });

    it(`Buying Asset by the User`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const seller = user1.address;
        const buyer = user2.address;
        const erc20Address = tokenInstance.address;
        const nftAddress = nft721instace.address;
        const nftType = 0;
        const unitPrice = 1000;
        const amount = 1025;
        const tokenId = 1;
        const qty = 1;
        await tradeinstance
            .connect(user2)
            .buyAsset(
                [
                    seller,
                    buyer,
                    erc20Address,
                    nftAddress,
                    nftType,
                    unitPrice,
                    amount,
                    tokenId,
                    qty,
                ],
                [
                    sellersign_v,
                    sellersign_r,
                    sellersign_s,
                    nonce_sellersignature,
                ]
            );
    });

    it(`buyerSignature_ExecuteBid`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const tokenId = 1;
        const amount = 1025;
        const qty = 1;
        await tokenInstance.connect(owner).transfer(user1.address, amount);
        await tokenInstance
            .connect(user1)
            .approve(proxyinstance.address, amount);
        const uri = "sample1";
        const tokenhash = await ethers.utils.solidityKeccak256(
            ["address", "uint256", "address", "uint256", "uint256", "uint256"],
            [
                nft721instace.address,
                tokenId,
                tokenInstance.address,
                amount,
                qty,
                nonce_buyersignature_exe,
            ]
        );
        const arrayify = await ethers.utils.arrayify(tokenhash);
        const tokensignature = await user1.signMessage(arrayify);
        const splitSign = await ethers.utils.splitSignature(tokensignature);
        v_buyer_exec = splitSign.v;
        r_buyer_exec = splitSign.r;
        s_buyer_exec = splitSign.s;
    });

    it(`Executing bid Revert - Checking : 'Nonce : Invalid Nonce'`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const tokenId = 1;
        const seller = user2.address;
        const buyer = user1.address;
        const erc20Address = tokenInstance.address;
        const nftAddress = nft721instace.address;
        const nftType = 1;
        const unitPrice = 1000;
        const amount = 1025;
        const qty = 1;
        await expectRevert(
            tradeinstance
                .connect(user2)
                .executeBid(
                    [
                        seller,
                        buyer,
                        erc20Address,
                        nftAddress,
                        nftType,
                        unitPrice,
                        amount,
                        tokenId,
                        qty,
                    ],
                    [
                        v_buyer_exec,
                        r_buyer_exec,
                        s_buyer_exec,
                        nonce_sellersignature,
                    ]
                ),
            "Nonce : Invalid Nonce"
        );
    });

    it(`Executing bid Revert - Checking : 'buyer sign verification failed'`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const temp_nonce = 5;
        const tokenId = 1;
        const seller = user2.address;
        const buyer = user1.address;
        const erc20Address = tokenInstance.address;
        const nftAddress = nft721instace.address;
        const nftType = 1;
        const unitPrice = 1000;
        const amount = 1025;
        const qty = 1;
        await expectRevert(
            tradeinstance
                .connect(user2)
                .executeBid(
                    [
                        seller,
                        buyer,
                        erc20Address,
                        nftAddress,
                        nftType,
                        unitPrice,
                        amount,
                        tokenId,
                        qty,
                    ],
                    [v_buyer_exec, r_buyer_exec, s_buyer_exec, temp_nonce]
                ),
            "buyer sign verification failed"
        );
    });

    it(`Transferring tokens to the buyer`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const amount = 1025;
        await tokenInstance.connect(owner).transfer(user1.address, amount);
        await tokenInstance
            .connect(user1)
            .approve(proxyinstance.address, amount);
    });

    it(`Executing bid by the User `, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const tokenId = 1;
        const seller = user2.address;
        const buyer = user1.address;
        const erc20Address = tokenInstance.address;
        const nftAddress = nft721instace.address;
        const nftType = 1;
        const unitPrice = 1000;
        const amount = 1025;
        const qty = 1;
        await tradeinstance
            .connect(user2)
            .executeBid(
                [
                    seller,
                    buyer,
                    erc20Address,
                    nftAddress,
                    nftType,
                    unitPrice,
                    amount,
                    tokenId,
                    qty,
                ],
                [
                    v_buyer_exec,
                    r_buyer_exec,
                    s_buyer_exec,
                    nonce_buyersignature_exe,
                ]
            );
    });

    it(`Revert condition - Mint functionality - Owner sign verification failed`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const uri = "sample1";
        const royaltyfee = 5;
        const supply = 1;
        await expectRevert(
            nft1155instance
                .connect(owner)
                .mint(uri, supply, royaltyfee, [
                    v,
                    r,
                    s,
                    nonce_ownersignature_1,
                ]),
            "Owner sign verification failed"
        );
    });

    it(`Transfer Function`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const to_address = user1.address;
        const amount = 1025;
        await tokenInstance.connect(owner).transfer(to_address, amount);
        await tokenInstance
            .connect(user1)
            .approve(proxyinstance.address, amount);
    });

    it(`buyerSignature_ExecuteBid`, async () => {
        const [owner, user1, user2] = await ethers.getSigners();
        const tokenId = 1;
        const amount = 1025;
        const qty = 1;
        await tokenInstance.connect(owner).transfer(user1.address, amount);
        await tokenInstance
            .connect(user1)
            .approve(proxyinstance.address, amount);
        const uri = "sample1";
        const tokenhash = await ethers.utils.solidityKeccak256(
            ["address", "uint256", "address", "uint256", "uint256", "uint256"],
            [
                nft1155instance.address,
                tokenId,
                tokenInstance.address,
                amount,
                qty,
                nonce_buyersignature_exe,
            ]
        );
        const arrayify = await ethers.utils.arrayify(tokenhash);
        const tokensignature = await user1.signMessage(arrayify);
        const splitSign = await ethers.utils.splitSignature(tokensignature);
        const v1 = splitSign.v;
        const r1 = splitSign.r;
        const s1 = splitSign.s;
    });
});
