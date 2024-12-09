import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import dotenv from "dotenv";

dotenv.config();

const deployFlewPayToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    throw new Error("No se encontró la cuenta deployer configurada.");
  }

  // Desplegar el contrato FlewPayToken
  const deployedContract = await deploy("FlewPayToken", {
    from: deployer,
    args: [deployer], // Pasamos deployer como propietario inicial
    log: true,
    autoMine: true,
  });

  console.log(`FlewPayToken desplegado en: ${deployedContract.address}`);
};

export default deployFlewPayToken;

// Tags for the deployment script
deployFlewPayToken.tags = ["FlewPayToken"];
