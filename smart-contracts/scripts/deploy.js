const hre = require("hardhat");
const fs = require("fs");
async function main() {
  const TaalmQuests = await hre.ethers.getContractFactory("TaalmQuests");
  const taalmQuests = await TaalmQuests.deploy();

  await taalmQuests.deployed();

  console.log("taalmQuests deployed to:", taalmQuests.address);

  const TaalmMembership = await hre.ethers.getContractFactory("TaalmMembership");
  const taalmMembership = await TaalmMembership.deploy();

  await taalmMembership.deployed();

  console.log("taalmMembership deployed to:", taalmMembership.address);

  const TaalmFactory = await hre.ethers.getContractFactory("TaalmFactory");
  const taalmFactory = await TaalmFactory.deploy();

  await taalmFactory.deployed();

  console.log("taalmFactory deployed to:", taalmFactory.address);



  fs.writeFileSync(
    "./contractAddress.js", `
    export const taalmQuestsAddress = "${taalmQuests.address}";
    export const taalmMembershipAddress = "${taalmMembership.address}";
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