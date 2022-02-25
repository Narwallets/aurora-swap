const { ethers, network } = require("hardhat");
const testSettings = require("../settings.json");
const BigNumber = require('bignumber.js');
const deploySettings = require("../deploySettings.json");


async function main(){
  let { wNearTokenAddress, stNearTokenAddress } = deploySettings[network.name]
  const swapAccount = testSettings.swapAccount
  const Token = await ethers.getContractFactory("MockERC20");
  const token = Token.attach(stNearTokenAddress);

  await token.approve(swapAccount, toToken(100))

  const AuroraStNear = await ethers.getContractFactory("AuroraStNear");
  const swap = AuroraStNear.attach(swapAccount);

  let tx = await swap.swapwNEARForstNEAR(toToken(100))
  console.log(tx)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function toToken(value) {
  value = new BigNumber(value)
  return value.multipliedBy("1000000000000000000000000").toFixed()
}