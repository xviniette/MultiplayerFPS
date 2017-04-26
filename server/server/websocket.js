var Player = require("./Player.js");

module.exports = function (app, wss) {
    var Party = app.get("Party");
    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            var msg = JSON.parse(message);
            switch (msg.type) {
                case "join":
                var player = new Player({id:Math.floor(Math.random() * 10000), name: (msg.name ?  msg.name : "New player"), socket:ws});
                ws.player = player;
                ws.send(JSON.stringify({type:"id", id:player.id}));

                Party.addPlayer(player);
                break;
                case "inputs":
                if(!ws.player){
                    return;
                }
                Party.getPlayer(ws.player.id).inputs.push(msg.inputs);
                break;
                case "ping":
                    ws.send(JSON.stringify({type:"ping", datetime:msg.datetime}));
                break;
            }
        });

        ws.on('close', function(){
            Party.removePlayer(ws.player)
        });
    });
}