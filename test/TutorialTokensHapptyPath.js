const TutorialToken = artifacts.require('./TutorialToken');

contract ('TutorialToken', function(accounts){
    var tutorialTokenInstance;
      var coinbase = accounts[0];
      var account_1 = accounts[1];
      var coinbase_starting_balance = web3.fromWei(web3.eth.getBalance(accounts[0]),"ether");
      var account_1_starting_balance = web3.fromWei(web3.eth.getBalance(accounts[1]),"ether");

      var coinbase_ending_balance ;
      var account_1_ending_balance ;
      
      var coinbase_starting_tokens;
      var account_1_starting_tokens;

      var coinbase_ending_tokens;
      var account_1_ending_tokens;

      var tokens1;
      var ether1;

    it('Ownable: #getOwner()',function(){
        return TutorialToken.deployed().then(function(instance){
            return instance.getOwner();

        }).then(function(result){
            assert.equal(result, coinbase, "should be the same");
        })
    });

    it('TutorialToken: #transferFromOwner()', function(){
        return TutorialToken.deployed().then(function(instance){
            tutorialTokenInstance = instance;
            return tutorialTokenInstance.balanceOf(coinbase);
        }).then(function(result){
            coinbase_starting_tokens = result.toNumber();
            return tutorialTokenInstance.balanceOf(account_1);
        }).then(function(result){
            account_1_starting_tokens = result.toNumber();
            tokens1 = 100;
            ether1 = tokens1 * 0.1;
            return tutorialTokenInstance.transferFromOwner(tokens1, 
               {from:account_1,value:web3.toWei(ether1, "ether")});
                  
        }).then(function(receipt){
            //checking receipt
            return tutorialTokenInstance.balanceOf(coinbase);
        }).then(function(result){
            coinbase_ending_tokens = result.toNumber();
            return tutorialTokenInstance.balanceOf(account_1);
        }).then(function(result){
            account_1_ending_tokens = result.toNumber();
        }).then(function(){
            assert.equal(account_1_ending_tokens - tokens1, account_1_starting_tokens, "did not increase");
            assert.equal(coinbase_ending_tokens + tokens1, coinbase_starting_tokens, "did not decrease");

            coinbase_ending_balance = web3.fromWei(web3.eth.getBalance(accounts[0]),"ether");
            account_1_ending_balance = web3.fromWei(web3.eth.getBalance(accounts[1]),"ether");
            assert(coinbase_ending_balance - ether1 == coinbase_starting_balance, "ether was not added");
            assert(account_1_ending_balance <= account_1_starting_balance - ether1, "ether was not reduced");
        });
    });

});

