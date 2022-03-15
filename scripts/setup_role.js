
const { ethers, network } = require("hardhat");
const settings = require("../settings.json");


async function main() {
  let swapAccount = settings[network.name].swapAccount
  const AuroraStNear = await ethers.getContractFactory("AuroraStNear");
  const swap = AuroraStNear.attach(swapAccount);
  let adminAcc = "0x37a86c3Ec281A70Da4d438e2D744137850Ff8E7b"
  let previousAdminAcc = "0x999c1cc4E64Ab626cbe43a53B8ABF9AfC1f08370"
  let operatorRole = await swap.OPERATOR_ROLE()

  try{
    // operator role
    console.log("granting operator role to: " + adminAcc)
    let tx1 = await swap.grantRole(operatorRole, adminAcc)
    console.log(tx1)
    // admin role
    console.log("granting admin role to: " + adminAcc)
    let tx2 = await swap.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", adminAcc)
    console.log(tx2)
    // revoke provious operator
    console.log("revoking operator role from: " + previousAdminAcc)
    let t3 = await swap.revokeRole(operatorRole, previousAdminAcc)
    console.log(t3)
    // revoke provious admin
    console.log("revoking admin role from: " + previousAdminAcc)
    let t4 = await swap.revokeRole("0x0000000000000000000000000000000000000000000000000000000000000000", previousAdminAcc)
    console.log(t4)

  }catch(e){
    console.error(e)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
