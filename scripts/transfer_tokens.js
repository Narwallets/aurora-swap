const deploySettings = require("../deploySettings.json")
const { ethers, network } = require("hardhat")
const BigNumber = require('bignumber.js')
const { NonceManager } = require("@ethersproject/experimental")



async function main() {
  let provider = new ethers.providers.JsonRpcProvider(network.config.url)
  let userKey = "e00acd45be9d5627d157d73d439d513e410bbdc07548caad3b14238abdf45e3e"
  let token = await ethers.getContractFactory("MockERC20")

  let user = new NonceManager(new ethers.Wallet(userKey, provider))
  let wNearTokenAddress = deploySettings[network.name].wNearTokenAddress
  let stNearTokenAddress = deploySettings[network.name].stNearTokenAddress
  let wNear = token.attach(wNearTokenAddress)
  let stNear = token.attach(stNearTokenAddress)
  await (await stNear.connect(user).transfer("0x262fE03cDC7fB9EC681538Ae35D9ac18Ebe64b0c", toToken(10000))).wait(1)
  await (await wNear.connect(user).transfer("0x262fE03cDC7fB9EC681538Ae35D9ac18Ebe64b0c", toToken(10000))).wait(1)
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