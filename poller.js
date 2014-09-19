var dgram = require('dgram');
var jspack = require('jspack');
console.log(jspack);

var msgPrefix = Buffer('AAAA', 'ascii');
msgPrefix.fill(0xff)
var msgTerminator = Buffer('A', 'ascii');
msgTerminator[0] = 0x00;
var serverRequestMsg = 'getservers 68 empty full';
var masterHost = 'master.ioquake3.org';
var masterPort = 27950

var client = dgram.createSocket('udp4');
client.on('error', function (err) {
	console.log(err);
});

client.on('message', function (message, remote) {
	console.log('Got message');
	console.log(remote.address + ':' + remote.port);
	msgLen = message.length
	var byteOffset = 22; // skip initial ÿÿÿÿgetserversResponse
	while(byteOffset < msgLen) {
		var servers = jspack.jspack.Unpack('>BBBBH', message, byteOffset);
		if (typeof servers === "undefined") {
			break;
		}
		console.log('Got servers: ', servers);
		byteOffset += 6 // 4 octets, 2 port
	}
});

client.on('listening', function () {
	console.log('LISTENING');
});

client.bind(9001);

function sendQuery(msg) {
	var cmdBuf = Buffer(msg, 'ascii')
	var msgBuf = Buffer.concat([msgPrefix, cmdBuf, msgTerminator])
	console.log('Sending buffer of length: ', msgBuf.length);
	console.log('For a string of length: ', msg.length);
	console.log('bufs is: ', msgBuf);
	console.log('msg is: ', msg);

	client.send(msgBuf, 0, msgBuf.length, masterPort, masterHost, function onSend(err, bytes) {
		if (err) throw err;
		console.log('UDP message of ' + msgBuf.length + ' sent to ' + masterHost +':'+ masterPort);
	});
}

function getServers() {
}

sendQuery(serverRequestMsg)
