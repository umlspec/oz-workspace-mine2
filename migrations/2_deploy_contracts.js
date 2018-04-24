var TutorialToken = artifacts.require("./TutorialToken");
//var BasicToken = artifacts.require('./BasicToken');
//var StandardToken = artifacts.require('./StandardToken');

module.exports = function (deployer) {
  
 //deployer.deploy(BasicToken);
 //deployer.deploy(StandardToken);
 deployer.deploy(TutorialToken);
};
