"use strict";
class Raycasting {
	constructor(canvas, json) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.party = null;
		this.map = {
			walls:[],
			floor:[],
			ceiling:[]
		}

		this.entities = [];

		this.FOV = 1.0472;

		this.nbRays = this.canvas.width;

		this.textures = {};
		this.mapTexture = {};

		this.projectionPlane = {
			x: this.canvas.width,
			y: this.canvas.height
		}

		this.camera = {
			x: 0,
			y: 0,
			direction: 0,
			height: this.projectionPlane.y/2
		}

		this.init(json);
	}

	init(json) {
		for (var i in json) {
			this[i] = json[i];
		}
	}

	projectionCenter() {
		return {
			x: this.projectionPlane.x / 2,
			y: this.projectionPlane.y / 2,
		};
	}

	getIntervalAngle() {
		return this.FOV / (this.projectionPlane.x - 1);
	}

	viewDistance() {
		return (this.canvas.width / 2) / Math.tan((this.FOV) / 2);
	}

	getRays() {
		var rays = [];

		if (this.projectionPlane.x == 1) {
			rays.push(this.getRay(this.camera.x, this.camera.y, this.camera.direction));
			return rays;
		}

		for (var i = 0; i < this.projectionPlane.x; i++) {
			var angle = this.camera.direction - this.FOV / 2 + this.getIntervalAngle() * i;
			rays.push(this.getRay(this.camera.x, this.camera.y, angle));
		}
		return rays;
	}

	getRay(x, y, angle) {
		var twoPI = Math.PI * 2;
		angle %= twoPI;
		if (angle < 0) angle += twoPI;

		var first = {};
		if (angle > Math.PI) {
			first.y = Math.floor(y) - 0.000001;
			var Ya = -1;
			var Xa = (1 / Math.tan(angle))*-1;

		} else {
			first.y = Math.ceil(y);
			var Ya = 1;
			var Xa = 1 / Math.tan(angle);
		}


		first.x = x + (y - first.y) / Math.tan(-angle);

		var point = null;
		for (var i = 0;; i++) {
			var cx = first.x + i * Xa;
			var cy = first.y + i * Ya;
			if (this.party.map.isBlock(cx, cy)) {
				point = {
					x: cx,
					y: cy,
					ratio:cx%1
				};
				break;
			}
		}

		//Verticale
		var first = {};
		if (angle > Math.PI * 1.5 || angle < Math.PI * 0.5) {
			first.x = Math.ceil(x);
			var Xa = 1;
			var Ya = Math.tan(angle);
		} else {
			first.x = Math.floor(x) - 0.000001;
			var Xa = -1;
			var Ya = Math.tan(angle) * -1;
		}

		first.y = y + (x - first.x) * Math.tan(-angle);


		for (var i = 0;; i++) {
			var cx = first.x + i * Xa;
			var cy = first.y + i * Ya;
			if (this.party.map.isBlock(cx, cy)) {
				if (this.distance(x, y, cx, cy) < this.distance(x, y, point.x, point.y)) {
					point = {
						x: cx,
						y: cy,
						ratio:cy%1
					};
				}
				break;
			}
		}

		return {
			x: point.x,
			y: point.y,
			angle:angle,
			ratio:point.ratio
		};
	}

	//http://zupi.free.fr/PTuto/index.php?ch=ptuto&p=ray#52
	//http://forums.mediabox.fr/wiki/tutoriaux/flashplatform/affichage/3d/raycasting/theorie/11-sources
	//http://permadi.com/1996/05/ray-casting-tutorial-table-of-contents/

	render(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(this.party == null) return;
		var rays = this.getRays();

		for(var i in rays){
			var ray = rays[i];
			var distance = this.distance(ray.x, ray.y, this.camera.x, this.camera.y) * Math.cos(this.camera.direction - ray.angle);

			//WALLS
			var height = this.viewDistance()/distance;
			var width = this.canvas.width/this.projectionPlane.x;
			var tile = this.party.map.isBlock(ray.x, ray.y);
			if(tile && this.textures[this.mapTexture[tile].image]){
				var texture = this.mapTexture[tile];
				this.ctx.drawImage(this.textures[texture.image],
					texture.x + ray.ratio * texture.width, texture.y,
					width, texture.height,
					i * width, canvas3D.height/2 - height/2,
					width, height);
			}else{
				this.ctx.fillRect(i * width, this.canvas.height * 0.5 - height * 0.5, width, height);
			}

			//FLOOR


		}
	}

/*
	render() {
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
				var height = this.viewDistance() / draw.distance;
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
				var height = this.viewDistance() / draw.distance;
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
	}*/

	distance(sx, sy, x, y) {
		return Math.sqrt(Math.pow(sx - x, 2) + Math.pow(sy - y, 2));
	}

}