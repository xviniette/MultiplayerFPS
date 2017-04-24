var server = require('http').createServer();
var express = require('express');
var app = express();
var WebSocketServer = require('uws').Server;
var wss = new WebSocketServer({ server: server });

var config = require("./config.json");
app.set("config", config);

var PORT = (!Number.isNaN(parseInt(process.argv[2], 10))) ? parseInt(process.argv[2], 10) : config.PORT;
config.PORT = PORT;

var Party = require("./server/Party.js");
var party = new Party({config:config});
party.start();
app.set("Party", party);

var websocket = require("./server/websocket.js")(app, wss);

server.on('request', app);
server.listen(PORT, (err) => { console.log(`SERVER LISTENING ON PORT ${server.address().port}`)});
