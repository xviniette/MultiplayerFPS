"use strict";
(() => {
	var isServer = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

	class Player{
		constructor(json){
			this.id = 1;
			this.name = "New player";

			this.x = 0;
			this.y = 0;

			this.direction = 0;
			this.speed = 1;
			this.radius = 5;

			this.inputs = [];

			this.socket = null;

			this.init(json);
		}

		init(json){
			for(var i in json){
				this[i] = json[i];
			}
		}

		update(){
			for(var input of this.inputs){
				if(input.direction){
					this.direction = input.direction;
				}

				if(input.u){
					this.x += Math.cos(this.direction) * this.speed;
					this.y += Math.sin(this.direction) * this.speed;
				}
			}
			this.inputs = [];
		}

		addInputs(inputs){
			this.inputs.push(inputs);
		}

		getInitData(){
			return {
				id:this.id,
				name:this.name,
				x:this.x,
				y:this.y,
				direction:this.direction,
				radius:this.radius,
				speed:this.speed
			}
		}

		getSnapshotData(){
			return {
				id:this.id,
				x:this.x,
				y:this.y,
				direction:this.direction
			}
		}
	}

	isServer ? module.exports = Player : window.Player = Player;
})();
