require("@nomicfoundation/hardhat-toolbox");
require('hardhat-contract-sizer');
require("hardhat-abi-exporter");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",
  defaultNetwork: "testnet",
  settings: {
    optimizer: {
      enabled: true,
      runs: 30,
      details: { yul: false }
    },
  },
  networks: {
    hardhat: {
    },
    mumbai: {
      url: process.env.MUMBAI,
      accounts: [process.env.MNENOMIC],

    },
  },
  abiExporter: {
    path: "./ABI",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: false,
  },
  etherscan: {           
    apiKey: process.env.POLYGONSCAN,
  }

};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
