const { ethers, network } = require("hardhat");
const deploySettings = require("../deploySettings.json");

function toETH(value) {
  value = value.toString();
  return ethers.utils.parseEther(value);
}

async function main() {
  let { wNearTokenAddress, stNearTokenAddress, wNearPrice, stNearPrice } = deploySettings[network.name]

  const AuroraStNear = await ethers.getContractFactory("AuroraStNear");
  const auroraStNear = await AuroraStNear.deploy(wNearTokenAddress, stNearTokenAddress, toETH(wNearPrice), toETH(stNearPrice));

  await auroraStNear.deployed();

  console.log("AuroraStNear contract: ", auroraStNear.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
