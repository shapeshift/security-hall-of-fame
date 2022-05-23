import { ethers } from "hardhat";
import { TIMELOCK_DURATION } from "../test/constants";

async function main() {
  const hallOfFameDeployment = await ethers.getContractFactory(
    "ShapeshiftHallOfFame"
  );
  const hallOfFame = await hallOfFameDeployment.deploy(TIMELOCK_DURATION);

  console.info("Hall of Fame deployed to:", hallOfFame.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
