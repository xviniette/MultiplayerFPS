"use strict";

//http://zupi.free.fr/PTuto/index.php?ch=ptuto&p=ray#52
//http://forums.mediabox.fr/wiki/tutoriaux/flashplatform/affichage/3d/raycasting/theorie/11-sources
//http://permadi.com/1996/05/ray-casting-tutorial-table-of-contents/

class Raycasting {
	constructor(canvas, json) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");

		this.map = {
			wall: [],
			floor: [],
			ceiling: []
		}
		this.entities = [];

		this.elements = {
			sky:{
				image:null,
				color:"#83a8e2"
			},
			ground:{
				image:null,
				color:"#7a581e"
			}
		}


		this.ceilColor = null;


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
			height: this.projectionPlane.y / 2
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
		return (this.projectionPlane.x / 2) / Math.tan((this.FOV) / 2);
	}

	getTile(x, y, type = "wall") {
		x = Math.floor(x);
		y = Math.floor(y);
		if (this.map[type] == undefined || this.map[type][x] == undefined || this.map[type][x][y] == undefined) {
			return null;
		}

		return this.map[type][x][y];
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
			var Xa = (1 / Math.tan(angle)) * -1;

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
			var tile = this.getTile(cx, cy);
			if (tile != 0) {
				point = {
					x: cx,
					y: cy,
					ratio: cx % 1
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
			var tile = this.getTile(cx, cy);
			if (tile != 0) {
				if (this.distance(x, y, cx, cy) < this.distance(x, y, point.x, point.y)) {
					point = {
						x: cx,
						y: cy,
						ratio: cy % 1
					};
				}
				break;
			}
		}

		return {
			x: point.x,
			y: point.y,
			angle: angle,
			ratio: point.ratio
		};
	}



	render() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(this.elements.sky && this.elements.sky.color){
			this.ctx.fillStyle = this.elements.sky.color;
			this.ctx.fillRect(0, 0, this.projectionPlane.x, this.projectionPlane.y/2);
		}

		if(this.elements.ground && this.elements.ground.color){
			this.ctx.fillStyle = this.elements.ground.color;
			this.ctx.fillRect(0, this.projectionPlane.y/2, this.projectionPlane.x, this.projectionPlane.y / 2);
		}

		var toRender = [];

		var rays = this.getRays();
		for (var i in rays) {
			var ray = rays[i];
			toRender.push({
				type: "wall",
				index: i,
				ray: ray,
				distance: this.distance(ray.x, ray.y, this.camera.x, this.camera.y) * Math.cos(this.camera.direction - ray.angle)
			});
		}

		var twoPI = Math.PI * 2;
		for (var entity of this.entities) {
			var angle = Math.atan2(entity.y - this.camera.y, entity.x - this.camera.x) - Math.atan2((this.camera.y + Math.sin(this.camera.direction) * 10) - this.camera.y, (this.camera.x + Math.cos(this.camera.direction) * 10) - this.camera.x)

			toRender.push({
				type: "entity",
				entity: entity,
				distance: this.distance(entity.x, entity.y, this.camera.x, this.camera.y) * Math.cos(angle),
				angle: angle
			});
		}

		toRender.sort((a, b) => {
			return (b.distance - a.distance);
		});

		for (var render of toRender) {
			switch (render.type) {
				case "wall":
					var ray = render.ray;
					var height = this.viewDistance() / render.distance;
					var width = this.canvas.width / this.projectionPlane.x;
					var tile = this.getTile(ray.x, ray.y);

					if (tile != null && tile != 0) {
						if (this.mapTexture[tile] && this.textures[this.mapTexture[tile].image]) {
							var texture = this.mapTexture[tile];
							this.ctx.drawImage(this.textures[texture.image],
								texture.x + ray.ratio * texture.width, texture.y,
								width, texture.height,
								render.index * width, this.projectionPlane.y / 2 - height / 2,
								width, height);
						} else {
							this.ctx.fillStyle = "black";
							this.ctx.fillRect(render.index * width, this.projectionPlane.y * 0.5 - height * 0.5, width, height);
						}
					}
					break;

				case "entity":
					var height = this.viewDistance() / render.distance * entity.height;
					var width = entity.width != null ? entity.width * height : entity.image != null ? entity.image.width/entity.image.height * height : height * 0.5;
					var x = ((render.angle + this.FOV / 2) / this.FOV) * this.projectionPlane.x - width/2;
					
					if(entity.image){
						this.ctx.drawImage(entity.image, x, this.projectionPlane.y * 0.5 - height * 0.5, width, height);
					}else{
						this.ctx.fillStyle = entity.color;
						this.ctx.fillRect(x, this.projectionPlane.y * 0.5 - height * 0.5, width, height);
					}
					break;
				default:
					break;
			}
		}
	}

	distance(sx, sy, x, y) {
		return Math.sqrt(Math.pow(sx - x, 2) + Math.pow(sy - y, 2));
	}

}