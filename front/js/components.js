var Vue = require('./vue');
var web3 = require('./provider');


items =  [
    {
        name: "GasPrice",
        link: "https://etherscan.io/gasTracker",
        active: true
    },
    {
        name: "Metamask",
        link: "https://metamask.io/",
        active: false
    },
    {
        name: "Contract",
        link: "https://etherscan.io/address/0xb5b2b7a7089afcbcc990f2adf3384920cd1ad451",
        active: false
    }
];

web3.eth.getGasPrice().then(function(gp){
    items[0].name="CurrentGasPrice: "+web3.utils.fromWei(gp,'gwei')+"gwei";
});

var _tpl =
'    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="nav">'+
'      <div class="container">'+
'        <a class="navbar-brand" href="#">ETH Magic Box</a>'+
'        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">'+
'          <span class="navbar-toggler-icon"></span>'+
'        </button>'+
'        <div class="collapse navbar-collapse" id="navbarResponsive">'+
'          <ul class="navbar-nav ml-auto">'+
'            <li class="nav-item" v-bind:class="{active: item.active}" v-for="item in items">'+
'              <a class="nav-link" v-bind:href="item.link">{{item.name}}</a>'+
'            </li>'+
'          </ul>'+
'        </div>'+
'      </div>'+
    '    </nav>';

Vue.component('mynav',{
    data: function(){
        return {items:items};
    },
    template: _tpl
});


var _tmpl2 =
'    <div class="col-lg-3">'+
'    <h1 class="my-4">MagicBox</h1>'+
'    <div class="list-group">'+
'    <a v-bind:href="item.link" class="list-group-item" v-bind:class="{active: index == active}" v-for="(item,index) in items">{{item.name}}</a>'+
'    </div>'+
    '    </div>';

Vue.component('myside',{
    data: function(){
        return {
            items: [
                {
                    name:'Transfer With Note',
                    link: "index.html"
                },
                {
                    name:'Cancel Transaction',
                    link: "canceltx.html"
                }
            ]
        };
    },
    props: ['active'],
    template: _tmpl2
});

var _tmpl3=
'    <div class="card card-outline-secondary my-4">'+
'    <div class="card-header">'+
'    If you like this,Donate to me ^_^ '+
'    </div>'+
'    <div class="card-body">'+
'    <img  src="https://raw.githubusercontent.com/qjpcpu/qjpcpu.github.com/source/source/images/eth-e35.png" alt="" >'+
'    Or'+
'    <button class="btn btn-info" v-on:click="donate">donate directly to me 0.01eth</button>'+
'    </div>'+
    '    </div>';

Vue.component('donate-card',{
    template: _tmpl3,
    methods:{
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

module.exports = {};
