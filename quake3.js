var dgram = require('dgram');
var jspack = require('jspack');

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
        console.log(err);
    });
    client.on('listening', function onListen() {
        console.log('LISTENING on port ' + client.address.port);
    });
    setTimeout(function waitToDie() {
        client.close();
    }, 8000);


    return client;
}

function sendQuery(msg, host, port, cb) {
    var cmdBuf = Buffer(msg, 'ascii')
    var msgBuf = Buffer.concat([msgPrefix, cmdBuf, msgTerminator])
   
    //	console.log('Sending buffer of length: ', msgBuf.length);
    //	console.log('For a string of length: ', msg.length);
    //	console.log('bufs is: ', msgBuf);
    //	console.log('msg is: ', msg);

    client = getClient();

    client.send(msgBuf, 0, msgBuf.length, port, host, function onSend(err, bytes) {
        if (err) throw err;
        console.log('UDP message of ' + msgBuf.length + ' sent to ' + host +':'+ port);
    });
    
    client.on('message', cb);
}

function handleGetServersReply(message, remote) {
	console.log('Got message');
	console.log(remote.address + ':' + remote.port);
	msgLen = message.length
	var byteOffset = 22; // skip initial ÿÿÿÿgetserversResponse
	while(byteOffset < msgLen) {
		var address = jspack.jspack.Unpack('>BBBBH', message, byteOffset);
		if (typeof address === "undefined") {
			break;
		}
		byteOffset += 6 // 4 octets, 2 port

		console.log('Got address: ', address);
        var port = address.pop();
        if (port < 1024) {
            continue;
        }
        var ip = address.join('.');
        console.log("Got IP ", ip);
        getInfo(ip, port);
	}
}

function handleGetInfoReply(message, remote) {
    var serverInfo = message.toString('ascii', 20).split('\n');

    var serverVars = parseServerVars(serverInfo[0]);
    var playerList = parsePlayerList(serverInfo.slice(1, serverInfo.length - 1));

    //return (serverVars, playerList);
    console.log('SVARS ', serverVars);
    console.log('PLAYERS ', playerList);
}

function parseServerVars(vars) {
    vars = vars.toString('ascii');
    var allVars = vars.split('\\');
    console.log(allVars.length);
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
