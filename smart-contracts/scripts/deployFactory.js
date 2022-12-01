const hre = require("hardhat");
const fs = require("fs");
async function main() {
  

  const TaalmFactory = await hre.ethers.getContractFactory("TaalmFactory");
  const taalmFactory = await TaalmFactory.deploy();

  await taalmFactory.deployed();

  console.log("taalmFactory deployed to:", taalmFactory.address);



  fs.writeFileSync(
    "..utils/contractAddressFactory.js", `
    export const taalmFactoryAddress = "${taalmFactory.address}";
    `
  )

}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});