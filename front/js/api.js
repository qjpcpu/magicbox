var rest, mime, client;

var backend = 'http://localhost:5100';

rest = require('rest'),
mime = require('rest/interceptor/mime');

function pendingTx(address,cb){
    client = rest.wrap(mime);
    client({ path: backend+'/tx/pending?address='+address }).then(function(response) {
        console.log('get pending tx: ', response.entity);
        cb(null,response.entity.txs);
    });
}

module.exports = {
    pendingTx: pendingTx
};
