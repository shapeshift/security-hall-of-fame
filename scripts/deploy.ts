import { ethers } from "hardhat";

async function main() {
  const hallOfFameDeployment = await ethers.getContractFactory(
    "ShapeshiftHallOfFame"
  );
  const hallOfFame = await hallOfFameDeployment.deploy();

  console.info("Hall of Fame deployed to:", hallOfFame.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
