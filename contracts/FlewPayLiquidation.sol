// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./FlewPayToken.sol";

contract FlewPayLiquidation is Ownable2Step, ReentrancyGuard {
    // Instancia del token FlewPay
    FlewPayToken public flewPayToken;

    // Porcentaje de comisión para la empresa
    uint256 public constant COMPANY_FEE_PERCENTAGE = 2;

    // Wallet de la empresa para recibir comisiones
    address public companyWallet;

    // Eventos para trazabilidad
    event LiquidationProcessed(
        address indexed merchant,
        uint256 totalAmount,
        uint256 merchantAmount,
        uint256 companyFee
    );

    event CompanyWalletUpdated(
        address previousWallet, 
        address newWallet
    );

    constructor(
        address _flewPayTokenAddress, 
        address _initialCompanyWallet
    ) {
        flewPayToken = FlewPayToken(_flewPayTokenAddress);
        companyWallet = _initialCompanyWallet;
    }

    /**
     * @dev Procesa la liquidación de tokens para un comercio
     * @param merchant Dirección del comercio que recibe los tokens
     * @param amount Cantidad total de tokens a distribuir
     */
    function processLiquidation(
        address merchant, 
        uint256 amount
    ) 
        external 
        nonReentrant 
    {
        // Validaciones iniciales
        require(merchant != address(0), "Invalid merchant address");
        require(amount > 0, "Amount must be greater than 0");

        // Calcular comisión de la empresa (2%)
        uint256 companyFee = (amount * COMPANY_FEE_PERCENTAGE) / 100;
        
        // Calcular monto para el comercio
        uint256 merchantAmount = amount - companyFee;

        // Transferencia a la wallet del comercio
        require(
            flewPayToken.transfer(merchant, merchantAmount), 
            "Merchant transfer failed"
        );

        // Transferencia de comisión a wallet de la empresa
        require(
            flewPayToken.transfer(companyWallet, companyFee), 
            "Company fee transfer failed"
        );

        // Emitir evento de liquidación
        emit LiquidationProcessed(
            merchant, 
            amount, 
            merchantAmount, 
            companyFee
        );
    }

    /**
     * @dev Permite al owner actualizar la wallet de la empresa
     * @param _newCompanyWallet Nueva dirección de wallet para comisiones
     */
    function updateCompanyWallet(address _newCompanyWallet) 
        external 
        onlyOwner 
    {
        require(
            _newCompanyWallet != address(0), 
            "Invalid company wallet address"
        );

        address previousWallet = companyWallet;
        companyWallet = _newCompanyWallet;

        emit CompanyWalletUpdated(previousWallet, _newCompanyWallet);
    }

    /**
     * @dev Función de emergencia para recuperar tokens
     * @param tokenAddress Dirección del token a recuperar
     * @param amount Cantidad de tokens a recuperar
     */
    function recoverERC20(
        address tokenAddress, 
        uint256 amount
    ) 
        external 
        onlyOwner 
        nonReentrant 
    {
        IERC20 token = IERC20(tokenAddress);
        require(
            token.transfer(owner(), amount), 
            "Token recovery failed"
        );
    }

    /**
     * @dev Permite verificar el balance de tokens del contrato
     */
    function getContractTokenBalance() external view returns (uint256) {
        return flewPayToken.balanceOf(address(this));
    }
}