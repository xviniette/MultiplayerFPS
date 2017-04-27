"use strict";
class Raycasting {
	constructor(canvas, json) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.party = null;

		this.fov = 1.0472;

		this.FOV = 1.0472;

		this.nbRays = this.canvas.width;

		this.projectionPlane = {
			x: this.canvas.width,
			y: this.canvas.height
		}

		this.camera = {
			x: 0,
			y: 0,
			direction: 0
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

		// return {
		// 	x:x + Math.cos(angle) * 5,
		// 	y:y + Math.sin(angle) * 5,
		// }

		//Horizontale
		var first = {};
		if (angle > Math.PI) {
			first.y = Math.floor(y) - 0.000001;
			var Ya = -1;
		} else {
			first.y = Math.ceil(y);
			var Ya = 1;
		}


		first.x = x + (y - first.y) / Math.tan(angle);

		return first;

		var Xa = 1 / Math.tan(angle);

		var point = null;
		for (var i = 0;; i++) {
			var cx = first.x + i * Xa;
			var cy = first.y + i * Ya;
			if (this.party.map.isBlock(cx, cy)) {
				point = {
					x: cx,
					y: cy
				};
				break;
			}
		}

		//Verticale
		var first = {};
		if (angle > Math.PI * 1.5 || angle < Math.PI * 0.5) {
			first.x = Math.ceil(x);
			var Xa = 1;
		} else {
			first.x = Math.floor(x) - 0.000001;
			var Xa = -1;
		}

		first.y = y + (x - first.x) * Math.tan(angle);
		var Ya = Math.tan(angle);

		for (var i = 0;; i++) {
			var cx = first.x + i * Xa;
			var cy = first.y + i * Ya;
			if (this.party.map.isBlock(cx, cy)) {
				if (this.distance(x, y, cx, cy) < this.distance(x, y, point.x, point.y)) {
					point = {
						x: cx,
						y: cy
					};
				}
				break;
			}
		}

		return {
			x: point.x,
			y: point.y
		};
	}

	//http://zupi.free.fr/PTuto/index.php?ch=ptuto&p=ray#52
	//http://forums.mediabox.fr/wiki/tutoriaux/flashplatform/affichage/3d/raycasting/theorie/11-sources
	//http://permadi.com/1996/05/ray-casting-tutorial-table-of-contents/

	// getRay(x, y, angle){
	// 	var player = {
	// 		x,
	// 		y
	// 	};

	// 	var mapWidth = this.party.map.tiles.length;
	// 	var mapHeight = this.party.map.tiles[0].length;

	// 	var twoPI = Math.PI * 2;
	// 	angle %= twoPI;
	// 	if (angle < 0) angle += twoPI;

	// 	var right = (angle > twoPI * 0.75 || angle < twoPI * 0.25);
	// 	var up = (angle < 0 || angle > Math.PI);

	// 	var angleSin = Math.sin(angle);
	// 	var angleCos = Math.cos(angle);


	// 	var dist = 0;
	// 	var xHit = 0;
	// 	var yHit = 0;

	// 	var textureX;
	// 	var wallX;
	// 	var wallY;

	// 	var slope = angleSin / angleCos; 
	// 	var dX = right ? 1 : -1; 
	// 	var dY = dX * slope;

	// 	var x = right ? Math.ceil(player.x) : Math.floor(player.x);	
	// 	var y = player.y + (x - player.x) * slope;

	// 	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
	// 		var wallX = Math.floor(x + (right ? 0 : -1));
	// 		var wallY = Math.floor(y);

	// 		if (this.party.map.isBlock(wallX, wallY)) {

	// 			var distX = x - player.x;
	// 			var distY = y - player.y;
	// 			dist = distX*distX + distY*distY;	
	// 			textureX = y % 1;	
	// 			if (!right) textureX = 1 - textureX;

	// 			xHit = x;
	// 			yHit = y;

	// 			break;
	// 		}
	// 		x += dX;
	// 		y += dY;
	// 	}

	// 	var slope = angleCos / angleSin;
	// 	var dY = up ? -1 : 1;
	// 	var dX = dY * slope;
	// 	var y = up ? Math.floor(player.y) : Math.ceil(player.y);
	// 	var x = player.x + (y - player.y) * slope;

	// 	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
	// 		var wallY = Math.floor(y + (up ? -1 : 0));
	// 		var wallX = Math.floor(x);
	// 		if (this.party.map.isBlock(wallX, wallY)) {
	// 			var distX = x - player.x;
	// 			var distY = y - player.y;
	// 			var blockDist = distX*distX + distY*distY;
	// 			if (!dist || blockDist < dist) {
	// 				dist = blockDist;
	// 				xHit = x;
	// 				yHit = y;
	// 				textureX = x % 1;
	// 				if (up) textureX = 1 - textureX;
	// 			}
	// 			break;
	// 		}
	// 		x += dX;
	// 		y += dY;
	// 	}

	// 	return {x:xHit, y:yHit, ratio:textureX};
	// }

	// getRay(currentX, currentY, angle, dist = 0.1){
	// 	var minStep = 0.05;
	// 	while(true) {
	// 		if(this.party.map.isBlock(Math.floor(currentX), Math.floor(currentY))){
	// 			if(dist > minStep) {
	// 				currentX = currentX + Math.cos(angle + Math.PI) * dist;
	// 				currentY = currentY + Math.sin(angle + Math.PI) * dist;
	// 				dist *= 0.1;
	// 			} else {
	// 				var dx = currentX-Math.floor(currentX);
	// 				var dy = currentY-Math.floor(currentY);
	// 				var ratio = dx;
	// 				if(dx < dist || 1 - dx < dist){
	// 					ratio = dy;
	// 				}
	// 				var d = {x:currentX, y:currentY, blocx:Math.floor(currentX), blocy:Math.floor(currentY), ratio:ratio, angle:angle};
	// 				return d;
	// 			}
	// 		}

	// 		currentX += Math.cos(angle) * dist;
	// 		currentY += Math.sin(angle) * dist;
	// 	}
	// }

	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		var rays = this.getRays();

		// var toDraws = [];
		// for(var i in rays){
		// 	var ray = rays[i];
		// 	var dist = this.distance(this.camera.x, this.camera.y, ray.x, ray.y);
		// 	dist = dist * Math.cos(this.camera.direction - ray.angle);

		// 	toDraws.push({
		// 		type:"wall",
		// 		ray:ray,
		// 		distance:dist,
		// 		index:i
		// 	});
		// }

		// var objects = this.party.players;
		// for(var object of objects){
		// 	var deltaAngle = Math.atan2(object.y - this.camera.y, object.x - this.camera.x) - Math.atan2((this.camera.y + Math.sin(this.camera.direction) * 10) - this.camera.y, (this.camera.x + Math.cos(this.camera.direction) * 10) - this.camera.x)
		// 	var d = this.distance(object.x, object.y, this.camera.x, this.camera.y) * Math.cos(deltaAngle);
		// 	deltaAngle += this.fov/2;


		// 	toDraws.push({
		// 		type:"player",
		// 		player:object,
		// 		distance:d,
		// 		angle:deltaAngle,
		// 	});
		// }

		// toDraws.sort((a, b) => {
		// 	if(a.distance < b.distance){
		// 		return 1;
		// 	}
		// 	return -1;
		// });


		// for(var draw of toDraws){
		// 	if(draw.type == "wall"){
		// 		var ray = draw.ray;
		// 		var height = this.viewDist / draw.distance;
		// 		var width = this.canvas.width / this.nbRays;

		// 		this.ctx.fillStyle = "blue";
		// 		this.ctx.fillRect(draw.index * width, this.canvas.height * 0.5 - height * 0.5, width, height);

		// 		// ctx3D.drawImage(images.wall,
		// 		// 	ray.ratio * 64, 0,
		// 		// 	width, 64,
		// 		// 	draw.index * width, canvas3D.height/2 - height/2,
		// 		// 	width, height);
		// 	}

		// 	if(draw.type == "player"){
		// 		var height = this.viewDist / draw.distance;
		// 		var xPosition = draw.angle/this.fov * this.canvas.width;
		// 		var width = height * 0.5;

		// 		this.ctx.fillStyle = "yellow";
		// 		this.ctx.fillRect(xPosition, this.canvas.height * 0.5 - height * 0.5, width, height);

		//               this.ctx.font = "24px Arial";
		//               this.ctx.textAlign = "center";
		//               this.ctx.fillText(draw.player.name, xPosition, this.canvas.height * 0.5 - height * 0.5);

		// 		// ctx3D.drawImage(images.lampadaire, 0, 0, images.lampadaire.width, images.lampadaire.height, xPosition, canvas3D.height/2 - height/2, height/images.lampadaire.height * images.lampadaire.width, height);
		// 	}
		// }
	}

	distance(sx, sy, x, y) {
		return Math.sqrt(Math.pow(sx - x, 2) + Math.pow(sy - y, 2));
	}

}