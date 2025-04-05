const Token = artifacts.require("token");

module.exports = async function (deployer, network, accounts) {
    // Deploy token with creator address as the first account
    await deployer.deploy(Token, accounts[0]);
    const tokenInstance = await Token.deployed();

    console.log("SomniaWETH Token deployed at:", tokenInstance.address);

    // If we're on a testnet or mainnet, verify the contract
    if (network !== "development" && network !== "test") {
        console.log("Remember to verify the contract on Etherscan:");
        console.log("npx truffle run verify token@" + tokenInstance.address + " --network " + network);
    }
};