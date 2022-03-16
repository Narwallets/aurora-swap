task("manage", "Manage swap contract settings")
  .addOptionalParam("setStnearFee", "<true|false>")
  .addOptionalParam("setWnearFee", "<true|false>")
  .addOptionalParam("setPrice", "<true|false>")
  .addOptionalParam("getState", "<true|false>")
  .setAction(async (taskArgs) => {
    const { ethers, network, task } = require("hardhat");
    const settings = require("../settings.json");

    const swapAccount = settings[network.name].swapAccount
    const AuroraStNear = await ethers.getContractFactory("AuroraStNear");

    const swap = AuroraStNear.attach(swapAccount);
    let { setStnearFee, setWnearFee, setPrice, getState } = taskArgs
    
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
        console.log("transaction sent:")
        console.log(tx)
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
        console.log("transaction sent:")
        console.log(tx)

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
        console.log("transaction sent:")
        console.log(tx)

      } catch (e) {
        console.error("error setting stNear price")
        console.error(e)
      }
    }
    if (getState === "true") {
      try {
        console.log("requesting data...")

        let tx1 = await swap.stNearPrice()
        console.log("stNear price: " + ethers.utils.formatUnits(tx1, 24))
        let tx5 = await swap.stNearSwapFee()
        console.log("stNear fee: " + tx5)
        let tx4 = await swap.wNearSwapFee()
        console.log("wNear fee: " + tx4)
        let tx3 = await swap.stNearAccumulatedFees()
        console.log("stNear accumulated fees: " + tx3)
        let tx2 = await swap.wNearAccumulatedFees()
        console.log("wNear accumulated fees: " + tx2)
      } catch (e) {
        console.error("error requesting contract data ")
        console.error(e)
      }
    }

  });