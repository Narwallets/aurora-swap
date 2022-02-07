const { ethers, network } = require("hardhat");
const deploySettings = require("../deploySettings.json");

async function main() {

  const TokenContract = await ethers.getContractFactory("MockERC20");

  const testToken1 = await TokenContract.deploy("stNearTest", "STNEARTEST");

  await testToken1.deployed();
  console.log("Test STNEARTEST contract: ", testToken1.address);

  const testToken2 = await TokenContract.deploy("WNearTest", "WNEARTEST");

  await testToken2.deployed();
  console.log("Test WNEARTEST contract: ", testToken2.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
