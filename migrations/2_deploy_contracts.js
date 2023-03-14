const Factory721 = artifacts.require("Factory721");

module.exports = async function (deployer, network) {
    deployer.deploy(Factory721);
    await Factory721.deployed();
    console.log(`Factory721 address`, Factory721.address);

};
