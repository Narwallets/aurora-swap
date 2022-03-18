const ether = require("@openzeppelin/test-helpers/src/ether");

task("manage", "Manage swap contract settings")
  .addOptionalParam("setStnearFee", "<true|false>")
  .addOptionalParam("setWnearFee", "<true|false>")
  .addOptionalParam("setPrice", "<true|false>")
  .addOptionalParam("getState", "<true|false>")
  .addOptionalParam("withdrawWnear", "<amount>")
  .addOptionalParam("withdrawStnear", "<amount>")
  .setAction(async (taskArgs) => {
    const { ethers, network, task, provider } = require("hardhat");
    const settings = require("../settings.json");

    if (!settings[network.name]) {
      throw "--network arg is missing or invalid"
    }
    const swapAccount = settings[network.name].swapAccount
    console.log("Contract",swapAccount)
    const AuroraStNear = await ethers.getContractFactory("AuroraStNear");
    const Erc20Factory = await ethers.getContractFactory("MockERC20");

    const swap = AuroraStNear.attach(swapAccount);
    const stNEAR = Erc20Factory.attach(settings[network.name].stNearAddress)
    const wNEAR = Erc20Factory.attach(settings[network.name].wNearAddress)
    let { 
      setStnearFee, 
      setWnearFee,
      setPrice, 
      getState, 
      withdrawWnear,
      withdrawStnear
     } = taskArgs
    
    if (setStnearFee != "true" && setStnearFee != "false" && setStnearFee != undefined){
      throw "error in command argument"
    }
    if (setWnearFee != "true" && setWnearFee != "false" && setWnearFee != undefined){
      throw "error in command argument"
    }
    if (setPrice != "true" && setPrice != "false" && setPrice != undefined){
      throw "error in command argument"
    }
    if (getState != "true" && getState != "false" && getState != undefined){
      throw "error in command argument"
    }

    if (setStnearFee === "true") {
      try {
        const stNearFee = settings[network.name].stNearFee
        console.log("setting stNear fee from settings.json to " + stNearFee)
        let tx = await swap.setstNEARSwapFee(stNearFee)
        console.log("transaction sent:",tx.hash)
      } catch (e) {
        console.error("error setting stNear fee")
        console.error(e)
      }
    }
    if (setWnearFee === "true") {
      try {
        const wNearFee = settings[network.name].wNearFee
        console.log("setting wNear fee from settings.json to " + wNearFee)
        let tx = await swap.setwNEARSwapFee(wNearFee)
        console.log("transaction sent:",tx.hash)

      } catch (e) {
        console.error("error setting wNear fee")
        console.error(e)
      }
    }
    if (setPrice === "true") {
      try {
        const stNearPrice = settings[network.name].stNearPrice
        console.log("setting stNear price to " + ethers.utils.formatUnits(stNearPrice, 24))
        let tx = await swap.setstNEARPrice(stNearPrice)
        console.log("transaction sent:",tx.hash)

      } catch (e) {
        console.error("error setting stNear price")
        console.error(e)
      }
    }

    if (withdrawWnear !== undefined) {
      try {
        console.log(`withdraw ${withdrawWnear} wNear from contract`)
        let tx = await swap.withdrawwNEAR(ethers.utils.parseUnits(withdrawWnear,24))
        console.log("transaction sent:",tx.hash)
      } catch (e) {
        console.error("error en withdraw-wnear")
        console.error(e)
      }
    }
        
    if (withdrawStnear !== undefined) {
      try {
        console.log(`withdraw ${withdrawStnear} stNear from contract`)
        let tx = await swap.withdrawstNEAR(ethers.utils.parseUnits(withdrawStnear,24))
        console.log("transaction sent:",tx.hash)
      } catch (e) {
        console.error("error en withdrawstNEAR")
        console.error(e)
      }
    }

    if (getState === "true") {
      try {

        console.log("requesting data...")
        console.log("stNear in contract: " + ethers.utils.formatUnits(await stNEAR.balanceOf(settings[network.name].swapAccount), 24))
        console.log("wNear in contract: " + ethers.utils.formatUnits(await wNEAR.balanceOf(settings[network.name].swapAccount), 24))

        let tx1 = await swap.stNearPrice()
        console.log("stNear price: " + ethers.utils.formatUnits(tx1, 24))
        let tx5 = await swap.stNearSwapFee()
        console.log("stNear fee: " + tx5)
        let tx4 = await swap.wNearSwapFee()
        console.log("wNear fee: " + tx4)
        let tx3 = await swap.stNearAccumulatedFees()
        console.log("stNear accumulated fees: " + ethers.utils.formatUnits(tx3, 24))
        let tx2 = await swap.wNearAccumulatedFees()
        console.log("wNear accumulated fees: " + ethers.utils.formatUnits(tx2, 24))

        const adminAccount = settings[network.name].adminAccount
        const adminAccountBal = await ethers.provider.getBalance(adminAccount)
        console.log("aurora adminAccount",adminAccount,"ETH balance:", ethers.utils.formatUnits(adminAccountBal, 18))
        console.log("aurora adminAccount wNEAR balance (direct/withdraw first step): " + ethers.utils.formatUnits(await wNEAR.balanceOf(adminAccount), 24))
        console.log("aurora adminAccount stNEAR balance (direct/withdraw last step): " + ethers.utils.formatUnits(await stNEAR.balanceOf(adminAccount), 24))
        const refillAccount = settings[network.name].refillAccount
        console.log("aurora refillAccount",refillAccount,"ETH balance: " + ethers.utils.formatUnits(await ethers.provider.getBalance(refillAccount), 18))
        console.log("aurora refillAccount wNEAR balance: " + ethers.utils.formatUnits(await wNEAR.balanceOf(refillAccount), 24))
        console.log("aurora refillAccount stNEAR balance: " + ethers.utils.formatUnits(await stNEAR.balanceOf(refillAccount), 24))
        const withdrawAccount = settings[network.name].withdrawAccount
        console.log("aurora withdrawAccount",withdrawAccount,"ETH balance: " + ethers.utils.formatUnits(await ethers.provider.getBalance(withdrawAccount), 18))
        console.log("aurora withdrawAccount wNEAR balance: " + ethers.utils.formatUnits(await wNEAR.balanceOf(withdrawAccount), 24))
        console.log("aurora withdrawAccount stNEAR balance: " + ethers.utils.formatUnits(await stNEAR.balanceOf(withdrawAccount), 24))
        
      } catch (e) {
        console.error("error requesting contract data ")
        console.error(e)
      }
    }

  });