require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    somnia: {
      provider: function () {
        return new HDWalletProvider(
          process.env.MNEMONIC || "4b9ce9b1e6ed3e484528d61298366dbfe2e82970eb1b09f5dd6dba93a4efe8b1",
          "https://dream-rpc.somnia.network/"
        );
      },
      network_id: 50312,
      gas: 5500000,
      gasPrice: 30000000000,
      confirmations: 2,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    maticmumbai: {
      //Polygon Amoy Testnet
      provider: function () {
        return new HDWalletProvider(
          "4b9ce9b1e6ed3e484528d61298366dbfe2e82970eb1b09f5dd6dba93a4efe8b1",
          "wss://polygon-amoy.infura.io/ws/v3/13148311eb224166807b08a7e944f71d"
        );
      },
      network_id: 80002,
      gas: 5500000,
      gasPrice: 30000000000, // Set gas price if needed
      // gasLimit: 5500000, // Set gas Limit if needed
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      networkCheckTimeout: 1000000, //  This is the timeout config. set it to 1000 seconds
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(
          "4b9ce9b1e6ed3e484528d61298366dbfe2e82970eb1b09f5dd6dba93a4efe8b1",
          `wss://sepolia.infura.io/ws/v3/13148311eb224166807b08a7e944f71d`
        ),
      network_id: 5,
      gas: 5500000,
      gasPrice: 30000000000, // Set gas price if needed
      confirmations: 2, // # of confs to wait between deployments. (default: 0)
      networkCheckTimeout: 1000000, //  This is the timeout config. set it to 1000 seconds
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets )
    }
  },
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis",
  compilers: {
    solc: {
      version: "0.8.14",
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000
        }
      }
    }
  }
};
