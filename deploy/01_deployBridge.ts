import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import dotenv from "dotenv";

dotenv.config();

const deployFlewPayBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, ethers, getNamedAccounts } = hre;
  const { deploy } = deployments;

  // Obtener las cuentas configuradas en hardhat.config
  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    throw new Error("No se encontró la cuenta deployer configurada.");
  }

  // Direcciones de los contratos ya desplegados (USDC y FlewPayToken)
  const usdcAddress = process.env.USDC_ADDRESS ;
  const flewPayTokenAddress = process.env.WALLET_PUBLIC_KEY || "0x397AF893D1923ba982034f81b05aA60650dA97cC";

  // Verificación de direcciones válidas
  if (!usdcAddress || !flewPayTokenAddress) {
    throw new Error("Dirección de USDC o FlewPayToken no proporcionada.");
  }

  // Desplegar el contrato FlewPayBridge
  const deployedContract = await deploy("FlewPayBridge", {
    from: deployer,
    args: [usdcAddress, flewPayTokenAddress], // Direcciones de USDC y FlewPayToken
    log: true,
    autoMine: true,
  });

  console.log(`FlewPayBridge desplegado en: ${deployedContract.address}`);
};

export default deployFlewPayBridge;

// Etiquetas para el script de despliegue
deployFlewPayBridge.tags = ["FlewPayBridge"];
