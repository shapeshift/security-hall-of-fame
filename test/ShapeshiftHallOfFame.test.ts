import { expect } from "chai";
import { ethers } from "hardhat";
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
    nftContract = await nftContractDeployment.deploy();
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

      await nftContract.setTokenURI(0, constants.TEST_URI_V2);

      // Confirm updated URI
      await expect(await nftContract.tokenURI(0)).eq(
        "ipfs://" + constants.TEST_URI_V2
      );
    });
  });
});
