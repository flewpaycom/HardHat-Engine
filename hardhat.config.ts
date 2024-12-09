import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =  process.env.DEPLOYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses ours Etherscan default API key.
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
const etherscanOptimisticApiKey = process.env.ETHERSCAN_OPTIMISTIC_API_KEY || "5WAJWBWKK5ZCWJ1HQKJ61CMY8SZRMQEK94";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const arbiscanApiKey = process.env.ARBISCAN_API_KEY

const orbitApiKey = process.env.ORBIT_PRIVATE_KEY


if (!providerApiKey) {
  throw new Error("ALCHEMY_API_KEY is not set");
}



const SOLC_SETTING = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
};



const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
      {
        version: "0.8.24",
        settings: SOLC_SETTING,
      },
      {
        version: "0.8.23",
        settings: SOLC_SETTING,
      },
      {
        version: "0.8.22",
        settings: SOLC_SETTING,
      },
      {
        version: "0.8.21",
        settings: SOLC_SETTING,
      },
      {
        version: "0.8.20",
        settings: SOLC_SETTING,
      },
      {
        version: "0.8.19",
        settings: SOLC_SETTING,
      },

    ],
  },
  defaultNetwork: "orbit",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    orbit: {
      url: 'https://a877-152-201-123-55.ngrok-free.app',
      accounts: [orbitApiKey as string],
    },
  },

  

  // configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      arbitrumSepolia: `${arbiscanApiKey}`,
    },
    customChains: [
      {
        network: "arbitrumSepolia", // Nombre de tu red personalizada
        chainId: 421614, // Chain ID de Arbitrum Sepolia
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api", // Endpoint correcto para Sepolia
          browserURL: "https://sepolia.arbiscan.io", // Explorador web para Sepolia
        },
      },
    ],
  },
  // configuration for etherscan-verify from hardhat-deploy plugin
  
  sourcify: {
    enabled: false,
  },
};

export default config;
