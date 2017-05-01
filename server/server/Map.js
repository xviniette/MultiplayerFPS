"use strict";
(() => {
	var isServer = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

	class Map{
		constructor(json){
			this.tiles = [];
			this.objects = [];

			this.init(json);
		}

		init(json){
			for(var i in json){
				this[i] = json[i];
			}
		}

		getInitData(){
			return {
				tiles:this.tiles,
				objects:this.objects
			}
		}

		isBlock(x, y){
			x = Math.floor(x);
			y = Math.floor(y);

			if(this.tiles[x] == undefined || this.tiles[x][y] == undefined){
				return 1;
			}
			return this.tiles[x][y];
		}

		generate(width, height, ratio){
			this.tiles = [];
			for(var i = 0; i < width; i++){
				this.tiles[i] = [];
				for(var j = 0; j < height; j++){
					if(Math.random() < ratio){
						this.tiles[i][j] = Math.ceil(Math.random() * 4);
					}else{
						this.tiles[i][j] = 0;
					}
				}
			}
		}

		getRandomSpawn(){
			return {
				x:Math.random() * (this.tiles.length - 1),
				y:Math.random() * (this.tiles[0].length - 1),
				direction:Math.random() * Math.PI * 2
			}
		}
	}

	isServer ? module.exports = Map : window.Map = Map;
})();
