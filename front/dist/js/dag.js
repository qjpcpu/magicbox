var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
require("./components");
var api = require('./api');

var app = new Vue({
    el: '#app',
    data: {
        loading: false,
        activeSide: 2,
        errmsg: null,
        selectedContract: '',
        inputAddress:'',
        graphOpts: [
            {
                name: 'EOS',
                contract: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0'
            },
            {
                name: "TRX",
                contract: '0xf230b790e05390fc8295f4d3f60332c93bed42e2'
            },
            {
                name: 'BNB',
                contract: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
            },
            {
                name: 'VEN',
                contract: '0xd850942ef8811f2a866692a623011bde52a462c1'
            },
            {
                name: 'OMG',
                contract: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'
            }
        ]
    },
    methods:{
        installMetamask:function(){
            $('#install-metamask').modal();
        },
        queryNet:function(){
            console.log(this.selectedContract,this.inputAddress);
            var $app = this;
            $app.loading = true;
            api.queryNetwork({contract: $app.selectedContract,address:$app.inputAddress},function(err,res){
                $app.loading = false;
                var config = {
                    dataSource: res.network,
                    cluster: true,
                    clusterColours: ["#DD79FF", "#00FF30", "#5168FF", "#f83f00", "#ff8d8f"],
                    forceLocked: false,
                    nodeCaption: "title",
                    edgeCaption: "relatedness",
                    nodeCaptionsOnByDefault: true,
                    nodeTypes: {"type":["philosopher"]},
                    directedEdges:true,
                    backgroundColour: 'antiquewhite',
                    nodeStyle: {
                        "philosopher": {
                            "radius": 18
                        }
                    },
                    initialScale: 0.7,
                    initialTranslate: [250,150],
                    edgeClick: function(e){
                        console.log(e);
                        if (e.getProperties("tx") != ''){
                            web3.jumpto("/tx/"+e.getProperties("tx"));
                        }else{
                        api.hotTx({from:e.getProperties("source"),to:e.getProperties("target"),contract:$app.selectedContract},function(err,hotTx){
                            window.alchemy.getEdges(e.getProperties("source"),e.getProperties("target"))[0].setProperties({
                                "relatedness": hotTx.max.value,
                                "tx":hotTx.max.tx
                            });
                            web3.jumpto("/tx/"+hotTx.max.tx);
                        });
                        }
                    },
                    nodeMouseOver: function(node){
                        console.log(node);
                        return node.getProperties('id');
                    },
                    nodeClick: function(node){
                        web3.jumpto("/address/"+node.getProperties('id'));
                    }
                };
                window.alchemy = new Alchemy(config);
            });
        }
    }
});




web3.eth.getAccounts(function(err,accounts){
    app.inputAddress=accounts[0];
    app.selectedContract = app.graphOpts[0].contract;
});
