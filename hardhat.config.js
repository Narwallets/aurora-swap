require("@nomiclabs/hardhat-waffle");

const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    aurora: {
      url: "https://mainnet.aurora.dev",
      accounts: [privateKey]
    },
    aurora_testnet: {
      url: "https://testnet.aurora.dev",
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
