var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
require("./nav");

var app = new Vue({
    el: '#app',
    data: {
        activeSide: 'TransferWithNote',
        transferTo:'0xE35f3e2A93322b61e5D8931f806Ff38F4a4F4D88',
        transferEth: '0',
        transferNote: '',
        errmsg: null
    },
    methods:{
        installMetamask:function(){
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
        },
        donate:function(event){
            if (!web3.has_metamask){
                $('#install-metamask').modal();
                return;
            }
            eth = web3.utils.toWei('0.01','ether');
            notes = web3.eth.abi.encodeParameter('string',"donate!");
            web3.eth.getAccounts(function(err,accounts){
                web3.eth.estimateGas({
                    to:'0xE35f3e2A93322b61e5D8931f806Ff38F4a4F4D88',
                    data: notes,
                    value: eth
                }).then(function(limit){
                    web3.eth.sendTransaction({
                        from: accounts[0],
                        to:'0xE35f3e2A93322b61e5D8931f806Ff38F4a4F4D88',
                        data: notes,
                        value: eth,
                        gas: limit
                    }).on('transactionHash',function(hash){
                            console.log(hash);
                        }).on('error',function(err){
                            console.log("error",err);
                        });
                });
            });
        }
    }
});

