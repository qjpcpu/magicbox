var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
require("./components");

var app = new Vue({
    el: '#app',
    data: {
        activeSide: 1,
        errmsg: null,
        txhash: '0x00fd8679ff3c11690622cd4b1fececfc314f68c4501479d94e4811fd9d55007e',
        tx: {
            show: true,
            hash: '',
            state: '',
            from: '',
            to: '',
            gasLimit: 0,
            gasPrice: '',
            value: '',
            nonce: 0
        }
    },
    methods:{
        queryTx: function(event){
            this.errmsg = "";
            console.log('query tx:',this.txhash);
            if (this.txhash === ''){
                this.errmsg = "no txhash found";
                return;
            }
            thistx = this.tx;
            hashid = this.txhash;
            web3.eth.getTransactionReceipt(hashid).then(function(rept,eee){
                console.log('===>',rept,eee);
                if (rept.status) {
                    thistx.state = 'Success';
                }else{
                    thistx.state = 'Fail';
                }
            }).on("error",console.log);
            web3.eth.getTransaction(hashid).then(function(err,info){
                thistx.show = true;
                console.log(err,"get tx:",info);
                thistx.hash = info.hash;
                thistx.from = info.from;
                thistx.to = info.to;
                thistx.gasLimit = info.gas;
                thistx.gasPrice = web3.utils.fromWei(info.gasPrice,"gwei")+" gwei";
                thistx.value = web3.utils.fromWei(info.gasPrice,"ether")+" eth";
                thistx.nonce = info.nonce;

            });

        },
        cancelIt:function(){
            $('#install-metamask').modal();
        },
        transfer:function(event){
            if (typeof this.transferEth === 'undefined'){
                this.transferEth = 0;
                return;
            }
            if (this.transferTo === ''){
                this.errmsg = 'Please specify To';
                return;
            }
            eth = web3.utils.toWei(this.transferEth,'ether');
            var payload = {
                to: this.transferTo,
                value: eth
            };
            if (this.transferNote === ''){
            }else{
                payload.data = web3.eth.abi.encodeParameter('string',this.transferNote);
            }
            this.errmsg = null;
            web3.eth.getAccounts(function(err,accounts){
                payload.from = accounts[0];
                web3.eth.estimateGas(payload).then(function(limit){
                    payload.gas = limit;
                    web3.eth.sendTransaction(payload)
                    .on('transactionHash',function(hash){
                        console.log("submit tx ok:",hash);
                        this.transferEth = '0';
                        window.open('https://etherscan.io/tx/'+hash, '_blank');
                        }).on('error',function(err){
                            console.log("error",err);
                            this.errmsg = err;
                        });
                });

            });
        }
    }
});


