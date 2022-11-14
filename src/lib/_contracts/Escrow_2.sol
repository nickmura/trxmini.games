//SPDX-License-Identifier: MIT
// Chess Escrow
pragma solidity ^0.8.7;
    
contract Escrow {
    uint32 id;
    event GameIndex(uint32 indexed _gameId, uint indexed index);
    
    event GameEnd(uint gameId, bool draw);
    struct Game { 
        uint32 gameId;
        address playerOne;
        address playerTwo;
        uint deposit;
        bool hasEnded;
        bool stake0;
        bool stake1;
    }
    mapping (uint => Game) Games;

    function startGame(uint32 _gameId, address player, uint deposit) public payable {
        require(msg.sender == player, "Caller cannot make games for other addresses");
        id++;
        Games[id].gameId = _gameId;
        Games[id].playerOne = player;
        Games[id].deposit = deposit;
        emit GameIndex(_gameId, id);
    }


    function joinGame(uint index, address player, uint deposit) public payable {
        require(Games[index].playerTwo == address(0) && msg.sender != Games[index].playerOne, "Player 2 needs to be undefined / caller can't be Player 1.");
        require (deposit == Games[index].deposit, "Wager/stake needs to match opponents");
        require (Games[index].playerOne != player, "Cannot join your own game");
        Games[index].playerTwo = player;
    }

    function payWager(uint index) public {
        require(!Games[index].hasEnded, "Game has already been completed.");
        require(msg.sender == Games[index].playerOne || msg.sender == Games[index].playerTwo, "Caller needs to be a player");
        bool sent = payable(msg.sender).send(Games[index].deposit*2);
        require(sent, "Failed to send ether");
        Games[index].hasEnded = true;
        emit GameEnd(Games[index].gameId, false);
    }


    function payDraw(uint index) public {
        require(!Games[index].hasEnded, "Game has already been completed.");
        require(msg.sender == Games[index].playerOne || msg.sender == Games[index].playerTwo, "Caller needs to be player");
        bool sent0;
        bool sent1;
        if (msg.sender == Games[index].playerOne && !Games[index].stake0) {
            sent0 = payable(Games[index].playerOne).send(Games[index].deposit);
            Games[index].stake0 = true;
        } else if (msg.sender == Games[index].playerTwo && !Games[index].stake1) {
            sent1 = payable(Games[index].playerTwo).send(Games[index].deposit);
            Games[index].stake1 = true;
        }
        require(sent0 || sent1, "Failed to send ether, already been called");

        if (Games[index].stake0 && Games[index].stake1) {
            Games[index].hasEnded = true;
        } if (Games[index].hasEnded) {
            emit GameEnd(Games[index].gameId, true);
        }
        
    }

    function forfeit(uint index) public {
        require(!Games[index].hasEnded, "Game has already been completed.");
        require(msg.sender == Games[index].playerOne && Games[index].playerTwo == address(0), 'Player 2 has to be undefined');
        bool sent = payable(Games[index].playerOne).send(Games[index].deposit);
        require(sent, "Failed to send ether");
        Games[index].hasEnded = true;
        emit GameEnd(Games[index].gameId, true);
    } 
}