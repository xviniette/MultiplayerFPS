"use strict";
(() => {
	var isServer = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

	if (isServer) {
		var Map = require("./Map.js");
		var Player = require("./Player.js");
	}

	class Party {
		constructor(json) {
			this.players = [];
			this.map = null;

			this.config = {};

			this.init(json);
		}

		init(json) {
			for (var i in json) {
				this[i] = json[i];
			}
		}

		start() {
			this.update();
			this.snapshot();
			this.map = new Map();
			this.map.generate(20, 20, 0.3);
		}

		getPlayer(id) {
			for (var player of this.players) {
				if (player.id == id) {
					return player;
				}
			}
			return false;
		}


		addPlayer(p) {
			if (isServer) {
				p.x = 1;
				p.y = 1;

				var pData = p.getInitData();
				pData.type = "new_player";
				for (var player of this.players) {
					player.socket.send(JSON.stringify(pData), () => {});
				}
			}


			this.players.push(p);
			if (isServer) {
				p.socket.send(JSON.stringify(this.getInitData()), () => {});
			}
		}

		removePlayer(p) {
			for (var i in this.players) {
				if (this.players[i].id == p.id) {
					this.players.splice(i, 1);
					break;
				}
			}

			if (isServer) {
				for (var player of this.players) {
					player.socket.send(JSON.stringify({
						type: "remove_player",
						id: p.id
					}));
				}
			}
		}

		update() {
			setTimeout(() => {
				this.update();
			}, 1000 / this.config.physic)

			for (var player of this.players) {
				player.update();
			}

		}

		snapshot() {
			setTimeout(() => {
				this.snapshot();
			}, 1000 / this.config.snapshot);

			var snapshot = this.getSnapshotData();
			for (var player of this.players) {
				player.socket.send(JSON.stringify(snapshot), () => {});
			}
		}

		getInitData() {
			var data = {};
			data.type = "init";
			data.map = this.map.getInitData();
			data.players = [];
			for (var player of this.players) {
				data.players.push(player.getInitData());
			}
			return data;
		}

		getSnapshotData() {
			var data = {};
			data.type = "snapshot";
			data.players = [];
			for (var player of this.players) {
				data.players.push(player.getSnapshotData());
			}
			return data;
		}
	}

	isServer ? module.exports = Party : window.Party = Party;
})();