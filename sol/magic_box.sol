pragma solidity ^0.4.23;

contract Ownable {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function withdraw() public onlyOwner{
        owner.transfer(address(this).balance);
    }

}


contract MagicBox is Ownable {
    uint256 public cancelFee = 10 finney;

    function setCancelFee(uint256 _fee) public onlyOwner{
        cancelFee = _fee;
    }
    
    function cancelTx() public payable{
        require(msg.value>=cancelFee);
    }
    
    function plain() public payable{
    }
    
    function() public payable{
    }

}

