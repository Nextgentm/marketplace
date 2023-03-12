const TestFile = artifacts.require("TestFile");

module.exports = function (deployer) {
    deployer.deploy(TestFile);
};
