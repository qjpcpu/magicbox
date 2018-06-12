var Web3 = require('web3');
//var Web3 = window.Web3;
var web3;

if (typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
    web3.has_metamask = true;
    console.log("web3: use metamask ",web3.currentProvider);
} else {
    var provider_url = "https://mainnet.infura.io/pNwyFqB0rCSVcjbhB8gb";
    web3 = new Web3(new Web3.providers.HttpProvider(provider_url));
    web3.has_metamask = false;
    console.log("web3: use ",provider_url);
}

web3.getinfura = function(cb){
    if (web3.has_metamask){
        web3.eth.net.getNetworkType().then(function(tp){
            if ( tp === 'main') {
                console.log("get mainnet infura");
                cb(new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/pNwyFqB0rCSVcjbhB8gb")));
            }else{
                console.log("get ropsten infura");
                cb(new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/pNwyFqB0rCSVcjbhB8gb")));
            }
        });
    }else{
        console.log("get mainnet infura");
        cb(web3);
    }
};

window.myweb3 = web3;

module.exports = web3;
