var quake3 = require('./quake3');
var mongo = require('mongoskin');

var replSet = new mongo.ReplSetServers([
        new mongo.Server('107.170.222.53', 27017),
        new mongo.Server('162.243.147.170', 27017),
        new mongo.Server('104.131.135.198', 27017),
]);

var db = new mongo.Db('quakespy', replSet, {w:0, native_parser: (process.env['TEST_NATIVE'] != null)});

var serverColl = db.collection('quake3.servers');

function insertServerInfo(message, remote) {
    var serverInfo = quake3.parseGetInfoReply(message, remote);
    var svars = serverInfo[0],
        players = serverInfo[1];

    Object.keys(svars).forEach(function(elem, i, arr) {
        var cleanKey = elem.replace(/\./g,'');
        if (elem !== cleanKey) {
            svars[cleanKey] = svars[elem];
            delete svars[elem];
        }
    });

    var serverDoc = {
        host: remote.address,
        port: remote.port,
        seen: Date.now(),
        hostname: svars['sv_hostname'],
        maxClients: svars['sv_maxclients'],
        game: svars['com_gamename'],
        serverVars: svars,
        players: players
    };

    serverColl.insert(serverDoc, function(err, result) {
        console.log("Insert.")
    });
}

function getServerInfo(message, remote) {
    var servers = quake3.parseGetServersReply(message, remote);
    servers.forEach(function sToMong(elem, i, arr) {
        console.log("Getting into getInfo");
        quake3.getInfo(elem[0], elem[1], insertServerInfo);
    });
}

quake3.getServers(getServerInfo);

setTimeout(function waitToDie() {
    db.close();
}, 4000);

