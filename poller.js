var quake3 = require('./quake3');

quake3.getServers()
quake3.getInfo('110.173.232.45', 27960);

//UDP message of 14 sent to master.ioquake3.org:27950
//parseServerVars(new Buffer("sv_hostname\\dustin CPMA - CHI #1\\sv_fps\\30\\sv_maxclients\\16\\sv_minRate\\0\\sv_maxRate\\25000\\sv_minPing\\0\\sv_maxPing\\0\\sv_floodProtect\\0\\sv_allowDownload\\0\\server_gameplay\\CPM\\g_maxGameClients\\0\\version\\ioq3 1.36 linux-x86_64 Apr 12 2009\\dmflags\\0\\fraglimit\\20\\timelimit\\0\\g_gametype\\1\\protocol\\68\\mapname\\cpm22\\sv_privateClients\\0\\game\\CPMA\\gamename\\cpma\\gamedate\\Jul 27 2010\\gameversion\\1.48\\sv_arenas\\1\\Score_Time\\Warmup\\Score_Red\\0\\Score_Blue\\0\\Players_Active\\1 2 \\GTV_CN\\1\\g_needpass\\0\\mode_current\\1V1", 'ascii'));
//41 31 "gellehsak"
//0 35 "^rdustin"
