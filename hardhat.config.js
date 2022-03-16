require("@nomiclabs/hardhat-waffle");
require("./scripts/management");

const fs = require('fs');
const os = require('os');
const path = require('path');
const privateKey = fs.readFileSync(path.join(os.homedir(),".near-credentials","testnet","AURORA_SWAP_ADMIN.json")).toString().trim();
const privateKeyMainnet = fs.readFileSync(path.join(os.homedir(),".near-credentials","mainnet","AURORA_SWAP_ADMIN.json")).toString().trim();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    aurora: {
      url: "https://mainnet.aurora.dev",
      accounts: [privateKeyMainnet]
    },
    aurora_testnet: {
      url: "https://testnet.aurora.dev",
      accounts: [privateKey]
    },
    goerli_network: {
      url: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: [privateKey]
    },
    aurora_testnet_console:{
      url: "https://testnet.aurora.dev",
      accounts: ["300a9c014426187f28b2d8b92c16c8c36243eff1235549fb040002ea4874c108"]
    }
  },
  solidity: "0.8.4",
  mocha: {
    timeout: 100000
  }
};
