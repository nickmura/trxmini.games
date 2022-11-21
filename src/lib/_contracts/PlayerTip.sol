    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.7;

    contract TrxMini_Player_Tip {
        event Transfer(address from, uint amount, address to);
        
        function tip(uint256 amount, address payable to) public payable {
            to.transfer(amount);
            emit Transfer(msg.sender, amount/1000000, to);
        }
    }