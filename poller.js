var quake3 = require('./quake3');
var mongo = require('mongoskin');

var replSet = new mongo.ReplSetServers([
        new mongo.Server('107.170.222.53', 27017),
        new mongo.Server('162.243.147.170', 27017),
        new mongo.Server('104.131.135.198', 27017),
]);

var db = new mongo.Db('quakespy', replSet, {w:0, native_parser: (process.env['TEST_NATIVE'] != null)});

var serverColl = db.collection('quake3.servers');

function insertServers(message, remote) {
    var servers = quake3.parseGetServersReply(message, remote);
    servers.forEach(function sToMong(elem, i, arr) {
        serverColl.insert({host: elem[0], port: elem[1]}, function(err, result) {
            console.log(result);
        });
    });
}

quake3.getServers(insertServers)
//quake3.getInfo('110.173.232.45', 27960);
