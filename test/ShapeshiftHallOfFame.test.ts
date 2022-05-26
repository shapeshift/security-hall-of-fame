import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ShapeshiftHallOfFame } from "../typechain/ShapeshiftHallOfFame";
import * as constants from "./constants";

describe("ShapeshiftHallOfFame", async function () {
  let accounts: SignerWithAddress[];
  let nftContract: ShapeshiftHallOfFame;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const nftContractDeployment = await ethers.getContractFactory(
      "ShapeshiftHallOfFame"
    );
    nftContract = await nftContractDeployment.deploy(
      constants.TIMELOCK_DURATION
    );
  });

  describe("minting", function () {
    it("Should mint the token", async function () {
      const recipient1 = accounts[0].address;

      // Zero initial balance
      await expect(await nftContract.balanceOf(recipient1)).eq(0);

      await nftContract.safeMint(recipient1, constants.TEST_URI);

      // Expect to have balance
      await expect(await nftContract.balanceOf(recipient1)).eq(1);

      // Confirm URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI
      );
    });
  });

  describe("edit & transfer", function () {
    it("Should be able to update the token URI", async function () {
      const recipient1 = accounts[0].address;

      await nftContract.safeMint(recipient1, constants.TEST_URI);

      // Confirm URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI
      );

      // Wait for the timelock to be lifted
      await network.provider.send("evm_increaseTime", [
        constants.TIMELOCK_DURATION,
      ]);

      await nftContract.setTokenURI(0, constants.TEST_URI_V2);

      // Confirm updated URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI_V2
      );
    });

    it("Should be able to transfer the token", async function () {
      const recipient1 = accounts[0].address;
      const recipient2 = accounts[1].address;

      await nftContract.safeMint(recipient1, constants.TEST_URI);

      // Confirm URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI
      );

      // Wait for the timelock to be lifted
      await network.provider.send("evm_increaseTime", [
        constants.TIMELOCK_DURATION,
      ]);

      // Zero initial balance for recipient2
      await expect(await nftContract.balanceOf(recipient2)).eq(0);

      await nftContract.approve(recipient2, 0);
      await nftContract["safeTransferFrom(address,address,uint256)"](
        recipient1,
        recipient2,
        0
      );

      // Expect recipient2 to have balance
      await expect(await nftContract.balanceOf(recipient2)).eq(1);

      // Expect recipient1 to have zero balance
      await expect(await nftContract.balanceOf(recipient1)).eq(0);
    });

    it("Should be able to change the timelock duration", async function () {
      const recipient1 = accounts[0].address;

      // Confirm the timelock duration is set to default
      await expect(await nftContract.timelockDuration()).eq(
        constants.TIMELOCK_DURATION
      );

      // Change the timelock duration
      await nftContract.setTimelockDuration(1000);

      // Confirm the timelock duration has been changed
      await expect(await nftContract.timelockDuration()).eq(1000);

      await nftContract.safeMint(recipient1, constants.TEST_URI);
      await network.provider.send("evm_increaseTime", [1000]);

      // Timelock should be lifted in accordance with the new value
      await nftContract.setTokenURI(0, constants.TEST_URI_V2);

      // Confirm updated URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI_V2
      );
    });
  });

  describe("fail states", function () {
    it("Should fail to mint if called by non-owner", async function () {
      const attacker1 = accounts[1].address;
      const nftContractAttacker1 = nftContract.connect(accounts[1] as Signer);

      await expect(
        nftContractAttacker1.safeMint(attacker1, constants.TEST_URI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to update the URI if called by non-owner", async function () {
      const recipient1 = accounts[0].address;
      await nftContract.safeMint(recipient1, constants.TEST_URI);

      // Wait for the timelock to be lifted
      await network.provider.send("evm_increaseTime", [
        constants.TIMELOCK_DURATION,
      ]);

      const nftContractAttacker1 = nftContract.connect(accounts[1] as Signer);

      await expect(
        nftContractAttacker1.setTokenURI(0, constants.TEST_URI_V2)
      ).to.be.revertedWith(
        "ShapeshiftHallOfFame: URI can only be changed by the owner"
      );
    });

    it("Should fail to update the timelock if called by non-owner", async function () {
      const nftContractAttacker1 = nftContract.connect(accounts[1] as Signer);

      await expect(
        nftContractAttacker1.setTimelockDuration(1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail to update the URI while the timelock is active", async function () {
      const recipient1 = accounts[0].address;

      await nftContract.safeMint(recipient1, constants.TEST_URI);

      await expect(
        nftContract.setTokenURI(0, constants.TEST_URI_V2)
      ).to.be.revertedWith("ShapeshiftHallOfFame: This token is timelocked");
    });

    it("Should fail to transfer the NFT while the timelock is active", async function () {
      const recipient1 = accounts[0].address;
      const recipient2 = accounts[1].address;

      await nftContract.safeMint(recipient1, constants.TEST_URI);

      await nftContract.approve(recipient2, 0);

      await expect(
        nftContract["safeTransferFrom(address,address,uint256)"](
          recipient1,
          recipient2,
          0
        )
      ).to.be.revertedWith("ShapeshiftHallOfFame: This token is timelocked");
    });
  });
});
