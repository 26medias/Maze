function game_maze(options) {
	this.options 	= options;
	this.map 		= [];	// original loaded level
	this.mapbg	= [];	// background level	/ things that are static
	this.mapfg	= [];	// foreground level / things that move
	
	this.blockSize	= 30;
};
game_maze.prototype.init = function() {
	this.loadLevel();
	this.stage = new fabric.StaticCanvas(this.options.canvasId);
	
	// events
	$(window).bind("keypress", function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		console.log("code",code);
		switch (code) {
			case 37:
				// left
				this.move(-1,0);
			break;
			case 38:
				// up
				this.move(0,-1);
			break;
			case 39:
				// right
				this.move(1,0);
			break;
			case 40:
				// down
				this.move(0,1);
			break;
		}
	});
};
game_maze.prototype.loadLevel = function() {
	var scope = this;
	$.ajax({
		url: 		this.options.level,
		dataType:	"text",
		type:		"GET",
		data:		{},
		success: 	function(data){
			scope.processLevel(data);
		}
	});
};
game_maze.prototype.move = function(x,y) {
	var scope = this;
	
};
game_maze.prototype.processLevel = function(data) {
	var i;
	var lines = data.split("\r\n");
	
	for (i=0;i<lines.length;i++) {
		this.map.push(lines[i].split(""));
	}
	
	// process BG and FG levels
	var x, y, l1, l2;
	l1 		= this.map.length;
	l2 		= this.map[0].length;
	
	for (y=0;y<l1;y++) {
		for (x=0;x<l2;x++) {
			if (this.map[y][x].toString() == "1" || this.map[y][x].toString() == "0") {
				// BG
				
			} else {
				// FG
			}
		}
	}
	
	this.renderlevel();
};
game_maze.prototype.renderlevel = function() {
	
	var x, y, l1, l2;
	l1 		= this.map.length;
	l2 		= this.map[0].length;
	
	for (y=0;y<l1;y++) {
		for (x=0;x<l2;x++) {
			this.renderBlock(x,y,this.map[y][x]);
		}
	}
};
game_maze.prototype.renderBlock = function(x, y, blockValue) {
	
	switch (blockValue.toString()) {
		case "1":
			var rect = new fabric.Rect({
				left: 	x*this.blockSize,
				top: 	y*this.blockSize,
				fill: 	'black',
				width: 	this.blockSize,
				height: this.blockSize
			});
			this.stage.add(rect);
		break;
		case "p":
			var circle = new fabric.Circle({
				left: 	x*this.blockSize,
				top: 	y*this.blockSize,
				fill: 	'red',
				radius:	this.blockSize/2
			});
			this.stage.add(circle);
		break;
		case "e":
			var rect = new fabric.Rect({
				left: 	x*this.blockSize,
				top: 	y*this.blockSize,
				fill: 	'green',
				width: 	this.blockSize,
				height: this.blockSize
			});
			this.stage.add(rect);
		break;
		default:
		break;
	}
};