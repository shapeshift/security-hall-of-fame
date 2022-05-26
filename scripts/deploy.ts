import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { TIMELOCK_DURATION } from "../test/constants"
require("dotenv").config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await ethers.getSigners() as SignerWithAddress[];
  const { deploy } = hre.deployments;

  await deploy("ShapeshiftHallOfFame", {
    from: accounts[0].address,
    args: [TIMELOCK_DURATION],
    log: true
  });
};
export default func;

func.tags = ["ShapeshiftHallOfFame"];
