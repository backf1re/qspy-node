var dgram = require('dgram'),
    jspack = require('jspack'),
    winston = require('winston');

winston.cli();

var logger = new(winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamp: true })
    ]
});

// Msg packing
var msgPrefix = Buffer('AAAA', 'ascii');
msgPrefix.fill(0xff)
var msgTerminator = Buffer('A', 'ascii');
msgTerminator[0] = 0x00;

function getClient() {
    var client = dgram.createSocket('udp4');
    var clientPort = Math.floor(Math.random() * (65000 - 2000) + 2000);
    client.bind(clientPort);
    client.on('error', function (err) {
        logger.error(err);
    });
    client.on('listening', function onListen() {
        logger.debug('LISTENING on port ' + client.address.port);
    });
    setTimeout(function waitToDie() {
        client.close();
    }, 8000);


    return client;
}

function sendQuery(msg, host, port, cb) {
    var cmdBuf = Buffer(msg, 'ascii')
    var msgBuf = Buffer.concat([msgPrefix, cmdBuf, msgTerminator])

    //	logger.debug('Sending buffer of length: ', msgBuf.length);
    //	logger.debug('For a string of length: ', msg.length);
    //	logger.debug('bufs is: ', msgBuf);
    //	logger.debug('msg is: ', msg);

    client = getClient();

    client.send(msgBuf, 0, msgBuf.length, port, host, function onSend(err, bytes) {
        if (err) throw err;
        logger.debug('UDP message of ' + msgBuf.length + ' sent to ' + host +':'+ port);
    });

    client.on('message', cb);
}

exports.parseGetServersReply = function(message, remote) {
	logger.debug('Got message ', remote.address + ':' + remote.port);

	msgLen = message.length
	var byteOffset = 22; // skip initial ÿÿÿÿgetserversResponse
	while(byteOffset < msgLen) {
		var address = jspack.jspack.Unpack('>BBBBH', message, byteOffset);
		if (typeof address === "undefined") {
			break;
		}
		byteOffset += 6 // 4 octets, 2 port

        var port = address.pop();
        if (port < 1024) {
            continue;
        }
        var ip = address.join('.');
        logger.debug("Got address ", ip + ":" + port);

	}
}

function handleGetInfoReply(message, remote) {
    var serverInfo = message.toString('ascii', 20).split('\n');

    var serverVars = parseServerVars(serverInfo[0]);
    var playerList = parsePlayerList(serverInfo.slice(1, serverInfo.length - 1));

    //return (serverVars, playerList);
    logger.debug('SVARS ', serverVars);
    logger.debug('PLAYERS ', playerList);
}

function parseServerVars(vars) {
    vars = vars.toString('ascii');
    var allVars = vars.split('\\');
    var svars = {};
    while(allVars.length > 0) {
        k = allVars.shift();
        v = allVars.shift();
        svars[k] = v;
    }
    return svars;
}

function parsePlayerList(playerList) {
    var players = playerList.map(function parsePlayer(pLine) {
        var pInfo = pLine.split(' ');
        return { 'score': pInfo[0], 'ping': pInfo[1], 'name': pInfo[2] }
    });
    return players;
}

exports.getServers = function() {
    var serverRequestMsg = 'getservers 68 empty full';
    var masterHost = 'master.ioquake3.org';
    var masterPort = 27950

    sendQuery(serverRequestMsg, masterHost, masterPort, handleGetServersReply)
}

var getInfo = exports.getInfo = function (host, port) {
    sendQuery('getstatus', host, port, handleGetInfoReply);
}
