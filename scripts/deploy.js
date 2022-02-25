const { ethers, network } = require("hardhat");
const deploySettings = require("../deploySettings.json");
const BigNumber = require('bignumber.js');


function toToken(value) {
  value = new BigNumber(value)
  return value.multipliedBy("1000000000000000000000000").toFixed()
}

async function main() {
  let { wNearTokenAddress, stNearTokenAddress, stNearPrice } = deploySettings[network.name]

  const AuroraStNear = await ethers.getContractFactory("AuroraStNear");
  const auroraStNear = await AuroraStNear.deploy(wNearTokenAddress, stNearTokenAddress, toToken(stNearPrice));
  await auroraStNear.deployed();

  console.log("AuroraStNear contract: ", auroraStNear.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
