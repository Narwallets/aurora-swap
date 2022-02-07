const { assert, expect } = require('chai');
const chai = require('chai');
const BigNumber = require('bignumber.js');
const { NonceManager } = require("@ethersproject/experimental")
const { ethers, network } = require("hardhat");
const deploySettings = require("../deploySettings.json");
const testSettings = require("../liveTestSettings.json");
const fs = require("fs");
const path = require("path");

const MAX_INT = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

function toToken(value) {
  value = new BigNumber(value)
  return value.multipliedBy("1000000000000000000000000").toFixed()
}

describe("Aurora testnet test", async () => {
  before(async () => {
    provider = new ethers.providers.JsonRpcProvider(network.config.url)
    wNearTokenAddress = deploySettings[network.name].wNearTokenAddress
    stNearTokenAddress = deploySettings[network.name].stNearTokenAddress
    wNearPrice = deploySettings[network.name].wNearPrice
    stNearPrice = deploySettings[network.name].stNearPrice
    wNearSwapper = new NonceManager(ethers.Wallet.createRandom().connect(provider))
    stNearSwapper = new NonceManager(ethers.Wallet.createRandom().connect(provider))
    operator = new NonceManager(ethers.Wallet.createRandom().connect(provider))
    ownerKey = fs.readFileSync(path.join(path.dirname(__dirname), ".secret")).toString()
    owner = new NonceManager(new ethers.Wallet(ownerKey, provider))
    swapAccount = testSettings.swapAccount
    console.log("wNearSwapper address: " + wNearSwapper.signer.address)
    console.log("stNearSwapper address: " + stNearSwapper.signer.address)
    console.log("operator address: " + operator.signer.address)
    console.log("owner address: " + owner.signer.address)
    token = await ethers.getContractFactory("MockERC20")
    wNear = token.attach(wNearTokenAddress)
    stNear = token.attach(stNearTokenAddress)

    stNearAccumulatedFees = new BigNumber(0);
    wNearAccumulatedFees = new BigNumber(0);

    SwapContract = await ethers.getContractFactory("AuroraStNear")
    swapContract = SwapContract.attach(swapAccount)
    console.log("swapContract address: " + swapContract.address)

    OPERATOR_ROLE = (await swapContract.connect(owner).OPERATOR_ROLE()).toLowerCase()
    DEFAULT_ADMIN_ROLE = (
      await swapContract.connect(owner).DEFAULT_ADMIN_ROLE()
    ).toLowerCase()

    // // empty swap contract balance
    // let swapContractwNearBalance = new BigNumber((await wNear.balanceOf(
    //   swapContract.address
    // )).toString())
    // let swapContractstNearBalance = new BigNumber((await stNear.balanceOf(
    //   swapContract.address
    // )).toString())
    //   console.log(swapContractwNearBalance)
    //   console.log(swapContractstNearBalance)

    // await (await swapContract.connect(owner).withdrawwNEAR(swapContractwNearBalance.toFixed())).wait(1)
    // await (await swapContract.connect(owner).withdrawstNEAR(swapContractstNearBalance.toFixed())).wait(1)
    // let swapContractwNearBalance2 = new BigNumber((await wNear.balanceOf(
    //   swapContract.address
    // )).toString())
    // let swapContractstNearBalance2 = new BigNumber((await stNear.balanceOf(
    //   swapContract.address
    // )).toString())
    //   console.log(swapContractwNearBalance2)
    //   console.log(swapContractstNearBalance2)
    // // get initial owner balance
    // ownerwNearInitBal = new BigNumber((await wNear.balanceOf(owner.signer.address)).toString())
    // ownerstNearInitBal = new BigNumber((await stNear.balanceOf(owner.signer.address)).toString())
    // console.log(ownerwNearInitBal)
    // console.log(ownerstNearInitBal)

    // console.log("stNear decimals:")
    // console.log(await stNear.decimals())
    // console.log("wNear decimals:")
    // console.log(await wNear.decimals())
    // await (await wNear.connect(owner).mint(toToken(10), wNearSwapper.signer.address)).wait(1)
  })
  describe("stNEAR and wNEAR creation", async () => {
    it("Mint tokens", async () => {
    })
  })
  // describe("stNEAR and wNEAR creation", async () => {
  //   it("Mint tokens", async () => {
  //     assert(new BigNumber((await wNear.balanceOf(wNearSwapper.signer.address)).toString()).isEqualTo("0"))
  //     assert(new BigNumber((await wNear.balanceOf(stNearSwapper.signer.address)).toString()).isEqualTo("0"))
  //     assert(new BigNumber((await stNear.balanceOf(stNearSwapper.signer.address)).toString()).isEqualTo("0"))
  //     assert(new BigNumber((await stNear.balanceOf(wNearSwapper.signer.address)).toString()).isEqualTo("0"))

  //     await (await wNear.connect(owner).mint(toToken(10), wNearSwapper.signer.address)).wait(1)
  //     await (await stNear.connect(owner).mint(toToken(10), stNearSwapper.signer.address)).wait(1)
      await (await wNear.connect(owner).mint(toToken(500), owner.signer.address)).wait(1)
      await (await stNear.connect(owner).mint(toToken(500), owner.signer.address)).wait(1)

  //     assert(new BigNumber((await wNear.balanceOf(wNearSwapper.signer.address)).toString()).isEqualTo(toToken(10)))
  //     assert(new BigNumber((await stNear.balanceOf(stNearSwapper.signer.address)).toString()).isEqualTo(toToken(10)))
  //     assert(new BigNumber((await wNear.balanceOf(owner.signer.address)).toString()).isEqualTo(ownerwNearInitBal.plus(toToken(50))))
  //     assert(new BigNumber((await stNear.balanceOf(owner.signer.address)).toString()).isEqualTo(ownerstNearInitBal.plus(toToken(50))))
  //   })

  //   it("Approve tokens", async () => {
  //     await (await wNear.connect(wNearSwapper).approve(swapContract.address, MAX_INT)).wait(1)
  //     await (await stNear.connect(stNearSwapper).approve(swapContract.address, MAX_INT)).wait(1)
      // await (await stNear.connect(owner).approve(swapContract.address, MAX_INT)).wait(1)
      // await (await wNear.connect(owner).approve(swapContract.address, MAX_INT)).wait(1)

  //     assert(
  //       new BigNumber((await wNear.allowance(wNearSwapper.signer.address, swapContract.address)).toString()).isEqualTo(MAX_INT)
  //     )
  //     assert(
  //       new BigNumber((await stNear.allowance(stNearSwapper.signer.address, swapContract.address)).toString()).isEqualTo(MAX_INT)
  //     )
  //     assert(
  //       new BigNumber((await wNear.allowance(owner.signer.address, swapContract.address)).toString()).isEqualTo(MAX_INT)
  //     )
  //     assert(
  //       new BigNumber((await stNear.allowance(owner.signer.address, swapContract.address)).toString()).isEqualTo(MAX_INT)
  //     )
  //   })
  // })

  // describe("Near Swaps", async () => {
  //   it("Reject swaps with empty buffer", async () => {
  //     let err
  //     try {
  //       await swapContract.connect(wNearSwapper).swapwNEARForstNEAR(toToken(1))
  //     }
  //     catch (e) {
  //       let msg = e.message.match(/Not enough stNEAR in buffer/)
  //       if (msg.length == 1) {
  //         err = msg[0]
  //       }
  //     }
  //     expect(err).to.equal("Not enough stNEAR in buffer")
  //     try {
  //       await swapContract.connect(stNearSwapper).swapstNEARForwNEAR(toToken(1))
  //     }
  //     catch (e) {
  //       let msg = e.message.match(/Not enough wNEAR in buffer/)
  //       if (msg.length == 1) {
  //         err = msg[0]
  //       }
  //     }
  //     expect(err).to.equal("Not enough wNEAR in buffer")
  //   })

  //   it("Transfer tokens to contract", async () => {
  //     await (await stNear.connect(owner).transfer(swapContract.address, toToken(15))).wait(1)
  //     await (await wNear.connect(owner).transfer(swapContract.address, toToken(15))).wait(1)

  //     assert(new BigNumber((await wNear.balanceOf(swapContract.address)).toString()).isEqualTo(toToken(15)))
  //     assert(new BigNumber((await stNear.balanceOf(swapContract.address)).toString()).isEqualTo(toToken(15)))
  //   })

  //   it("Swap stNEAR for wNEAR", async () => {
  //     let stNearSwapAmount = 5
  //     let stNearSwapperPreviousBalance = new BigNumber((await stNear.balanceOf(
  //       stNearSwapper.signer.address)).toString())

  //     let wNearAuroraPreviousBalance = new BigNumber((await wNear.balanceOf(
  //       swapContract.address)).toString())

  //     let stNearAuroraPreviousBalance = new BigNumber((await stNear.balanceOf(
  //       swapContract.address)).toString())

  //     let stNearTowNearAmount = new BigNumber(stNearSwapAmount).dividedBy(wNearPrice)

  //     let fee = new BigNumber((await swapContract.wNearSwapFee()).toString()).multipliedBy(stNearTowNearAmount).dividedBy(10000)

  //     let wNearToReceive = stNearTowNearAmount.minus(fee)

  //     wNearAccumulatedFees = wNearAccumulatedFees.plus(fee)

  //     await (await swapContract.connect(stNearSwapper).swapstNEARForwNEAR(toToken(stNearSwapAmount))).wait(1)

  //     assert(
  //       new BigNumber((await stNear.balanceOf(stNearSwapper.signer.address)).toString()).isEqualTo(stNearSwapperPreviousBalance.minus(toToken(stNearSwapAmount)))
  //     )
  //     let stNearSwapperwNearBal = (await wNear.balanceOf(stNearSwapper.signer.address)).toString()
  //     assert(
  //       new BigNumber(stNearSwapperwNearBal).isEqualTo(toToken(wNearToReceive)),
  //       `wNearBalance: ${stNearSwapperwNearBal}, expected: ${toToken(wNearToReceive)}`
  //     )

  //     assert(new BigNumber((await wNear.balanceOf(swapContract.address)).toString()).isEqualTo(
  //       wNearAuroraPreviousBalance.minus(toToken(wNearToReceive))
  //     ))

  //     assert(new BigNumber((await stNear.balanceOf(swapContract.address)).toString()).isEqualTo(
  //       stNearAuroraPreviousBalance.plus(toToken(stNearSwapAmount))
  //     ))
  //   })


  //   it("Swap wNEAR for stNEAR", async () => {
  //     let wNearSwapAmount = 1.258
  //     let wNearSwapperPreviousBalance = new BigNumber((await wNear.balanceOf(
  //       wNearSwapper.signer.address
  //     )).toString())

  //     let wNearAuroraPreviousBalance = new BigNumber((await wNear.balanceOf(
  //       swapContract.address
  //     )).toString())

  //     let stNearAuroraPreviousBalance = new BigNumber((await stNear.balanceOf(
  //       swapContract.address
  //     )).toString())

  //     let wNearTostNearAmount = new BigNumber(wNearSwapAmount).dividedBy(stNearPrice)

  //     let fee = new BigNumber((await swapContract.stNearSwapFee()).toString()).multipliedBy(wNearTostNearAmount).dividedBy(10000)

  //     let stNearToReceive = wNearTostNearAmount.minus(fee)

  //     stNearAccumulatedFees = stNearAccumulatedFees.plus(fee)

  //     await (await swapContract
  //       .connect(wNearSwapper)
  //       .swapwNEARForstNEAR(toToken(wNearSwapAmount))).wait(1)

  //     assert(new BigNumber((await wNear.balanceOf(wNearSwapper.signer.address)).toString()).isEqualTo(
  //       wNearSwapperPreviousBalance.minus(toToken(wNearSwapAmount))))

  //       let wNearSwapperstNearBal = (await stNear.balanceOf(wNearSwapper.signer.address)).toString()
  //     assert(
  //       new BigNumber(wNearSwapperstNearBal).isEqualTo(toToken(stNearToReceive)),
  //       `wNearBalance: ${wNearSwapperstNearBal}, expected: ${toToken(stNearToReceive)}`
  //     )

  //     assert(new BigNumber((await wNear.balanceOf(swapContract.address)).toString()).isEqualTo(wNearAuroraPreviousBalance.plus(toToken(wNearSwapAmount))))

  //     assert(new BigNumber((await stNear.balanceOf(swapContract.address)).toString()).isEqualTo(
  //       stNearAuroraPreviousBalance.minus(toToken(stNearToReceive))
  //     ))
  //   })

  //   it("Check accumulated fees", async () => {
  //     assert(new BigNumber((await swapContract.wNearAccumulatedFees()).toString()).isEqualTo(toToken(wNearAccumulatedFees)))
  //     assert(new BigNumber((await swapContract.stNearAccumulatedFees()).toString()).isEqualTo(toToken(stNearAccumulatedFees)))
  //   })
  // })

  // describe("Functions access control", async () => {
  //   it("Reject functions for non operatos", async () => {
  //     let nonOperatorMessage =
  //       "AccessControl: account " +
  //       operator.address.toLowerCase() +
  //       " is missing role " +
  //       OPERATOR_ROLE;

  //     await expect(
  //       swapContract.connect(operator).setwNEARPrice(0)
  //     ).to.be.revertedWith(nonOperatorMessage);

  //     await expect(
  //       swapContract.connect(operator).setstNEARPrice(0)
  //     ).to.be.revertedWith(nonOperatorMessage);

  //     await expect(
  //       swapContract.connect(operator).setwNEARSwapFee(0)
  //     ).to.be.revertedWith(nonOperatorMessage);

  //     await expect(
  //       swapContract.connect(operator).setstNEARSwapFee(0)
  //     ).to.be.revertedWith(nonOperatorMessage);
  //   });

  //   it("Reject functions for non admin", async () => {
  //     let nonAdminMessage =
  //       "AccessControl: account " +
  //       operator.address.toLowerCase() +
  //       " is missing role " +
  //       DEFAULT_ADMIN_ROLE;

  //     await expect(
  //       swapContract.connect(operator).withdrawwNEAR(0)
  //     ).to.be.revertedWith(nonAdminMessage);

  //     await expect(
  //       swapContract.connect(operator).withdrawstNEAR(0)
  //     ).to.be.revertedWith(nonAdminMessage);
  //   });

  //   it("Assign operator role", async () => {
  //     await swapContract.connect(owner).grantRole(OPERATOR_ROLE, operator.address);
  //     expect(await swapContract.connect(owner).hasRole(OPERATOR_ROLE, operator.address)).to.be
  //       .true;
  //   });

  //   it("Access operator functions", async () => {
  //     wNearPrice = toToken(1.258);
  //     stNearPrice = toToken(125.12698);
  //     wNearSwapFee = 100;
  //     stNearSwapFee = 0;

  //     await swapContract.connect(operator).setwNEARPrice(wNearPrice);
  //     expect(await swapContract.wNearPrice()).eq(wNearPrice);

  //     await swapContract.connect(operator).setstNEARPrice(stNearPrice);
  //     expect(await swapContract.stNearPrice()).eq(stNearPrice);

  //     await swapContract.connect(operator).setwNEARSwapFee(wNearSwapFee);
  //     expect(await swapContract.wNearSwapFee()).eq(wNearSwapFee);

  //     await swapContract.connect(operator).setstNEARSwapFee(stNearSwapFee);
  //     expect(await swapContract.stNearSwapFee()).eq(stNearSwapFee);
  //   });

  //   it("Admin withdraw 50% from buffers", async () => {
  //     let swapContractwNearBalance = await wNear.balanceOf(
  //       swapContract.address
  //     );
  //     let swapContractstNearBalance = await stNear.balanceOf(
  //       swapContract.address
  //     );
  //     let ownerwNearPreviousBalance = await wNear.balanceOf(owner.address);
  //     let ownerstNearPreviousBalance = await stNear.balanceOf(owner.address);

  //     await swapContract.connect(owner).withdrawwNEAR(swapContractwNearBalance.div(2));
  //     await swapContract.connect(owner).withdrawstNEAR(swapContractstNearBalance.div(2));

  //     expect(await wNear.balanceOf(owner.address)).eq(
  //       ownerwNearPreviousBalance.add(swapContractwNearBalance.div(2))
  //     );
  //     expect(await stNear.balanceOf(owner.address)).eq(
  //       ownerstNearPreviousBalance.add(swapContractstNearBalance.div(2))
  //     );

  //     expect(await swapContract.wNearAccumulatedFees()).eq(0);
  //     expect(await swapContract.stNearAccumulatedFees()).eq(0);
  //   });
  // });
})