function mazeEditor(options) {
	var scope 		= this;
	
	this.options 	= $.extend({
		width:		25,
		height:		25,
		blockSize:	20,
		editor:		true,
		trail:		true,
		difficulty:	10,
		opacity:	{
			active:		0.9,
			inactive:	0.00
		}
	},options);
	
	this.walls		= {
		"v":	[],
		"h":	[]
	};
	
	this.action	= "break";
	
	this.dragging 	= false;
	this.playing 	= false;
	this.generating	= false;
	this.lastpos	= {x:0,y:0};
	this.lastmove	= {x:0,y:0};
	
	this.solutionPath = [];

	this.stage 		= Raphael(this.options.canvasId);
	
	
	this.marker		= this.stage.rect(-50,0,this.options.blockSize,this.options.blockSize);
	this.marker.attr("fill", "#ffcc00");
	this.marker.attr("opacity", 0);
	this.marker.attr("stroke-width", 0);
	
	
	this._startpoint	= this.stage.rect(-50,0,this.options.blockSize,this.options.blockSize);
	this._startpoint.attr("fill", "#80AC0B");
	this._startpoint.attr("opacity", 1);
	this._startpoint.attr("stroke-width", 0);
	this.startpoint = {x:0,y:0};
	
	this._endpoint	= this.stage.rect(-50,0,this.options.blockSize,this.options.blockSize);
	this._endpoint.attr("fill", "#AC007C");
	this._endpoint.attr("opacity", 1);
	this._endpoint.attr("stroke-width", 0);
	this.endpoint = {x:0,y:0};

	this._string	= this.stage.rect(200,200,2,50);
	this._string.attr("fill", "#000000");
	this._string.attr("opacity", 1);
	this._string.attr("stroke-width", 0);
	this._string.attr("height", 0);
	
	$(window).bind("keydown", function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		console.log("code",code);
		switch (code) {
			case 37:
				// left
				scope.move(-1,0);
			break;
			case 38:
				// up
				scope.move(0,-1);
			break;
			case 39:
				// right
				scope.move(1,0);
			break;
			case 40:
				// down
				scope.move(0,1);
			break;
		}
	});
};
mazeEditor.prototype.init = function() {
	var scope = this;
	// events
	$("#"+this.options.canvasId).bind("mousedown", function(e) {
		scope.dragging = true;
		scope.lastpos.x = 0;
		scope.lastpos.y = 0;
	});
	$("#"+this.options.canvasId).bind("mouseup", function(e) {
		scope.dragging 	= false;
		scope.marker.attr("x",-50);
		scope._string.attr("height", 0);
	});
	$("#"+this.options.canvasId).bind("mousemove", function(e) {
		if (scope.dragging) {
			var pos = $(this).position();
			scope.handleDrag(e.clientX - pos.left, e.clientY - pos.top);
			var px = scope.startpoint.x*scope.options.blockSize+scope.options.blockSize/2;
			var py = scope.startpoint.y*scope.options.blockSize+scope.options.blockSize/2;
			var angle = Math.atan2((e.clientY - pos.top) - py, e.clientX - pos.left - px);
			scope._string.transform("r"+Math.round(angle*180/3.14159-90)+","+px+","+py+"");
			var len = Math.sqrt(((e.clientY - pos.top) - py) * ((e.clientY - pos.top) - py) + (e.clientX - pos.left - px) * (e.clientX - pos.left - px))
			scope._string.attr("height", len);
			scope._string.attr("x", px);
			scope._string.attr("y", py);
			scope._string.toFront();
		}
	});
	
	this.generateGrid();
};
mazeEditor.prototype.play = function() {
	var scope = this;
	
	// Deactivate the editor
	this.options.editor = false;
	
};
mazeEditor.prototype.move = function(vx,vy) {
	var scope = this;
	
	
	if (vx > 1) {
		vx = 1;
	} else if (vx < -1) {
		vx = -1;
	}
	
	if (vy > 1) {
		vy = 1;
	} else if (vy < -1) {
		vy = -1;
	}
	
	if (vx != 0 && vy != 0) {
		if (this.canMove(vx,0)) {
			vy = 0;
		} else if (this.canMove(0,vy)) {
			vx = 0;
		}
	}
	
	
	// current are in this.startpoint{x,y}
	var newPos = {
		x: this.startpoint.x + vx,
		y: this.startpoint.y + vy
	};
	
	// same pos, don't move
	if (this.lastmove.x == newPos.x && this.lastmove.y == newPos.y) {
		return false;
	}
	this.lastmove.x = newPos.x;
	this.lastmove.y = newPos.y;
	
	if (this.canMove(vx,vy)) {
		// save the new position
		this.startpoint = {
			x:	this.startpoint.x+vx,
			y:	this.startpoint.y+vy
		};
		// Move the player
		this._startpoint.attr("x", this.startpoint.x*this.options.blockSize);
		this._startpoint.attr("y", this.startpoint.y*this.options.blockSize);
		// Create the trail
		if (this.options.trail) {
			var trail	= this.stage.rect(this.startpoint.x*this.options.blockSize,this.startpoint.y*this.options.blockSize,this.options.blockSize,this.options.blockSize);
			trail.attr("fill", "#ffffff");
			trail.attr("opacity", 0.1);
			trail.attr("stroke-width", 0);
		}
		this._startpoint.toFront();
		if (this.startpoint.x == this.endpoint.x && this.startpoint.y == this.endpoint.y) {
			alert("YOU WON!");
		}
	}
};
mazeEditor.prototype.canMove = function(vx,vy) {
	var canMove = true;
	if (vx == 1) {
		canMove = canMove && !this.walls["v"][this.startpoint.x+1][this.startpoint.y].state;
	}
	if (vx == -1) {
		canMove = canMove && !this.walls["v"][this.startpoint.x][this.startpoint.y].state;
	}
	if (vy == 1) {
		canMove = canMove && !this.walls["h"][this.startpoint.x][this.startpoint.y+1].state;
	}
	if (vy == -1) {
		canMove = canMove && !this.walls["h"][this.startpoint.x][this.startpoint.y].state;
	}
	return canMove;
};
mazeEditor.prototype.handleDrag = function(x,y) {
	
	var x2 = Math.floor((x)/this.options.blockSize);
	var y2 = Math.floor((y)/this.options.blockSize);
	
	
	
	if (!this.options.editor) {
		// get direction
		var dir = {
			x:	x2 - this.startpoint.x,
			y:	y2 - this.startpoint.y
		};
		
		this.move(dir.x,dir.y);
		
		return false;
	} else {
		// no change
		if (this.lastpos.x == x2 && this.lastpos.y == y2) {
			return false;
		}
		// get direction
		var dir = {
			x:	x2 - this.lastpos.x,
			y:	y2 - this.lastpos.y
		};
		
		// Update the last known position
		this.lastpos.x = x2;
		this.lastpos.y = y2;
		
		if (Math.abs(dir.x) > 1 || Math.abs(dir.y) > 1) {
			return false;
		}
	}
	
	if (Math.abs(dir.x) > Math.abs(dir.y)) {
		type = "h";
	} else {
		type = "v";
	}
	
	
	
	if (this.action == "startpoint") {
		this._startpoint.attr("x", x2*this.options.blockSize);
		this._startpoint.attr("y", y2*this.options.blockSize);
		this.startpoint = {
			x:	x2,
			y:	y2
		};
		this.export();
		return true;
	}
	if (this.action == "endpoint") {
		this._endpoint.attr("x", x2*this.options.blockSize);
		this._endpoint.attr("y", y2*this.options.blockSize);
		this.endpoint = {
			x:	x2,
			y:	y2
		};
		this.export();
		return true;
	}
	
	
	// If the wall doesn't exist, we skip (close to the border)
	if (!this.walls[type] || !this.walls[type][x2] || !this.walls[type][x2][y2]) {
		return false;
	}
	
	// Move the marker to show our position
	this.marker.attr("x", x2*this.options.blockSize);
	this.marker.attr("y", y2*this.options.blockSize);
	
	if (this.action == "break") {
		if (dir.x == 1) {
			// right
			this.deactivateWall("v",x2,y2);
		}
		if (dir.x == -1) {
			// left
			this.deactivateWall("v",x2+1,y2);
		}
		if (dir.y == 1) {
			// down
			this.deactivateWall("h",x2,y2);
		}
		if (dir.y == -1) {
			// up
			this.deactivateWall("h",x2,y2+1);
		}
	}
	if (this.action == "construct") {
		if (dir.x == 1) {
			// right
			this.activateWall("v",x2,y2);
		}
		if (dir.x == -1) {
			// left
			this.activateWall("v",x2+1,y2);
		}
		if (dir.y == 1) {
			// down
			this.activateWall("h",x2,y2);
		}
		if (dir.y == -1) {
			// up
			this.activateWall("h",x2,y2+1);
		}
	}
	
	
	return dir;
};
mazeEditor.prototype.activateWall = function(type,x,y) {
	if (!this.walls[type] || !this.walls[type][x] || !this.walls[type][x][y]) {
		return false;
	}
	this.walls[type][x][y].el.attr("opacity", this.options.opacity.active);
	this.walls[type][x][y].state = true;
	this.export();
};
mazeEditor.prototype.deactivateWall = function(type,x,y) {
	if (!this.walls[type] || !this.walls[type][x] || !this.walls[type][x][y]) {
		return false;
	}
	//this.walls[type][x][y].el.glow();
	this.walls[type][x][y].el.attr("opacity", this.options.opacity.inactive);
	this.walls[type][x][y].state = false;
	this.export();
};
mazeEditor.prototype.export = function() {
	var x;
	var y;
	var t;
	
	if (!this.options.textarea) {
		return false;
	}
	
	if (this.generating) {
		return false;
	}
	
	var buffer = {
		start:	this.startpoint,
		end:	this.endpoint
	};
	for (t in this.walls) {
		buffer[t] = []
		for (x=0;x<this.walls[t].length;x++) {
			buffer[t][x] = []
			for (y=0;y<this.walls[t][x].length;y++) {
				buffer[t][x][y] = this.walls[t][x][y].state?1:0;
			}
		}
	}
	this.options.textarea.val(JSON.stringify(buffer));
};

mazeEditor.prototype.generateGrid = function() {
	var x;
	var y;
	for (x=0;x<this.options.width;x++) {
		for (y=0;y<this.options.height;y++) {
			this.createWall(x,y,"h");
			this.createWall(x,y,"v");
		}
	}
	return true;
};
mazeEditor.prototype.createWall = function(x,y,type) {
	var scope = this;
	
	if (this.walls[type] && this.walls[type][x] && this.walls[type][x][y]) {
		// Reactivate the wall
		this.walls[type][x][y].state = true;
		this.walls[type][x][y].el.attr("opacity", this.options.opacity.active);
	} else {
		// Create the wall
		switch (type) {
			case "h":
				var wall = this.stage.rect(x*this.options.blockSize-1,y*this.options.blockSize-1,this.options.blockSize+3,3);
			break;
			case "v":
				var wall = this.stage.rect(x*this.options.blockSize-1,y*this.options.blockSize-1,3,this.options.blockSize+3);
			break;
		}
		if (!this.walls[type][x]) {
			this.walls[type][x] = [];
		}
		if (!this.walls[type][x][y]) {
			this.walls[type][x][y] = {};
		}
		this.walls[type][x][y] = {
			el:		wall,
			state:	true
		};
		
		wall.attr("fill", "#ffffff");
		wall.attr("opacity", this.options.opacity.active);
		wall.attr("stroke-width", 0);
		
		wall.hover(function() {
			if (!scope.dragging && scope.options.editor) {
				$("#"+scope.options.canvasId).css("cursor","pointer");
			}
		},function() {
			$("#"+scope.options.canvasId).css("cursor","default");
		});
		
		wall.click(function() {
			if (!scope.options.editor) {
				return false;
			}
			if (scope.walls[type][x][y].state) {
				scope.deactivateWall(type,x,y);
			} else {
				scope.activateWall(type,x,y);
			}
			
		});
	}
	return true;
};
mazeEditor.prototype.load = function(data) {
	var scope 	= this;
	
	this.clearPaths();
	
	// Display the start and end pos
	this._startpoint.attr("x", data.start.x*this.options.blockSize);
	this._startpoint.attr("y", data.start.y*this.options.blockSize);
	this.startpoint = data.start;
	
	this._endpoint.attr("x",  data.end.x*this.options.blockSize);
	this._endpoint.attr("y", data.end.y*this.options.blockSize);
	this.endpoint = data.end;
	
	// Generate the map
	var x;
	var y;
	var type = {h:1,v:1};
	for (t in type) {
		for (x=0;x<data[t].length;x++) {
			for (y=0;y<data[t][x].length;y++) {
				if (data[t][x][y] == 1) {
					scope.activateWall(t,x,y);
				}
				if (data[t][x][y] == 0) {
					scope.deactivateWall(t,x,y);
				}
			}
		}
	}
};
mazeEditor.prototype.reload = function() {
	var scope 	= this;
	
	this.clearPaths();
	
	// Parse the data
	var data 	= JSON.parse(this.options.textarea.val());
	
	// Display the start and end pos
	this._startpoint.attr("x", data.start.x*this.options.blockSize);
	this._startpoint.attr("y", data.start.y*this.options.blockSize);
	this.startpoint = data.start;
	
	this._endpoint.attr("x",  data.end.x*this.options.blockSize);
	this._endpoint.attr("y", data.end.y*this.options.blockSize);
	this.endpoint = data.end;
	
	// Generate the map
	var x;
	var y;
	var type = {h:1,v:1};
	for (t in type) {
		for (x=0;x<data[t].length;x++) {
			for (y=0;y<data[t][x].length;y++) {
				if (data[t][x][y] == 1) {
					scope.activateWall(t,x,y);
				}
				if (data[t][x][y] == 0) {
					scope.deactivateWall(t,x,y);
				}
			}
		}
	}
};

mazeEditor.prototype.clearPaths = function() {
	var i;
	
	// remove the possible solutions
	for (i=0;i<this.solutionPath.length;i++) {
		this.solutionPath[i].remove();
	}
	this.solutionPath = [];
}

mazeEditor.prototype.generate = function() {
	/*
		LOUTRE-HUNTER ALGORITHM
	*/
	var scope 	= this;
	var x;
	var y;
	
	this.generating = true;
	
	this.clearPaths();
	
	// Generate the visited blocks
	this.visited = [];
	for (x=0;x<this.options.width;x++) {
		for (y=0;y<this.options.height;y++) {
			if (!this.visited[x]) {
				this.visited[x] = [];
			}
			this.visited[x][y] = false;
		}
	}
	
	
	//console.log("this.generateGrid()",this.generateGrid());
	
	// Regenerate the grid
	if (this.generateGrid()) {
		
		this.genPos = {
			x: 0,
			y: 0
		};
		this.lastDir = {
			x: 0,
			y: 0
		}
		this.corners = [];
		this.cornerIndex = 0;
		this.visited[0][0] = true;
		
		var walk = this.randomWalk();
		
		this.generating = false;
		
		this.export();
	}
	
	this.startpoint = {
		x:	0,
		y:	0
	};
	this.endpoint = {
		x:	this.options.width-1,
		y:	this.options.height-1
	};
	this._startpoint.attr("x", this.startpoint.x*this.options.blockSize);
	this._startpoint.attr("y", this.startpoint.y*this.options.blockSize);
	this._endpoint.attr("x", this.endpoint.x*this.options.blockSize);
	this._endpoint.attr("y", this.endpoint.y*this.options.blockSize);
	
};
mazeEditor.prototype.hunt = function() {
	var scope 	= this;
	var i;
	var x;
	var y;
	
	// Search for a corner we could walk from
	if (this.corners.length == 0) {
		return true;
	}
	
	// Find where to start searching, based on the difficulty
	var start = Math.round(((10-this.options.difficulty)/10)*(this.corners.length-1));
	if (start < 0) {
		start = 0;
	}
	
	for (i=start;i<this.corners.length;i++) {
		if (this.isCaseWalkable(this.corners[i][0],this.corners[i][1])) {
			this.genPos = {
				x: this.corners[i][0],
				y: this.corners[i][1]
			};
			return this.randomWalk();
		} else {
			// not walkable, we remove from the list
			this.corners.splice(i,1);
		}
	}
	
	if (this.corners.length > 0) {
		return this.hunt();
	}
	
	return true;
};
mazeEditor.prototype.isCaseWalkable = function(x, y) {
	// Check all 4 direction and only get what is available
	var available = [];
	for (i=-1;i<=1;i++) {
		for (j=-1;j<=1;j++) {
			//console.log(">",i,j,Math.abs(j) == Math.abs(j));
			if (Math.abs(i) == Math.abs(j)) {
				continue;
			}
			if (x+i >= this.options.width || x+i < 0 || y+j >= this.options.height || y+j < 0) {
				continue;
			}
			if (!this.visited[x+i][y+j]) {
				available.push([i,j]);
			}
		}
	}
	// Nowhere to go, we are done walking. Let's hunt.
	if (available.length == 0) {
		return false;
	}
	return available;
}
mazeEditor.prototype.randomWalk = function() {
	var scope 	= this;
	var x;
	var y;
	
	available = this.isCaseWalkable(this.genPos.x,this.genPos.y);
	if (available === false) {
		return this.hunt();
	}
	
	var rnd = Math.round(Math.random()*(available.length-1));
	
	var move = {
		x:	available[rnd][0],
		y:	available[rnd][1]
	};
	if (move.x != this.lastDir.x && move.y != this.lastDir.y) {
		// We just turned.
		// Register this corner
		this.corners.push([this.genPos.x,this.genPos.y]);
	}
	// reset the corner cursor to the end of the stack
	this.cornerIndex = this.corners.length-1;
	// Save the last direction took
	this.lastDir = {
		x:	move.x,
		y:	move.y
	};
	
	this.genPos.x += move.x;
	this.genPos.y += move.y;
	
	this.visited[this.genPos.x][this.genPos.y] = true;
	
	if (move.x == 1) {
		// right
		this.deactivateWall("v",this.genPos.x,this.genPos.y);
	}
	if (move.x == -1) {
		// left
		this.deactivateWall("v",this.genPos.x+1,this.genPos.y);
	}
	if (move.y == 1) {
		// down
		this.deactivateWall("h",this.genPos.x,this.genPos.y);
	}
	if (move.y == -1) {
		// up
		this.deactivateWall("h",this.genPos.x,this.genPos.y+1);
	}
	
	// Move the marker to show our position
	this.marker.attr("x", this.genPos.x*this.options.blockSize);
	this.marker.attr("y", this.genPos.y*this.options.blockSize);
	
	scope.randomWalk();
	
};

mazeEditor.prototype.solve = function() {
	var scope 	= this;
	var x;
	var y;
	var steadystate;
	
	// Generate the visited blocks
	var cell = [];
	for (x=0;x<this.options.width;x++) {
		for (y=0;y<this.options.height;y++) {
			if (!cell[x]) {
				cell[x] = [];
			}
			cell[x][y] = true;	// true = not yet visited
		}
	}
	
	do {
		steadystate = true;
		/* scan the entire CA */
		for (x=0;x<this.options.width;x++) {
			for (y=0;y<this.options.height;y++) {
				if (cell[x][y] == true) {
					/* addition can be used here to determine if */
					/* a cell is  surrounded by 3 or more walls  */
					var c = 0;
					if (x-1 < 0 || (this.walls["v"][x][y].state || !cell[x-1] || !cell[x-1][y])) {
						c++
					}
					if (x+1 >= this.options.width || (this.walls["v"][x+1][y].state || !cell[x+1] || !cell[x+1][y])) {
						c++
					}
					if (y-1 < 0 || (this.walls["h"][x][y].state || !cell[x] || !cell[x][y-1])) {
						c++
					}
					if (y+1 >= this.options.height || (this.walls["h"][x][y+1].state || !cell[x] || !cell[x][y+1])) {
						c++
					}
					if (c >= 3 && !(x == this.startpoint.x && y == this.startpoint.y) && !(x == this.endpoint.x && y == this.endpoint.y)) {
						cell[x][y] = false;
						steadystate = false;
					}
				}
			}
		}
	} while(!steadystate);
	
	for (i=0;i<this.solutionPath.length;i++) {
		this.solutionPath[i].remove();
	}
	this.solutionPath = [];
	
	for (x=0;x<this.options.width;x++) {
		for (y=0;y<this.options.height;y++) {
			if (cell[x][y]) {
				var solutionPath	= this.stage.rect(x*this.options.blockSize,y*this.options.blockSize,this.options.blockSize,this.options.blockSize);
				solutionPath.attr("fill", "#ffffff");
				solutionPath.attr("opacity", 0.6);
				solutionPath.attr("stroke-width", 0);
				this.solutionPath.push(solutionPath);
			}
		}
	}
	
	
};
mazeEditor.prototype.solveWalk = function() {
	var scope 	= this;
	var x;
	var y;
	
	// Check all 4 direction and only get what is available
	var available = [];
	for (i=-1;i<=1;i++) {
		for (j=-1;j<=1;j++) {
			//console.log(">",i,j,Math.abs(j) == Math.abs(j));
			if (Math.abs(i) == Math.abs(j)) {
				continue;
			}
			if (this.genPos.x+i >= this.options.width || this.genPos.x+i < 0 || this.genPos.y+j >= this.options.height || this.genPos.y+j < 0) {
				continue;
			}
			if (!this.visited[this.genPos.x+i][this.genPos.y+j]) {
				available.push([i,j]);
			}
		}
	}
	// Nowhere to go, we are done walking. Let's hunt.
	if (available.length == 0) {
		return this.solveHunt();
	}
	
	var rnd = Math.round(Math.random()*(available.length-1));
	
	//console.log("rnd",rnd);
	//console.log("available[rnd]",available[rnd]);
	
	var move = {
		x:	available[rnd][0],
		y:	available[rnd][1]
	};
	
	this.genPos.x += move.x;
	this.genPos.y += move.y;
	
	this.visited[this.genPos.x][this.genPos.y] = true;
	
	if (move.x == 1) {
		// right
		this.deactivateWall("v",this.genPos.x,this.genPos.y);
	}
	if (move.x == -1) {
		// left
		this.deactivateWall("v",this.genPos.x+1,this.genPos.y);
	}
	if (move.y == 1) {
		// down
		this.deactivateWall("h",this.genPos.x,this.genPos.y);
	}
	if (move.y == -1) {
		// up
		this.deactivateWall("h",this.genPos.x,this.genPos.y+1);
	}
	
	// Move the marker to show our position
	this.marker.attr("x", this.genPos.x*this.options.blockSize);
	this.marker.attr("y", this.genPos.y*this.options.blockSize);
	
	scope.randomWalk();
	
};

