    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.7;

    contract Player_Tip {
        event Transfer(uint32 uuid, uint64 amount, address to);
        
        function tip(uint32 uuid, uint64 amount, address payable to) public payable {
            to.transfer(amount);
            emit Transfer(uuid, amount/1000000, to);
        }
    }