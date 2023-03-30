const NFTMarketplace = artifacts.require("NFTMarketplace");
const Trade = artifacts.require("Trade");
const TransferProxy = artifacts.require("TransferProxy");

module.exports = async function (deployer, network) {
    const buyerfee = 25;
    const sellerfee = 25;

    deployer.deploy(NFTMarketplace);
    await NFTMarketplace.deployed();
    console.log(`NFTMarketplace address`, NFTMarketplace.address);

    deployer.deploy(TransferProxy);
    await TransferProxy.deployed();
    console.log(`TransferProxy address`, TransferProxy.address);

    deployer.deploy(Trade);
    await Trade.deployed(buyerfee, sellerfee, TransferProxy.address);
    console.log(`Trade address`, Trade.address);
};
