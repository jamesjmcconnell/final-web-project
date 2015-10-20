// 0 for Drake, 1 for Future
var currPlayer = -1;

// route to set the position of each character
var setPosRoute;


//intended for keyboard control					
var movingBox = {x: 50,
                 y: 50,
				 width: 100,
				 height: 100};

var playerData;
				 
var wayPoints = []; //locations were this client moved the box to
					
var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById('canvas1'); //our drawing canvas

var drawCanvas = function(){

    var context = canvas.getContext('2d');
	
    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas
   
    context.fillStyle = 'cornflowerblue';
    context.strokeStyle = 'blue';
	
    //draw moving box
	context.fillRect(movingBox.x,
	                 movingBox.y,
					 movingBox.width,
					 movingBox.height);
	
	//draw moving box way points
	for(i in wayPoints){
		context.strokeRect(wayPoints[i].x,
		             wayPoints[i].y,
					 movingBox.width,
					 movingBox.height);
	}
    context.stroke();
	
}

function handleTimer(){
	
	drawCanvas()
}

    //KEY CODES
	//should clean up these hard coded key codes
	var RIGHT_ARROW = 39;
	var LEFT_ARROW = 37;
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;


function pollingTimerHandler(){
	//console.log("poll server");
	var dataObj = {x: -1, y: -1}; //used by server to react as poll
	//create a JSON string representation of the data object
	
	var jsonPosString = JSON.stringify(dataObj);
    //Poll the server for the location of the moving box
	$.post("positionData",
	    jsonPosString, 
		function(data, status){
			console.log("POLLING SERVER ... ");
			console.log("data: " + JSON.stringify(data));
			console.log("typeof: " + typeof data);
			//var locationData = JSON.parse(data);
			var locationData = data;
			movingBox.x = locationData.x;
			movingBox.y = locationData.y;
			});

			// CHECK PLAYER STATUS
			var jsonPlayerString = "";
			$.post("players",
			    jsonPlayerString, 
				function(data, status){
					console.log("currPlayer: " + currPlayer);
					console.log("player data: " + JSON.stringify(data));
					//var locationData = JSON.parse(data);
					playerData = data;
					});

			// update all clients to show which players are taken
			if(playerData[0].inUse == true) {
				$("#drake").prop("disabled",true);
			}
			else {
				$("#drake").prop("disabled",false);
			}

			if(playerData[1].inUse == true) {
				$("#future").prop("disabled",true);
			}
			else {
				$("#future").prop("disabled",false);
			}

}

function handleKeyDown(e){
	
	console.log("keydown code = " + e.which );
		
	var dXY = 5; //amount to move in both X and Y direction
	if(e.which == UP_ARROW && movingBox.y >= dXY) 
	   movingBox.y -= dXY;  //up arrow
	if(e.which == RIGHT_ARROW && movingBox.x + movingBox.width + dXY <= canvas.width) 
	   movingBox.x += dXY;  //right arrow
	if(e.which == LEFT_ARROW && movingBox.x >= dXY) 
	   movingBox.x -= dXY;  //left arrow
	if(e.which == DOWN_ARROW && movingBox.y + movingBox.height + dXY <= canvas.height) 
	   movingBox.y += dXY;  //down arrow
	
	//upate server with position data
	//may be too much traffic? 
	var dataObj = {x: movingBox.x, y: movingBox.y}; 
	//create a JSON string representation of the data object
	var jsonString = JSON.stringify(dataObj);
  
    //update the server with a new location of the character - drake or future
	$.post(setPosRoute,
	    jsonString, 
		function(data, status){
		   //do nothing
		});
}

function handleKeyUp(e){
	console.log("key UP: " + e.which);
	var dataObj = {x: movingBox.x, y: movingBox.y}; 
	console.log("new dataObj: " + JSON.stringify(dataObj));
	//create a JSON string representation of the data object
	var jsonString = JSON.stringify(dataObj);

 
	$.post("positionData",
	    jsonString, 
		function(data, status){
			console.log("data: " + data);
			console.log("typeof: " + typeof data);
			//var wayPoint = JSON.parse(data);
			var wayPoint = data;
			wayPoints.push(wayPoint);
			});
}

function selectDrake() {
	// if no player has been selected yet, and drake is not in use, choose drake
	if(currPlayer == -1 && playerData[0].inUse == false) {
		currPlayer = 0;
		setPosRoute = "set-drake-pos";
		playerData[currPlayer].inUse = true;

		var jsonPlayerString = JSON.stringify(playerData);
		console.log("select drake: " + jsonPlayerString);
		$.post("players",
		    jsonPlayerString, 
			function(data, status){
				console.log("new player data: " + JSON.stringify(jsonPlayerString));
				});

		// enable key up / key down handlers
		// ie. don't let users move until they've selected a player
		$(document).keydown(handleKeyDown);
		$(document).keyup(handleKeyUp);
	}
}

function selectFuture() {
	// if no player has been selected yet, and future is not in use, choose future
	if(currPlayer == -1 && playerData[1].inUse == false) {
		currPlayer = 1;
		setPosRoute = "set-future-pos";
		playerData[currPlayer].inUse = true;
		
		var jsonPlayerString = JSON.stringify(playerData);
		console.log("select future: " + jsonPlayerString);
		$.post("players",
		    jsonPlayerString, 
			function(data, status){
				console.log("new player data: " + JSON.stringify(jsonPlayerString));
				});

		// enable key up / key down handlers
		// ie. don't let users move until they've selected a player
		$(document).keydown(handleKeyDown);
		$(document).keyup(handleKeyUp);
	}
}

$(document).ready(function(){
	//add mouse down listener to our canvas object
	// $("#canvas1").mousedown(handleMouseDown);
	//add keyboard handler to document
		
	timer = setInterval(handleTimer, 100); //tenth of second
	pollingTimer = setInterval(pollingTimerHandler, 100);  //quarter of a second
    //timer.clearInterval(); //to stop

	//create a JSON string representation of the data object
	var jsonPlayerString = "";
	$.post("players",
	    jsonPlayerString, 
		function(data, status){
			console.log("player data: " + JSON.stringify(data));
			//var locationData = JSON.parse(data);
			playerData = data;
			});

	drawCanvas();
});
