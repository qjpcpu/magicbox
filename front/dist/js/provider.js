var Web3 = require('web3');
//var Web3 = window.Web3;
var web3;

if (typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
    web3.has_metamask = true;
    console.log("web3: use metamask ",window.web3.currentProvider);
} else {
    var provider_url = "https://mainnet.infura.io/pNwyFqB0rCSVcjbhB8gb";
    web3 = new Web3(new Web3.providers.HttpProvider(provider_url));
    web3.has_metamask = false;
    console.log("web3: use ",provider_url)
}

module.exports = web3
