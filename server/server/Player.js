"use strict";
(() => {
	var isServer = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

	class Player {
		constructor(json) {
			this.id = 1;
			this.name = "New player";

			this.x = 0;
			this.y = 0;

			this.direction = 0;
			this.speed = 0.01;
			this.radius = 0.2;

			this.inputs = [];

			this.socket = null;

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
			}
			this.inputs = [];
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
				direction: this.direction
			}
		}
	}

	isServer ? module.exports = Player : window.Player = Player;
})();