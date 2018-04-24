//var timeConverter = require("../lib-js/timeConverter.js");


var App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,
    loading: false,
    owner: 0x0,

    init: function(){
        console.log('init() running ');

        return App.initWeb3();
    },

    initWeb3: function(){
        console.log('initWeb3() running');  

        if (typeof web3 !== 'undefined'){
            App.web3Provider = web3.currentProvider;
        } else {
            //Web3 is already in Truffle ??
            App.web3Provider = new Web3.providers.httpProvider('http://127.0.0.1:7545');

        }

        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();

        return App.initContract();
    },

    displayAccountInfo: function() {
        console.log('displayAccountInfo() running');

        web3.eth.getCoinbase(function(err, account){
            console.log('displayAccountInfo() - getCoinbase() fallback is working');
            if (err) {
                console.log(err.message);
                return;
            }
            App.account = account;
            $('#account').text(App.account);
            web3.eth.getBalance(App.account, function(err,balance){
                console.log('displayAccountInfo() - getBalance() fallback is working');
                if(err){
                    console.log(err.message);
                    return;
                }
                $('#accountBalance').text(web3.fromWei(balance,"ether") + " ETH");
            });
        });
    },

    initContract: function(){
           console.log('initContract() running');
           $.getJSON('TutorialToken.json', function(data){
               console.log('InitContract() - getJason() fallback is working');
               App.contracts.TutorialToken = TruffleContract(data);
               App.contracts.TutorialToken.setProvider(App.web3Provider);

               App.listenToEvents();
               App.getBalances();

               return App.reloadTransfer();
           });

           return App.bindEvents();
    },

    bindEvents: function() {
        console.log('bindEvent() running');
        $(document).on('click','#transferButton', App.handleTransfer);
    },


    getBalances: function() {
        console.log('getbalances() running ');
        var tutorialTokenInstance;
        App.contracts.TutorialToken.deployed().then(function(instance){
            tutorialTokenInstance = instance;
            return tutorialTokenInstance.balanceOf(App.account);

        }).then(function(result){
            var balance = result;
            $('#TTBalance').text(balance);
        }).catch(function(err){
            console.log(err.message);
        });
    },

    reloadTransfer: function(){
        console.log('reloadTransfer() running');
        if(App.loading){
            return;
        }
        App.loading = true;

        App.displayAccountInfo();
        App.getBalances();

        var tutorialTokenInstance;

        App.contracts.TutorialToken.deployed().then(function(instance){
            tutorialTokenInstance = instance;
            return tutorialTokenInstance.getTransForPrinting(App.account);
        }).then(function(result){
            $('#transRow').empty();
            for(var i = 0; i < result.length; i++){
               var no = result[i] ;
               tutorialTokenInstance.transHistories(no).then(function(data){
                   App.displayTrans(data[0], data[1], data[2], data[3]);
               });
            }
            App.loading = false;
        }).catch(function(err){
            console.log(err.message);
            App.loading = false;
        });
    },

    displayTrans: function(from, to, amount, time){
        var transRow = $('#transRow');
        var transTemplate = $('#transTemplate');

        var _from, _to;
        var flip = false;

      //  var newTime = timeChange(time);
        var newTime = timeConverter.timeChange(time);

        if (from == App.account){
            _from = 'Me';
            _to = to;
            flip = true;
     
        } else if (to == App.account) {
            _from = from;
            _to = 'Me';
            flip = true;
            
        } 
    
            if (flip){
                transTemplate.find('.trans-from').text(_from);
                transTemplate.find('.trans-to').text(_to);
                transTemplate.find('.amount-tokens').text(amount);
                transTemplate.find('.trans-time').text(newTime);
    
                transRow.append(transTemplate.html());
                flip = false;
            }

    },


    listenToEvents: function() {
        console.log('listenToEvents() running');
        App.contracts.TutorialToken.deployed().then(function(instance){
            instance.Transfer({},{}).watch(function(err,event){
                console.log('listenToevents() - watch() callback function working');
                if(err){
                    console.log(err.message);
                    return;
                }
                var _from, _to;

                if (event.args.from == App.account) {
                  _from = 'Me';
                  _to = event.args.to;
                } else if (event.args.to == App.account){
                  _from = event.args.from;
                  _to = 'Me';
                } else {
                  _from = event.args.from;
                  _to = event.args.to;
                }

                const date = new Date();

                $('#events').append('<li class="list-group-item">'
                    + 'Token(' + event.args.value + ')' + ' is transferred from ' + _from
                 + ' to '+ _to + " when " + date);

               return  App.getBalances();
            });
            
        });
    },

    handleTransfer: function(event){
        console.log('handleTransfer() running');

        event.preventDefault();
        var amount = parseInt($('#TTTransferAmount').val());
        var toAddress = $('#TTTransferAddress').val();
        var tutorialTokenInstance;

        App.contracts.TutorialToken.deployed().then(function(instance){
            tutorialTokenInstance = instance;
            return tutorialTokenInstance.transfer(toAddress,amount,{from:App.account});
        }).then(function(result){
            alert('Transfer successful !');
            tutorialTokenInstance.makeTransHistories(toAddress,amount, {from:App.account});
           
        }).catch(function(err){
            console.log(err.message);
        });

        return App.reloadTransfer() ;

    },

    buyTokens: function(){
        console.log('buyTokens() running');
        event.preventDefault();
        

        var numberOfTokens = parseInt($('#numberOfTokens').val());
        var tutorialTokenInstance;

        App.contracts.TutorialToken.deployed().then(function(instance){

            console.log('buyTokens() - fallback function working ');
            tutorialTokenInstance = instance;
            
            return tutorialTokenInstance.transferFromOwner(numberOfTokens,
            {from:App.account, value:web3.toWei(numberOfTokens * 0.1, "ether"),
            gas: 500000});
        }).then(function(result){
           
            alert('Transfer successful by buying tokens !!!');
            
            App.owner = parseInt(tutorialTokenInstance.getOwner());
            
            tutorialTokenInstance.makeTransHistoriesFromOwner(numberOfTokens);
            
        }).catch(function(err){
           
            
            console.error(err);
        });

        return App.reloadTransfer();

    },


}

$(function(){
    $(window).load(function(){
        App.init();
    })
})


var timeChange = function (UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
};


//problem 1 : last two events are added with option watch({},{})

//problem 2 : with a new account, all events are newly set up
//each account has own history, 
//whwn it leaves, all list disappear;

//require(msg.sender != article.receiever);
