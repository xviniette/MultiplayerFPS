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
			this.nbInput = 0;

			this.socket = null;

			this.positions = [];

			this.init(json);
		}

		init(json) {
			for (var i in json) {
				this[i] = json[i];
			}
		}

		update() {
			for (var input of this.inputs) {
				if (input.direction) {
					this.direction = input.direction;
				}

				var deplacementVector = {
					f: 0,
					l: 0
				};

				if (input.u) {
					deplacementVector.f += 1;
				}

				if (input.d) {
					deplacementVector.f -= 1;
				}

				if (input.r) {
					deplacementVector.l += 1;
				}

				if (input.l) {
					deplacementVector.l -= 1;
				}

				if (deplacementVector.f != 0 || deplacementVector.l != 0) {
					var angle = this.direction + Math.atan2(deplacementVector.l, deplacementVector.f);
					this.x += Math.cos(angle) * this.speed;
					this.y += Math.sin(angle) * this.speed;
				}

				if(!isServer){
					var snapshotData = this.getSnapshotData();
					snapshotData.nbInput = input.id;
					this.positions.push(snapshotData);					
				}else{
					this.nbInput = input.id;
				}
			}
			this.inputs = [];
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

		addInputs(inputs) {
			this.inputs.push(inputs);
		}

		getInitData() {
			return {
				id: this.id,
				name: this.name,
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
				x: this.x,
				y: this.y,
				direction: this.direction,
				input:this.nbInput
			}
		}
	}

	isServer ? module.exports = Player : window.Player = Player;
})();