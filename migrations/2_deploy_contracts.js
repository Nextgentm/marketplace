const fs = require("fs");
const Factory1155 = artifacts.require("Factory1155");

module.exports = async function (deployer, network) {
    deployer.deploy(Factory1155);
    await Factory1155.deployed();
    console.log(`Factory721 address`, Factory1155.address);

    const Factory1155 = {
        address: Factory1155.address,
        abi: JSON.parse(Factory1155.interface.format("json")),
    };
    fs.writeFileSync(
        "./src/abi/collectionContract.json",
        JSON.stringify(erc721data)
    );
};
