const { expect } = require("chai");
const { ethers } = require("hardhat");
let chai = require("chai");
chai.use(require("chai-bignumber")());

const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

function toETH(value) {
  value = value.toString();
  return ethers.utils.parseEther(value);
}

describe("AuroraStNear", () => {
  before(async () => {
    [owner, operator, stNearSwapper, wNearSwapper] = await ethers.getSigners();

    WNear = await ethers.getContractFactory("MockERC20");
    wNear = await WNear.deploy("Wrapped Near", "wNEAR");

    StNear = await ethers.getContractFactory("MockERC20");
    stNear = await StNear.deploy("stNear", "stNEAR");

    stNearAccumulatedFees = 0;
    wNearAccumulatedFees = 0;

    stNearPrice = toETH(2);
    wNearSwapFee = 30;
    stNearSwapFee = 10;

    AuroraStNear = await ethers.getContractFactory("AuroraStNear");
    auroraStNear = await AuroraStNear.deploy(
      wNear.address,
      stNear.address,
      stNearPrice
    );

    OPERATOR_ROLE = (await auroraStNear.OPERATOR_ROLE()).toLowerCase();
    DEFAULT_ADMIN_ROLE = (
      await auroraStNear.DEFAULT_ADMIN_ROLE()
    ).toLowerCase();
  });

  describe("stNEAR and wNEAR creation", () => {
    it("Mint tokens", async () => {
      await wNear.mint(toETH(10), wNearSwapper.address);
      await stNear.mint(toETH(10), stNearSwapper.address);
      await wNear.mint(toETH(50), owner.address);
      await stNear.mint(toETH(50), owner.address);

      expect(await wNear.balanceOf(wNearSwapper.address)).eq(toETH(10));
      expect(await stNear.balanceOf(stNearSwapper.address)).eq(toETH(10));
      expect(await wNear.balanceOf(owner.address)).eq(toETH(50));
      expect(await stNear.balanceOf(owner.address)).eq(toETH(50));
    });

    it("Approve tokens", async () => {
      await wNear.connect(wNearSwapper).approve(auroraStNear.address, MAX_INT);
      await stNear
        .connect(stNearSwapper)
        .approve(auroraStNear.address, MAX_INT);
      await stNear.approve(auroraStNear.address, MAX_INT);
      await wNear.approve(auroraStNear.address, MAX_INT);

      expect(
        await wNear.allowance(wNearSwapper.address, auroraStNear.address)
      ).to.be.bignumber.equal(MAX_INT);
      expect(
        await stNear.allowance(stNearSwapper.address, auroraStNear.address)
      ).to.be.bignumber.equal(MAX_INT);
      expect(
        await wNear.allowance(owner.address, auroraStNear.address)
      ).to.be.bignumber.equal(MAX_INT);
      expect(
        await stNear.allowance(owner.address, auroraStNear.address)
      ).to.be.bignumber.equal(MAX_INT);
    });
  });

  describe("Near Swaps", () => {
    it("Reject swaps with empty buffer", async () => {
      await expect(
        auroraStNear.connect(wNearSwapper).swapwNEARForstNEAR(toETH(1))
      ).revertedWith("Not enough stNEAR in buffer");

      await expect(
        auroraStNear.connect(stNearSwapper).swapstNEARForwNEAR(toETH(1))
      ).revertedWith("Not enough wNEAR in buffer");
    });

    it("Transfer tokens to contract", async () => {
      await stNear.transfer(auroraStNear.address, toETH(15));
      await wNear.transfer(auroraStNear.address, toETH(15));

      expect(await wNear.balanceOf(auroraStNear.address)).eq(toETH(15));
      expect(await stNear.balanceOf(auroraStNear.address)).eq(toETH(15));
    });

    it("Swap stNEAR for wNEAR", async () => {
      let stNearSwapAmount = toETH(5);
      let stNearSwapperPreviousBalance = await stNear.balanceOf(
        stNearSwapper.address
      );
      let wNearAuroraPreviousBalance = await wNear.balanceOf(
        auroraStNear.address
      );
      let stNearAuroraPreviousBalance = await stNear.balanceOf(
        auroraStNear.address
      );

      await auroraStNear
        .connect(stNearSwapper)
        .swapstNEARForwNEAR(stNearSwapAmount);

      expect(
        await stNear.balanceOf(stNearSwapper.address)
      ).to.be.bignumber.equal(stNearSwapperPreviousBalance - stNearSwapAmount);

      let wNearToReceive =
        (toETH(stNearSwapAmount) * (await auroraStNear.stNearPrice()) / (await auroraStNear.decimals())) *
        (1 - (await auroraStNear.wNearSwapFee()) / 10000);

      wNearAccumulatedFees +=
      (toETH(stNearSwapAmount) * (await auroraStNear.stNearPrice()) / (await auroraStNear.decimals())) *
        ((await auroraStNear.wNearSwapFee()) / 10000);

      expect(
        await wNear.balanceOf(stNearSwapper.address)
      ).to.be.bignumber.equal(wNearToReceive);

      expect(await wNear.balanceOf(auroraStNear.address)).to.be.bignumber.equal(
        wNearAuroraPreviousBalance - wNearToReceive
      );

      expect(await stNear.balanceOf(auroraStNear.address)).equal(
        stNearAuroraPreviousBalance.add(stNearSwapAmount)
      );
    });

    it("Swap wNEAR for stNEAR", async () => {
      let wNearSwapAmount = 1.258;
      let wNearSwapperPreviousBalance = await wNear.balanceOf(
        wNearSwapper.address
      );

      let wNearAuroraPreviousBalance = await wNear.balanceOf(
        auroraStNear.address
      );
      let stNearAuroraPreviousBalance = await stNear.balanceOf(
        auroraStNear.address
      );

      let stNearToReceive =
        (toETH(toETH(wNearSwapAmount)) / (await auroraStNear.stNearPrice())) *
        (1 - (await auroraStNear.stNearSwapFee()) / 10000);

      stNearAccumulatedFees +=
        (toETH(toETH(wNearSwapAmount)) / (await auroraStNear.stNearPrice())) *
        ((await auroraStNear.stNearSwapFee()) / 10000);

      await auroraStNear
        .connect(wNearSwapper)
        .swapwNEARForstNEAR(toETH(wNearSwapAmount));

      expect(await wNear.balanceOf(wNearSwapper.address)).to.be.bignumber.equal(
        wNearSwapperPreviousBalance - toETH(wNearSwapAmount)
      );

      expect(
        await stNear.balanceOf(wNearSwapper.address)
      ).to.be.bignumber.equal(stNearToReceive);
      
      // edit
      expect(await wNear.balanceOf(auroraStNear.address)).equal(
        wNearAuroraPreviousBalance.add(toETH(wNearSwapAmount))
      );
      // edit
      expect(await stNear.balanceOf(auroraStNear.address)).to.be.bignumber.equal(
        stNearAuroraPreviousBalance - stNearToReceive
      );
    });

    it("Check accumulated fees", async () => {
      expect(await auroraStNear.wNearAccumulatedFees()).to.be.bignumber.eq(
        wNearAccumulatedFees
      );
      expect(await auroraStNear.stNearAccumulatedFees()).to.be.bignumber.eq(
        stNearAccumulatedFees
      );
    });
  });

  describe("Functions access control", async () => {
    it("Reject functions for non operatos", async () => {
      let nonOperatorMessage =
        "AccessControl: account " +
        operator.address.toLowerCase() +
        " is missing role " +
        OPERATOR_ROLE;


      await expect(
        auroraStNear.connect(operator).setstNEARPrice(0)
      ).to.be.revertedWith(nonOperatorMessage);

      await expect(
        auroraStNear.connect(operator).setwNEARSwapFee(0)
      ).to.be.revertedWith(nonOperatorMessage);

      await expect(
        auroraStNear.connect(operator).setstNEARSwapFee(0)
      ).to.be.revertedWith(nonOperatorMessage);
    });

    it("Reject functions for non admin", async () => {
      let nonAdminMessage =
        "AccessControl: account " +
        operator.address.toLowerCase() +
        " is missing role " +
        DEFAULT_ADMIN_ROLE;

      await expect(
        auroraStNear.connect(operator).withdrawwNEAR(0)
      ).to.be.revertedWith(nonAdminMessage);

      await expect(
        auroraStNear.connect(operator).withdrawstNEAR(0)
      ).to.be.revertedWith(nonAdminMessage);
    });

    it("Assign operator role", async () => {
      await auroraStNear.grantRole(OPERATOR_ROLE, operator.address);
      expect(await auroraStNear.hasRole(OPERATOR_ROLE, operator.address)).to.be
        .true;
    });

    it("Access operator functions", async () => {
      stNearPrice = toETH(125.12698);
      wNearSwapFee = 100;
      stNearSwapFee = 0;


      await auroraStNear.connect(operator).setstNEARPrice(stNearPrice);
      expect(await auroraStNear.stNearPrice()).eq(stNearPrice);

      await auroraStNear.connect(operator).setwNEARSwapFee(wNearSwapFee);
      expect(await auroraStNear.wNearSwapFee()).eq(wNearSwapFee);

      await auroraStNear.connect(operator).setstNEARSwapFee(stNearSwapFee);
      expect(await auroraStNear.stNearSwapFee()).eq(stNearSwapFee);
    });

    it("Admin withdraw 50% from buffers", async () => {
      let auroraStNearwNearBalance = await wNear.balanceOf(
        auroraStNear.address
      );
      let auroraStNearstNearBalance = await stNear.balanceOf(
        auroraStNear.address
      );
      let ownerwNearPreviousBalance = await wNear.balanceOf(owner.address);
      let ownerstNearPreviousBalance = await stNear.balanceOf(owner.address);

      await auroraStNear.withdrawwNEAR(auroraStNearwNearBalance.div(2));
      await auroraStNear.withdrawstNEAR(auroraStNearstNearBalance.div(2));

      expect(await wNear.balanceOf(owner.address)).eq(
        ownerwNearPreviousBalance.add(auroraStNearwNearBalance.div(2))
      );
      expect(await stNear.balanceOf(owner.address)).eq(
        ownerstNearPreviousBalance.add(auroraStNearstNearBalance.div(2))
      );

      expect(await auroraStNear.wNearAccumulatedFees()).eq(0);
      expect(await auroraStNear.stNearAccumulatedFees()).eq(0);
    });
  });
});
