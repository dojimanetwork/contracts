pragma solidity ^0.5.11;

import {DRC20} from "../child/DRC20.sol";

contract TestDRC20 is DRC20 {
    function() external payable {}
}
