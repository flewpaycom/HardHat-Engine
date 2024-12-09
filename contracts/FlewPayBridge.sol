// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./FlewPayToken.sol";

contract FlewPayBridge is Ownable2Step, ReentrancyGuard {
    // Contratos principales
    IERC20 public usdc;
    FlewPayToken public flewPayToken;
    
    // Configuraciones de swap
    uint256 public constant MIN_SWAP_AMOUNT = 1 * 10**6; // 1 USDC mínimo
    uint256 public swapFeePercentage = 1; // 1% de comisión
    
    // Límites de conversión
    uint256 public maxDailySwapLimit;
    uint256 public currentDailySwapTotal;
    uint256 public lastSwapTimestamp;

    // Eventos
    event Swap(
        address indexed user, 
        uint256 usdcAmount, 
        uint256 flewPayTokenAmount
    );
    
    event SwapParametersUpdated(
        uint256 feePercentage, 
        uint256 maxDailySwapLimit
    );

    constructor(
        address _usdc, 
        address _flewPayToken
    ) {
        usdc = IERC20(_usdc);
        flewPayToken = FlewPayToken(_flewPayToken);
        
        // Configuración inicial de límite diario (100,000 USDC)
        maxDailySwapLimit = 100_000 * 10**6;
    }

    // Calcular cantidad de tokens con consideraciones de comisión
    function calculateTokenAmount(uint256 usdcAmount) public view returns (uint256) {
        // Validaciones iniciales
        require(usdcAmount >= MIN_SWAP_AMOUNT, "Swap amount too low");

        // Cálculo de comisión (1:1 con descuento de fee)
        uint256 feeAmount = (usdcAmount * swapFeePercentage) / 100;
        return usdcAmount - feeAmount;
    }

    // Función principal de swap
    function depositAndSwap(uint256 usdcAmount) 
        external 
        nonReentrant 
    {
        // Validaciones de seguridad
        require(usdcAmount >= MIN_SWAP_AMOUNT, "Swap amount too low");
        
        // Validar límite diario
        if (block.timestamp - lastSwapTimestamp > 1 days) {
            currentDailySwapTotal = 0;
            lastSwapTimestamp = block.timestamp;
        }
        
        require(
            currentDailySwapTotal + usdcAmount <= maxDailySwapLimit, 
            "Daily swap limit exceeded"
        );

        // Verificar saldo y allowance del usuario
        require(
            usdc.balanceOf(msg.sender) >= usdcAmount, 
            "Insufficient USDC balance"
        );
        require(
            usdc.allowance(msg.sender, address(this)) >= usdcAmount, 
            "Insufficient USDC allowance"
        );

        // Transferencia de USDC
        require(
            usdc.transferFrom(msg.sender, address(this), usdcAmount), 
            "USDC transfer failed"
        );

        // Calcular cantidad de tokens (1:1 menos comisión)
        uint256 flewPayTokenAmount = calculateTokenAmount(usdcAmount);

        // Minteo de tokens
        flewPayToken.mint(msg.sender, flewPayTokenAmount);

        // Actualizar total diario
        currentDailySwapTotal += usdcAmount;

        // Emitir evento
        emit Swap(msg.sender, usdcAmount, flewPayTokenAmount);
    }

    // Funciones administrativas
    function updateSwapParameters(
        uint256 _newFeePercentage, 
        uint256 _newDailySwapLimit
    ) 
        external 
        onlyOwner 
    {
        require(_newFeePercentage <= 10, "Fee cannot exceed 10%");
        require(_newDailySwapLimit > 0, "Daily limit must be positive");

        swapFeePercentage = _newFeePercentage;
        maxDailySwapLimit = _newDailySwapLimit;

        emit SwapParametersUpdated(_newFeePercentage, _newDailySwapLimit);
    }

    // Función de emergencia para recuperar USDC
    function emergencyWithdrawUSDC(uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(
            usdc.transfer(owner(), amount), 
            "Emergency withdraw failed"
        );
    }

    // Función para recuperar tokens enviados por error
    function recoverERC20(address tokenAddress, uint256 amount) 
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
}