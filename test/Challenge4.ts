import { ethers } from "hardhat";
import { expect } from "chai";
import { ContractTransactionReceipt } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FlewPayToken } from "../typechain-types"; // Asegúrate de tener el tipo generado para FlewPayToken

describe("🚀 FlewPayToken Contract Tests", () => {
  let tokenContract: FlewPayToken;
  let deployer: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  async function deployNewInstance() {
    before("Deploying fresh FlewPayToken contract", async function () {
      console.log("\t", "🛫 Deploying FlewPayToken contract...");
      const FlewPayTokenFactory = await ethers.getContractFactory("FlewPayToken");
      [deployer, user1, user2] = await ethers.getSigners();

      // Deploying the token contract
      tokenContract = (await FlewPayTokenFactory.deploy(deployer.address)) as FlewPayToken;
      await tokenContract.waitForDeployment();

      console.log("\t", "📜 Contract deployed at:", await tokenContract.getAddress());
    });
  }

  deployNewInstance();

  // --------------------- TESTS ---------------------

  describe("1️⃣ Basic Deployment Checks", () => {
    it("Should set the correct token name and symbol", async function () {
      expect(await tokenContract.name()).to.equal("FlewPayToken");
      expect(await tokenContract.symbol()).to.equal("FLUPAY");
    });

    it("Should assign roles to the deployer", async function () {
      const isAdmin = await tokenContract.hasRole(await tokenContract.DEFAULT_ADMIN_ROLE(), deployer.address);
      expect(isAdmin).to.be.true;

      const isMinter = await tokenContract.hasRole(await tokenContract.MINTER_ROLE(), deployer.address);
      expect(isMinter).to.be.true;

      const isPauser = await tokenContract.hasRole(await tokenContract.PAUSER_ROLE(), deployer.address);
      expect(isPauser).to.be.true;
    });
  });

  describe("2️⃣ Minting Tokens", () => {
    it("Should allow MINTER_ROLE to mint tokens", async function () {
      await expect(tokenContract.connect(deployer).mint(user1.address, ethers.parseEther("100")))
        .to.emit(tokenContract, "TokensMinted")
        .withArgs(user1.address, ethers.parseEther("100"));

      const balance = await tokenContract.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should revert minting if caller lacks MINTER_ROLE", async function () {
      await expect(tokenContract.connect(user1).mint(user2.address, ethers.parseEther("100"))).to.be.revertedWith(
        "AccessControl: account"
      );
    });
  });

  describe("3️⃣ Burning Tokens", () => {
    it("Should allow users to burn their own tokens", async function () {
      await tokenContract.connect(deployer).mint(user1.address, ethers.parseEther("50"));
      await expect(tokenContract.connect(user1).burn(ethers.parseEther("20")))
        .to.emit(tokenContract, "TokensBurned")
        .withArgs(user1.address, ethers.parseEther("20"));

      const balance = await tokenContract.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("30"));
    });

    it("Should revert if user tries to burn more tokens than they own", async function () {
      await expect(tokenContract.connect(user1).burn(ethers.parseEther("100"))).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("4️⃣ Pausing Transfers", () => {
    it("Should allow PAUSER_ROLE to pause and unpause", async function () {
      await expect(tokenContract.connect(deployer).pause())
        .to.emit(tokenContract, "TokensPaused");

      await expect(tokenContract.connect(user1).transfer(user2.address, ethers.parseEther("10"))).to.be.revertedWith(
        "Pausable: paused"
      );

      await expect(tokenContract.connect(deployer).unpause())
        .to.emit(tokenContract, "TokensUnpaused");

      await expect(tokenContract.connect(user1).transfer(user2.address, ethers.parseEther("10"))).to.not.be.reverted;
    });

    it("Should revert if non-PAUSER_ROLE tries to pause or unpause", async function () {
      await expect(tokenContract.connect(user1).pause()).to.be.revertedWith("AccessControl: account");
    });
  });

  describe("5️⃣ Role Management", () => {
    it("Should allow DEFAULT_ADMIN_ROLE to grant and revoke roles", async function () {
      await expect(tokenContract.connect(deployer).grantRole(await tokenContract.MINTER_ROLE(), user1.address))
        .to.emit(tokenContract, "RoleGranted")
        .withArgs(await tokenContract.MINTER_ROLE(), user1.address, deployer.address);

      const isMinter = await tokenContract.hasRole(await tokenContract.MINTER_ROLE(), user1.address);
      expect(isMinter).to.be.true;

      await expect(tokenContract.connect(deployer).revokeRole(await tokenContract.MINTER_ROLE(), user1.address))
        .to.emit(tokenContract, "RoleRevoked")
        .withArgs(await tokenContract.MINTER_ROLE(), user1.address, deployer.address);

      const isMinterAfterRevoke = await tokenContract.hasRole(await tokenContract.MINTER_ROLE(), user1.address);
      expect(isMinterAfterRevoke).to.be.false;
    });

    it("Should revert if non-admin tries to grant or revoke roles", async function () {
      await expect(tokenContract.connect(user1).grantRole(await tokenContract.MINTER_ROLE(), user2.address)).to.be.revertedWith(
        "AccessControl: account"
      );
    });
  });
});
