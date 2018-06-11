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

module.exports = {}
