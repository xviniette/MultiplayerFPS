"use strict";
(() => {
	var isServer = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

	class Player {
		constructor(json) {
			this.party = null;

			this.id = 1;
			this.name = "New player";

			this.x = 0;
			this.y = 0;

			this.direction = 0;
			this.speed = 0.1;
			this.radius = 0.25;

			this.inputs = [];
			this.lastInput = null;

			this.nbInput = 0;

			this.socket = null;

			this.positions = [];

			this.alive = false;

			this.init(json);
		}

		init(json) {
			for (var i in json) {
				this[i] = json[i];
			}
		}

		update(inputs = []) {
			for (var input of inputs) {
				if (input.direction) {
					this.direction = input.direction;
				}

				var deplacementVector = {
					f: 0,
					l: 0
				};

				if (input.u) deplacementVector.f += 1;
				if (input.d) deplacementVector.f -= 1;
				if (input.r) deplacementVector.l += 1;
				if (input.l) deplacementVector.l -= 1;


				if (deplacementVector.f != 0 || deplacementVector.l != 0) {
					var angle = this.direction + Math.atan2(deplacementVector.l, deplacementVector.f);
					this.x += Math.cos(angle) * this.speed;
					this.y += Math.sin(angle) * this.speed;
				}

				if (input.s && (this.lastInput == null || !this.lastInput.s)){
					var shoot = this.shoot(this.x, this.y, this.direction);
					for(var player of shoot.players){
						this.party.events.push({
							type:"kill",
							killer:this.id,
							killed:player.id
						});
						player.killed();
					}
				} 


				if(!isServer){
					var snapshotData = this.getSnapshotData();
					this.positions.push(snapshotData);					
				}else{
					this.nbInput = input.id;
				}
				this.lastInput = input;
			}
			return inputs.length;
		}

		respawn(){
			if(this.party == null){
				return;
			}
			var spawn = this.party.map.getRandomSpawn();

			for(var attr in spawn){
				this[attr] = spawn[attr];
			}

			console.log(this.x, this.y);

			this.alive = true;
		}

		shoot(x, y, direction){
			var map = this.party.map;
			var players = this.party.players;

			var shootStep = 0.05;

			var shootedPlayers = [];
			while(true){
				x += Math.cos(direction) * shootStep;
				y += Math.sin(direction) * shootStep;
				for(var player of players){
					if(player.id == this.id){
						continue;
					}
					if(Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2)) < player.radius){
						var isIn = false;
						for(var p of shootedPlayers){
							if(p.id == player.id){
								isIn = true;
								break;
							}
						}
						if(!isIn){
							shootedPlayers.push(player);
						}
					}
				}

				if(map.isBlock(Math.floor(x), Math.floor(y))){
					return {
						players:shootedPlayers,
						x:x,
						y:y
					}
				}
			}
		}

		killed(){
			this.alive = false;

			setTimeout(() => {
				this.respawn();
			}, this.party.config.respawnTime);
		}

		interpolate(time){
			for(var i = 0; i < this.positions.length - 1; i++){
				if(time >= this.positions[i].time && time < this.positions[i + 1].time){
					var ratio = (time - this.positions[i].time)/(this.positions[i + 1].time - this.positions[i].time); 
					var attributes = ["x", "y", "direction"];
					for(var attr of attributes){
						this[attr] = ratio * (this.positions[i + 1][attr] - this.positions[i][attr]) + this.positions[i][attr];
					}
					this.positions.splice(0, Math.max(0, i - 1));
					return;
				}
			}
		}

		reconciliation(snapshot){
			for(var i in this.positions){
				if(this.positions[i].input == snapshot.input){
					var isSame = true;
					for(var attr in snapshot){
						console.log()
						if(snapshot[attr] != this.positions[i][attr]){
							console.log(attr, this.positions[i][attr], snapshot[attr]);
							isSame = false;
							break;
						}
					}

					if(!isSame){
						this.x = snapshot.x;
						this.y = snapshot.y;
						this.direction = snapshot.direction;
					}

					for(var j in this.inputs){
						if(this.inputs[j].id == snapshot.input){
							this.inputs.splice(0, j);
							break;						
						}
					}

					this.update(this.inputs);

					this.positions.splice(0, i);
					return;
				}
			}
		}

		getInitData() {
			return {
				id: this.id,
				name: this.name,
				alive: this.alive,
				x: this.x,
				y: this.y,
				direction: this.direction,
				radius: this.radius,
				speed: this.speed
			}
		}

		getSnapshotData() {
			return {
				id: this.id,
				alive: this.alive,
				x: this.x,
				y: this.y,
				direction: this.direction,
				input:this.nbInput
			}
		}
	}

	isServer ? module.exports = Player : window.Player = Player;
})();