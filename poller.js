var dgram = require('dgram');
var jspack = require('jspack');
//console.log(jspack);

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

//client.on('message', function onMasterReply(message, remote) {
//	console.log('Got message');
//	console.log(remote.address + ':' + remote.port);
//	msgLen = message.length
//	var byteOffset = 22; // skip initial ÿÿÿÿgetserversResponse
//	while(byteOffset < msgLen) {
//		var servers = jspack.jspack.Unpack('>BBBBH', message, byteOffset);
//		if (typeof servers === "undefined") {
//			break;
//		}
//		console.log('Got servers: ', servers);
//		byteOffset += 6 // 4 octets, 2 port
//	}
//});

client.on('listening', function onListen() {
	//console.log('LISTENING');
});

client.bind(9001);

function sendQuery(msg, host, port) {
	var cmdBuf = Buffer(msg, 'ascii')
	var msgBuf = Buffer.concat([msgPrefix, cmdBuf, msgTerminator])
//	console.log('Sending buffer of length: ', msgBuf.length);
//	console.log('For a string of length: ', msg.length);
//	console.log('bufs is: ', msgBuf);
//	console.log('msg is: ', msg);

	client.send(msgBuf, 0, msgBuf.length, port, host, function onSend(err, bytes) {
		if (err) throw err;
		console.log('UDP message of ' + msgBuf.length + ' sent to ' + masterHost +':'+ masterPort);
	});
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
	console.log(svars);

}

function getInfo(host, port) {
	client.on('message', function onMessge(message, remote) {
		var serverInfo = message.toString('ascii', 20).split('\n');
		var serverVars = serverInfo[0];
		var playerList = serverInfo.slice(1);
		parseServerVars(serverVars);
	});
	sendQuery('getstatus', host, port);
}

function getServers() {
}

//sendQuery(serverRequestMsg, masterHost, masterPort)
//getInfo('216.52.148.224', 27960);

setTimeout(function waitToDie() {
	client.close();
}, 1000);


//UDP message of 14 sent to master.ioquake3.org:27950
parseServerVars(new Buffer("sv_hostname\\dustin CPMA - CHI #1\\sv_fps\\30\\sv_maxclients\\16\\sv_minRate\\0\\sv_maxRate\\25000\\sv_minPing\\0\\sv_maxPing\\0\\sv_floodProtect\\0\\sv_allowDownload\\0\\server_gameplay\\CPM\\g_maxGameClients\\0\\version\\ioq3 1.36 linux-x86_64 Apr 12 2009\\dmflags\\0\\fraglimit\\20\\timelimit\\0\\g_gametype\\1\\protocol\\68\\mapname\\cpm22\\sv_privateClients\\0\\game\\CPMA\\gamename\\cpma\\gamedate\\Jul 27 2010\\gameversion\\1.48\\sv_arenas\\1\\Score_Time\\Warmup\\Score_Red\\0\\Score_Blue\\0\\Players_Active\\1 2 \\GTV_CN\\1\\g_needpass\\0\\mode_current\\1V1", 'ascii'));
//41 31 "gellehsak"
//0 35 "^rdustin"
