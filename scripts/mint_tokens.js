const { ethers, network } = require("hardhat");
const mintSettings = require("../mintSettings.json");
const deploySettings = require("../deploySettings.json");
const testSettings = require("../settings.json");

function toETH(value) {
  value = value.toString();
  return ethers.utils.parseEther(value);
}

async function main() {
  let swapAccount = testSettings.swapAccount

  let { mintTo } = mintSettings[network.name]
  let {wNearTokenAddress, stNearTokenAddress} = deploySettings[network.name]

  const TestTokens = await ethers.getContractFactory("MockERC20");
  const stNear = TestTokens.attach(stNearTokenAddress);

  let tx = await stNear.mint("1000000000000000000000000", swapAccount)
  console.log("Minted 1 stNear for " + mintTo + " tx ");
  console.log(tx)

  const wNear = await TestTokens.attach(wNearTokenAddress);
  let tx2 = await wNear.mint("1000000000000000000000000", swapAccount)
  console.log("Minted 1 wNear for " + mintTo + " tx ");
  console.log(tx2)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
