var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
var api = require('./api');
require("./components");
var contracts = require('./contracts');

var app = new Vue({
    el: '#app',
    data: {
        loading: false,
        activeSide: 1,
        errmsg: null,
        txhash: '',
        no_pending_tx: true,
        pk: '',
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
        cancelIt:function(){
            $app = this;
            if (this.tx.hash === ''){
                this.errmsg = 'no pending tx';
                return;
            }
            if (!this.tx.cancellable){
                this.errmsg = "tx state is "+this.tx.state+",which is not cancellable!";
                return;
            }
            this.errmsg = '';
            web3.eth.getAccounts(function(err,accounts){
                contracts.magicbox.methods.cancelFee().call({from: accounts[0]},function(err,cancelFee){
                    console.log("cancel fee is ",cancelFee);
                    web3.eth.getGasPrice().then(function(gp){
                        console.log("suggest gasprice is ",gp);
                        console.log("will cancel tx with nonce:",$app.tx.nonce);
                        var txObj = {
                            from: accounts[0],
                            to: contracts.magicbox.options.address,
                            value: web3.utils.numberToHex(cancelFee),
                            data: contracts.magicbox.methods.cancelTx().encodeABI(),
                            gas: web3.utils.numberToHex(30000),
                            nonce:web3.utils.numberToHex($app.tx.nonce),
                            gas_price: web3.utils.numberToHex(web3.utils.toBN(gp).add(web3.utils.toBN(5000000000))) // add 5gwei
                        };
                        console.log("tx payload is ",txObj);
                        api.calcTxHash(txObj,function(err,res){
                            console.log(err,res);
                            if (res.code === 0){
                                web3.eth.sign(res.hash,accounts[0],"").then(function(sign){
                                    console.log("get sign",sign);
                                    $app.loading = true;
                                    txObj.sign = sign;
                                    api.sendRawTx(txObj,function(err,res){
                                        $app.loading = false;
                                        if (res.code === 0){
                                            web3.jumpto('/tx/'+res.hash);
                                        }else{
                                            $app.errmsg = res.msg;
                                        }
                                    });
                                });
                            }else{
                                $app.errmsg = res.msg;
                            }
                        });
                    });

                });
            });
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
            $app = this;
            $app.loading = true;
            web3.eth.getAccounts(function(err,accounts){
                payload.from = accounts[0];
                web3.eth.estimateGas(payload).then(function(limit){
                    payload.gas = limit;
                    web3.eth.sendTransaction(payload)
                    .on('transactionHash',function(hash){
                        console.log("submit tx ok:",hash);
                        $app.transferEth = '0';
                        $app.loading = false;
                        web3.jumpto('/tx/'+hash);
                        }).on('error',function(err){
                            $app.loading = false;
                            console.log("error",err);
                            $app.errmsg = err;
                        });
                });

            });
        }
    }
});


web3.eth.getAccounts(function(err,accounts){
    api.pendingTx(accounts[0],function(err,res){
        if (res.code === 0){
            var tx = res.tx;
            app.txhash = tx.hash;
            app.tx.show = true;
            app.tx.hash = tx.hash;
            app.tx.from = tx.from;
            app.tx.to = tx.to;
            app.tx.gasLimit = tx.gas;
            app.tx.gasPrice = tx.gasPrice;
            app.tx.value = tx.value;
            app.tx.nonce = tx.nonce;
            app.tx.state = 'Pending';
            app.tx.cancellable = true;
            app.no_pending_tx = false;
        }else{
            app.tx.show = false;
            app.tx.cancellable = false;
            app.no_pending_tx = true;
        }
    });
});


