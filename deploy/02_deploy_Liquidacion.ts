import dotenv from "dotenv";
dotenv.config();

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// Asegúrate de que la dirección de FlewPayToken y la wallet de la empresa estén en el archivo .env
const deployFlewPayLiquidation: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  // Usar la cuenta deployer configurada en hardhat.config
  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    throw new Error("No se encontró la cuenta deployer configurada.");
  }

  const flewPayTokenAddress = process.env.WALLET_PUBLIC_KEY;
  const companyWallet = process.env.COMERCE_ADDRESS || "0x397AF893D1923ba982034f81b05aA60650dA97cC";
  
  if (!flewPayTokenAddress || !companyWallet) {
    throw new Error("Dirección de FlewPayToken o Wallet de la empresa no proporcionada.");
  }

  const deployedContract = await deploy("FlewPayLiquidation", {
    from: deployer,
    args: [flewPayTokenAddress, companyWallet], // Pasamos las direcciones al constructor
    log: true,
    autoMine: true,
  });

  console.log(`FlewPayLiquidation desplegado en: ${deployedContract.address}`);
};

export default deployFlewPayLiquidation;
