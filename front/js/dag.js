var Vue = require('./vue');
var provider = require('./provider');
var web3 = require("./provider");
require("./components");

var app = new Vue({
    el: '#app',
    data: {
        loading: false,
        activeSide: 2,
        errmsg: null
    },
    methods:{
        installMetamask:function(){
            $('#install-metamask').modal();
        }
    }
});



var sampleData = {
  "nodes": [
    {
      "id": "2",
      "cluster": "1",
      "title": "A History of Western Philosophy",
      "relatedness": "0.6416031476416721"
    },
    {
      "id": "3",
      "cluster": "1",
      "title": "Abaris the Hyperborean",
      "relatedness": "0.6605042722871506"
    },
    {
      "id": "4",
      "cluster": "1",
      "title": "Aegean Sea",
      "aa": "344",
      "relatedness": "0.5738613572915624"
    },
    {
      "id": "5",
      "cluster": "1",
      "title": "Alchemy",
      "relatedness": "0.6613786186196584"
    },
    {
      "id": "6",
      "cluster": "1",
      "title": "Anaximander",
      "relatedness": "0.7995214766975139"
    },
    {
      "id": "0",
      "root": true,
      "type": "philosopher",
      "title": "0x69ea6b3..."
    }
  ],
  "edges": [
    {
      "source": "0",
      "target": "2",
      "relatedness": "1"
    },
    {
      "source": "0",
      "target": "3",
      "relatedness": "2"
    },
    {
      "source": "0",
      "target": "4",
      "relatedness": "1"
    },
    {
      "source": "4",
      "target": "5",
      "relatedness": "1"
    },
    {
      "source": "5",
      "target": "6",
      "relatedness": "1"
    }
  ]
};

var config = {
    dataSource: sampleData,
    cluster: true,
    clusterColours: ["#DD79FF", "#00FF30", "#5168FF", "#f83f00", "#ff8d8f"],
    forceLocked: false,
    nodeCaption: "title",
    edgeCaption: "relatedness",
    nodeCaptionsOnByDefault: true,
    nodeTypes: {"type":["philosopher"]},
    directedEdges:true,
    backgroundColour: null,
    nodeStyle: {
        "philosopher": {
            "radius": 18
        }
    },
    initialScale: 0.7,
    initialTranslate: [250,150],
    edgeClick: function(e){
        console.log(e);
    },
    nodeMouseOver: function(node){
        console.log(node.getProperties('aa'));
    }
};

var alchemy = new Alchemy(config);
