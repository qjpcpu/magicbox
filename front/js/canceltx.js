var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
var api = require('./api');
require("./components");

var app = new Vue({
    el: '#app',
    data: {
        activeSide: 1,
        errmsg: null,
        txhash: '',
        tx: {
            show: false,
            cancellable: false,
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
            $app = this;
            if (this.txhash === ''){
                this.errmsg = "no txhash found";
                return;
            }
            hashid = this.txhash;
            $app.tx.state = 'search...';
            $app.tx.hash = hashid;
            $app.tx.from = '';
            $app.tx.to = '';
            $app.tx.gasLimit = 0;
            $app.tx.gasPrice = '';
            $app.tx.value = '';
            $app.tx.nonce = 0;
            $app.tx.cancellable = false;

            web3.eth.getTransaction(hashid).then(function(info){
                console.log(info);
                if (typeof info === 'undefined'){
                    $app.errmsg = 'tx not found';
                    return;
                }
                $app.tx.show = true;
                $app.tx.hash = info.hash;
                $app.tx.from = info.from;
                $app.tx.to = info.to;
                $app.tx.gasLimit = info.gas;
                $app.tx.gasPrice = web3.utils.fromWei(info.gasPrice,"gwei")+" gwei";
                $app.tx.value = web3.utils.fromWei(info.value,"ether")+" eth";
                $app.tx.nonce = info.nonce;
                if (info.blockHash === '0x0000000000000000000000000000000000000000000000000000000000000000'){
                    $app.tx.state = 'Pending';
                    $app.tx.cancellable = true;
                }else{
                    $app.tx.cancellable = false;
                    web3.eth.getTransactionReceipt(hashid).then(function(rept){
                        if (rept.status) {
                            $app.tx.state = 'Success';
                        }else{
                            $app.tx.state = 'Fail';
                        }
                    });
                }
                console.log($app.tx);
            });

        },
        cancelIt:function(){
            if (!this.tx.cancellable){
                this.errmsg = "tx state is "+this.tx.state+",which is not cancellable!";
                return;
            }
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


web3.eth.getAccounts(function(err,accounts){
    api.pendingTx(accounts[0],function(err,txs){
        if (txs.length > 0){
            app.txhash = txs[0];
            app.queryTx();
        }
    });
});
