module.exports = function (app, wss) {
    var GameServer = app.get("GameServer");
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            var msg = JSON.parse(message);
            switch (msg.type) {
                case "join":
                var room = GameServer.getRoom(msg.room);
                if (room) {
                    var player = room.join(msg.user, msg.password, ws);
                    if (player) {
                        ws.player = player;
                    }
                }
                break;
                case "inputs":
                if(ws.player){
                    ws.player.inputs.push(msg.inputs);
                }
                break;
            }
        });
    });
}