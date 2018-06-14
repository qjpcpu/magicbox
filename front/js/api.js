var rest, mime, client;

//var backend = 'http://localhost:5100';
var backend = 'http://api.ethershrimpfarm.co';

rest = require('rest'),
mime = require('rest/interceptor/mime');

function pendingTx(address,cb){
    client = rest.wrap(mime);
    client({ path: backend+'/tx/pending?address='+address }).then(function(response) {
        console.log('get pending tx: ', response.entity);
        cb(null,response.entity);
    });
}

function calcTxHash(tx,cb){
    client = rest.wrap(mime);
    client({ method: "POST",path: backend+'/tx/calc_hash',entity: JSON.stringify(tx) }).then(function(response) {
        console.log('get tx: ', response.entity);
        cb(null,response.entity);
    });
}

function sendRawTx(tx,cb){
    client = rest.wrap(mime);
    client({ method: "POST",path: backend+'/tx/send_raw_tx',entity: JSON.stringify(tx) }).then(function(response) {
        console.log('get tx: ', response.entity);
        cb(null,response.entity);
    });
}

module.exports = {
    pendingTx: pendingTx,
    calcTxHash: calcTxHash,
    sendRawTx: sendRawTx
};
