var web3 = require('./provider');
var abi = require("./abi");

//var magicbox_address = '0xd7f9e923e80734d2e18930aa177918a04e3032bf'; // ropsten
var magicbox_address = '0xB5B2B7a7089AFcBcC990f2adF3384920cD1ad451'; // online

module.exports = {
    magicbox: new web3.eth.Contract(abi.magicbox,magicbox_address)
};
