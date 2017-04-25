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
			if(this.tiles[x] != undefined && this.tiles[x][y] != undefined && this.tiles[x][y] == 0){
				return false;
			}
			return true;
		}

		generate(width, height, ratio){
			this.tiles = [];
			for(var i = 0; i < width; i++){
				this.tiles[i] = [];
				for(var j = 0; j < height; j++){
					if(Math.random() < ratio){
						this.tiles[i][j] = 1;
					}else{
						this.tiles[i][j] = 0;
					}
				}
			}
		}
	}

	isServer ? module.exports = Map : window.Map = Map;
})();
