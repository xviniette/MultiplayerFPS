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
	}

	isServer ? module.exports = Map : window.Map = Map;
})();
