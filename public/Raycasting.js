"use strict";
class Raycasting
{
	constructor(canvas, json){
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.fov = 1.0472;
		this.nbRays = this.canvas.width;
		this.viewDist = (this.canvas.width/2) / Math.tan((this.fov / 2));

		this.camera = {
			x:0,
			y:0,
			direction:0
		}

		this.init(json);

		this.party = null;
	}

	init(json){
		for(var i in json){
			this[i] = json[i];
		}
	}

	getRays(){
		var rays = [];
		var radian_fov = this.fov;
		var interval = radian_fov/(this.nbRays-1);
		if(this.nbRays - 1 == 0) interval = 0;
		for(var i = 0; i < this.nbRays; i++){
			var angle = this.camera.direction - radian_fov/2 + interval * i;
			rays.push(this.getRay(this.camera.x, this.camera.y, angle));
		}
		return rays;
	}

	getRay(currentX, currentY, angle, dist = 0.1){
		var minStep = 0.05;
		while(true) {
			if(this.party.map.isBlock(Math.floor(currentX), Math.floor(currentY))){
				if(dist > minStep) {
					currentX = currentX + Math.cos(angle + Math.PI) * dist;
					currentY = currentY + Math.sin(angle + Math.PI) * dist;
					dist *= 0.1;
				} else {
					var dx = currentX-Math.floor(currentX);
					var dy = currentY-Math.floor(currentY);
					var ratio = dx;
					if(dx < dist || 1 - dx < dist){
						ratio = dy;
					}
					var d = {x:currentX, y:currentY, blocx:Math.floor(currentX), blocy:Math.floor(currentY), ratio:ratio, angle:angle};
					return d;
				}
			}

			currentX += Math.cos(angle) * dist;
			currentY += Math.sin(angle) * dist;
		}
	}

	render(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		var rays = this.getRays();

		var toDraws = [];
		for(var i in rays){
			var ray = rays[i];
			var dist = this.distance(this.camera.x, this.camera.y, ray.x, ray.y);
			dist = dist * Math.cos(this.camera.direction - ray.angle);

			toDraws.push({
				type:"wall",
				ray:ray,
				distance:dist,
				index:i
			});
		}

		var objects = this.party.players;
		for(var object of objects){
			var deltaAngle = Math.atan2(object.y - this.camera.y, object.x - this.camera.x) - Math.atan2((this.camera.y + Math.sin(this.camera.direction) * 10) - this.camera.y, (this.camera.x + Math.cos(this.camera.direction) * 10) - this.camera.x)
			var d = this.distance(object.x, object.y, this.camera.x, this.camera.y) * Math.cos(deltaAngle);
			deltaAngle += this.fov/2;


			toDraws.push({
				type:"player",
				player:object,
				distance:d,
				angle:deltaAngle,
			});
		}

		toDraws.sort((a, b) => {
			if(a.distance < b.distance){
				return 1;
			}
			return -1;
		});


		for(var draw of toDraws){
			if(draw.type == "wall"){
				var ray = draw.ray;
				var height = this.viewDist / draw.distance;
				var width = this.canvas.width / this.nbRays;

				this.ctx.fillStyle = "blue";
				this.ctx.fillRect(draw.index * width, this.canvas.height * 0.5 - height * 0.5, width, height);

				// ctx3D.drawImage(images.wall,
				// 	ray.ratio * 64, 0,
				// 	width, 64,
				// 	draw.index * width, canvas3D.height/2 - height/2,
				// 	width, height);
			}

			if(draw.type == "player"){
				var height = this.viewDist / draw.distance;
				var xPosition = draw.angle/this.fov * this.canvas.width;
				var width = height * 0.5;
				
				this.ctx.fillStyle = "yellow";
				this.ctx.fillRect(xPosition, this.canvas.height * 0.5 - height * 0.5, width, height);

                this.ctx.font = "24px Arial";
                this.ctx.textAlign = "center";
                this.ctx.fillText(draw.player.name, xPosition, this.canvas.height * 0.5 - height * 0.5);

				// ctx3D.drawImage(images.lampadaire, 0, 0, images.lampadaire.width, images.lampadaire.height, xPosition, canvas3D.height/2 - height/2, height/images.lampadaire.height * images.lampadaire.width, height);
			}
		}



		// for(var i in rays){
		// 	var ray = rays[i];
		// 	var dist = this.distance(this.camera.x, this.camera.y, ray.x, ray.y);
		// 	dist = dist * Math.cos(this.camera.direction - ray.angle);
		// 	var height = this.viewDist / dist;
		// 	var width = this.canvas.width / this.nbRays;
		// 	this.ctx.fillStyle = "blue";
		// 	this.ctx.fillRect(i * width, this.canvas.height * 0.5 - height * 0.5, width, height);
		// }
	}

	distance(sx, sy, x, y){
		return Math.sqrt(Math.pow(sx - x, 2) + Math.pow(sy - y, 2));
	}

}