//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AuroraStNear is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20Metadata;

    /*
    IERC20Metadata public constant wNear = IERC20Metadata(0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d);
    IERC20Metadata public constant stNear = IERC20Metadata(0x07F9F7f963C5cD2BBFFd30CcfB964Be114332E30);
    */

    IERC20Metadata public immutable wNear;
    IERC20Metadata public immutable stNear;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR");
    // stNEAR/wNEAR price
    uint256 public stNearPrice;
    uint256 public wNearAccumulatedFees;
    uint256 public stNearAccumulatedFees;
    // Swap fees in basis points. 10000 == 100%
    uint16 public wNearSwapFee;
    uint16 public stNearSwapFee;

    event wNearWithdraw(address indexed admin, uint256 amount);
    event stNearWithdraw(address indexed admin, uint256 amount);

    constructor(
        IERC20Metadata _wNear,
        IERC20Metadata _stNear,
        uint256 _stNearPrice
    ) {
        require(_stNearPrice > 1_000_000_000_000_000_000_000_000, "stNear price can't be less than 1 wNEAR");

        uint256 stNearDecimals = _stNear.decimals();
        // aurora testnet bug, testnet bridge sets decimals=0
        if (stNearDecimals == 0){
            stNearDecimals = 24;
        }
        require(stNearDecimals==24,"stNearDecimals must be 24");
        uint256 wNearDecimals = _wNear.decimals();
        // aurora testnet bug, testnet bridge sets decimals=0
        if (wNearDecimals == 0){
            wNearDecimals = 24;
        }
        require(wNearDecimals==24,"wNearDecimals must be 24");

        wNear = _wNear;
        stNear = _stNear;
        stNearPrice = _stNearPrice;
        wNearSwapFee = 40;
        stNearSwapFee = 10;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(OPERATOR_ROLE, msg.sender);
    }

    function swapwNEARForstNEAR(uint256 _amount) external nonReentrant {
        uint256 stNearDecimals = stNear.decimals();
        // aurora testnet bug
        if (stNearDecimals == 0){
            stNearDecimals = 24;
        }

        uint256 stNearAmount = (_amount * (10**stNearDecimals)) /
            stNearPrice;
        uint256 feeAmount = (stNearAmount * stNearSwapFee) / 10000;
        stNearAccumulatedFees += feeAmount;
        stNearAmount -= feeAmount;
        require(
            stNear.balanceOf(address(this)) >= stNearAmount,
            "Not enough stNEAR in buffer"
        );
        wNear.safeTransferFrom(msg.sender, address(this), _amount);
        stNear.safeTransfer(msg.sender, stNearAmount);
    }

    function swapstNEARForwNEAR(uint256 _amount) external nonReentrant {
        uint256 stNearDecimals = stNear.decimals();
        // aurora testnet bug
        if (stNearDecimals == 0){
            stNearDecimals = 24;
        }
        
        uint256 wNearAmount = (_amount * stNearPrice) / (10**stNearDecimals);
        uint256 feeAmount = (wNearAmount * wNearSwapFee) / 10000;
        wNearAccumulatedFees += feeAmount;
        wNearAmount -= feeAmount;
        require(
            wNear.balanceOf(address(this)) >= wNearAmount,
            "Not enough wNEAR in buffer"
        );
        stNear.safeTransferFrom(msg.sender, address(this), _amount);
        wNear.safeTransfer(msg.sender, wNearAmount);
    }

    // Operator functions
    function setstNEARPrice(uint256 _stNearPrice)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(_stNearPrice > 1_000_000_000_000_000_000_000_000, "stNear price can't be less than 1 wNEAR");
        stNearPrice = _stNearPrice;
    }

    function setstNEARSwapFee(uint16 _fee) external onlyRole(OPERATOR_ROLE) {
        require(_fee <= 300, "Invalid fee amount, must be lower than 300");
        stNearSwapFee = _fee;
    }

    function setwNEARSwapFee(uint16 _fee) external onlyRole(OPERATOR_ROLE) {
        require(_fee <= 300, "Invalid fee amount, must be lower than 300");
        wNearSwapFee = _fee;
    }

    // Admin functions
    function withdrawwNEAR(uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(
            wNear.balanceOf(address(this)) >= _amount,
            "Not enough wNEAR in buffer"
        );
        if (_amount >= wNearAccumulatedFees) {
            wNearAccumulatedFees = 0;
        } else {
            wNearAccumulatedFees -= _amount;
        }
        wNear.safeTransfer(msg.sender, _amount);
        emit wNearWithdraw(msg.sender, _amount);
    }

    function withdrawstNEAR(uint256 _amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(
            stNear.balanceOf(address(this)) >= _amount,
            "Not enough stNEAR in buffer"
        );
        if (_amount >= stNearAccumulatedFees) {
            stNearAccumulatedFees = 0;
        } else {
            stNearAccumulatedFees -= _amount;
        }
        stNear.safeTransfer(msg.sender, _amount);
        emit stNearWithdraw(msg.sender, _amount);
    }
}
