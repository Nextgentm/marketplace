require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },

    goerli: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVATE_KEY, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`),
      network_id: 5,
      // gas: 5500000,
      // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
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
      optimizer: {
        enabled: "true",
        runs: 200
      }
    }
  }
};
