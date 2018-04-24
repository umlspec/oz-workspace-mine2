pragma solidity ^0.4.17;

import "./StandardToken.sol";
import "./Ownable.sol";


//import "../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract TutorialToken is StandardToken, Ownable {
//contract TutorialToken is StandardToken { 
    string public name = "TutorialToken";
    string public symbol = "TT";
    uint8 public decimals = 2;

    uint public INITIAL_SUPPLY = 10000;
    //address public owner;

    //mapping(address => mapping(address => uint)) public transHistories;

    struct Trans {
        address from;
        address to;
        uint amount;
        uint time;
    }

    mapping (uint => Trans) public transHistories;

    uint public transCounter;

    function TutorialToken() public  {
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        owner = msg.sender;
        
    }

    function makeTransHistories(address _to, uint _amount) public {
        transCounter++;
        transHistories[transCounter] = Trans(msg.sender, _to, _amount, now);

    }

    function makeTransHistoriesFromOwner(uint _amount) public {
        transCounter++;
        transHistories[transCounter] = Trans(owner, msg.sender, _amount, now);

    }


    function getTransForPrinting(address _add) public view returns(uint[]) {
        uint[] memory trans = new uint[](transCounter);
        uint numberOfPrinting = 0;
        for(uint i = 1; i <= transCounter; i++){
            if(transHistories[i].from == _add){
                trans[numberOfPrinting] = i;
                numberOfPrinting++;
            } else if (transHistories[i].to == _add){
                trans[numberOfPrinting] = i;
                numberOfPrinting++;
            }
        }
        return trans;
    }

    function transferFromOwner(uint _value) public payable {
        require(owner != 0x0);
        require(_value <= balances[owner]);

        balances[owner] = balances[owner].sub(_value);
        balances[msg.sender] = balances[msg.sender].add(_value);

        owner.transfer(msg.value);

        emit Transfer(owner, msg.sender, _value);
        
    }

}

