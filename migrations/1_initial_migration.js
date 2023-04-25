var transfer = artifacts.require("TransferProxy");
var trade = artifacts.require("Trade");
var factory = artifacts.require("Factory721");
var factory1155 = artifacts.require("Factory1155");

module.exports = async function (deployer, network) {
  await deployer.deploy(transfer);
  var transferProxy = await transfer.deployed();
  await deployer.deploy(factory);
  await deployer.deploy(factory1155);
  await deployer.deploy(trade, 25, 25, transferProxy.address);
  var tradeAddress = trade.address;
  await transferProxy.changeOperator(tradeAddress);
};
