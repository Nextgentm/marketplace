let ERC721 = artifacts.require("NFTMarketplace");
let ERC1155 = artifacts.require("LootmogulUser1155Token");
let BeaconContractForERC721 = artifacts.require("BeaconContract");
let BeaconContractForERC1155 = artifacts.require("BeaconContract");
let Factory721 = artifacts.require("Factory721");
let Factory1155 = artifacts.require("Factory1155");
let TransferProxy = artifacts.require("TransferProxy");
let Trade = artifacts.require("Trade");

const { deployProxy } = require("@openzeppelin/truffle-upgrades");
let StakingNFT = artifacts.require("StakingNFT");

let minterWalletAddress = "0x69Ca7ed1E033B42C28D5e3a7B802Bd74F63E752a";
let stakingRewardToken = "0xa2F8298bb40b2846689a99Bf73A4B0A18bB9d5De";
let stakingRewardRate = 100;
let stakingRewardDuration = 300; // 5 min

module.exports = async function (deployer, network) {
  console.log("--- deploying all contracts ---");
  // deploy erc721 instance
  await deployer.deploy(ERC721);
  let ERC721Instance = await ERC721.deployed();
  console.log("ERC721Instance deployed to:", ERC721Instance.address);
  // deploy erc1155 instance
  await deployer.deploy(ERC1155);
  let ERC1155Instance = await ERC1155.deployed();
  console.log("ERC1155Instance deployed to:", ERC1155Instance.address);
  // deploy beacon instance for ERC721
  await deployer.deploy(BeaconContractForERC721, ERC721Instance.address);
  let BeaconERC721Instance = await BeaconContractForERC721.deployed();
  console.log("BeaconERC721Instance deployed to:", BeaconERC721Instance.address);
  // deploy beacon instance for ERC1155
  await deployer.deploy(BeaconContractForERC1155, ERC1155Instance.address);
  let BeaconERC1155Instance = await BeaconContractForERC1155.deployed();
  console.log("BeaconERC1155Instance deployed to:", BeaconERC1155Instance.address);
  // deploy erc721 factory contract instance
  await deployer.deploy(Factory721, BeaconERC721Instance.address);
  let FactoryERC721Instance = await Factory721.deployed();
  console.log("FactoryERC721Instance deployed to:", FactoryERC721Instance.address);
  // deploy erc1155 factory contract instance
  await deployer.deploy(Factory1155, BeaconERC1155Instance.address);
  let FactoryERC1155Instance = await Factory1155.deployed();
  console.log("FactoryERC1155Instance deployed to:", FactoryERC1155Instance.address);

  //grant minter role
  const role = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";
  await FactoryERC721Instance.grantRole(role, minterWalletAddress);
  await FactoryERC1155Instance.grantRole(role, minterWalletAddress);

  // deploy proxy instance
  await deployer.deploy(TransferProxy);
  let TransferProxyInstance = await TransferProxy.deployed();
  console.log("TransferProxyInstance Contract deployed to:", TransferProxyInstance.address);
  // deploy trade instance
  await deployer.deploy(Trade, 25, 25, TransferProxyInstance.address);
  let TradeInstance = await Trade.deployed();
  console.log("TradeInstance Contract deployed to:", TradeInstance.address);
  // Update operator on proxy contract
  await TransferProxyInstance.changeOperator(TradeInstance.address);
  console.log("transfer proxy operator changed successfully");

  await deployer.deploy(StakingNFT);
  const StakingNFTInstance = await deployProxy(
    StakingNFT,
    [stakingRewardToken, stakingRewardRate, stakingRewardDuration],
    { initializer: "initialize" }
  );
  console.log("StakingNFTInstance Contract deployed to:", StakingNFTInstance.address);

  console.log("Deployment complete!");
};
