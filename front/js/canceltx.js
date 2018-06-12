var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
var api = require('./api');
require("./components");
var contracts = require('./contracts');
const EthereumTx = require('ethereumjs-tx');

var app = new Vue({
    el: '#app',
    data: {
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
        // queryTx: function(event){
        //     this.errmsg = "";
        //     console.log('query tx:',this.txhash);
        //     $app = this;
        //     if (this.txhash === ''){
        //         this.errmsg = "no txhash found";
        //         return;
        //     }
        //     hashid = this.txhash;
        //     $app.tx.state = 'search...';
        //     $app.tx.hash = hashid;
        //     $app.tx.from = '';
        //     $app.tx.to = '';
        //     $app.tx.gasLimit = 0;
        //     $app.tx.gasPrice = '';
        //     $app.tx.value = '';
        //     $app.tx.nonce = 0;
        //     $app.tx.cancellable = false;

        //     web3.eth.getTransaction(hashid).then(function(info){
        //         console.log(info);
        //         if (typeof info === 'undefined'){
        //             $app.errmsg = 'tx not found';
        //             return;
        //         }
        //         $app.tx.show = true;
        //         $app.tx.hash = info.hash;
        //         $app.tx.from = info.from;
        //         $app.tx.to = info.to;
        //         $app.tx.gasLimit = info.gas;
        //         $app.tx.gasPrice = web3.utils.fromWei(info.gasPrice,"gwei")+" gwei";
        //         $app.tx.value = web3.utils.fromWei(info.value,"ether")+" eth";
        //         $app.tx.nonce = info.nonce;
        //         if (info.blockHash === '0x0000000000000000000000000000000000000000000000000000000000000000'){
        //             $app.tx.state = 'Pending';
        //             $app.tx.cancellable = true;
        //         }else{
        //             $app.tx.cancellable = false;
        //             web3.eth.getTransactionReceipt(hashid).then(function(rept){
        //                 if (rept.status) {
        //                     $app.tx.state = 'Success';
        //                 }else{
        //                     $app.tx.state = 'Fail';
        //                 }
        //             });
        //         }
        //         console.log($app.tx);
        //     });

        // },
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
            if (this.pk === ''){
                $('#inputpk').modal();
            }else{
                $app.doCancelTx();
            }
        },
        doCancelTx:function(){
            $app = this;
            this.errmsg = '';
            if (!this.tx.cancellable){
                this.errmsg = "tx state is "+this.tx.state+",which is not cancellable!";
                return;
            }
            if ($app.pk === ''){
                this.errmsg = 'please import your private key';
                return;
            }
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
                            nonce: web3.utils.numberToHex($app.tx.nonce),
                            gasPrice: web3.utils.toBN(gp).add(web3.utils.toBN(5000000000)) // add 5gwei
                        };
                        console.log("tx payload is ",txObj);
                        const tx = new EthereumTx(txObj);
                        var privateKey = Buffer.from($app.pk, 'hex');
                        tx.sign(privateKey);
                        const serializedTx = tx.serialize();
                        web3.getinfura(function(infura){
                            infura.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                                .on('transactionHash', function(hash){
                                    console.log('cancel tx:',hash);
                                    web3.jumpto('/tx/'+hash);
                                }).on('error',function(err){
                                    console.log("error:",err);
                                });
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
            web3.eth.getAccounts(function(err,accounts){
                payload.from = accounts[0];
                web3.eth.estimateGas(payload).then(function(limit){
                    payload.gas = limit;
                    web3.eth.sendTransaction(payload)
                    .on('transactionHash',function(hash){
                        console.log("submit tx ok:",hash);
                        this.transferEth = '0';
                        web3.jumpto('/tx/'+hash);
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


