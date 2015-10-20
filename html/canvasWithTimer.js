/*

Javasript to handle mouse dragging and release
to drag a string around the html canvas
Keyboard arrow keys are used to move a moving box around

Here we are doing all the work with javascript and jQuery. (none of the words
are HTML, or DOM, elements. The only DOM element is just the canvas on which
where are drawing.

This example shows examples of using JQuery
JQuery syntax:
$(selector).action();
e.g.
$(this).hide() - hides the current element.
$("p").hide() - hides all <p> elements.
$(".test").hide() - hides all elements with class="test".
$("#test").hide() - hides the element with id="test".

Mouse event handlers are being added and removed using jQuery and
a jQuery event object is being passed to the handlers

Keyboard keyDown handler is being used to move a "moving box" around

Notice in the .html source file there are no pre-attached handlers.

*/

// 0 for Drake, 1 for Future
var currPlayer = -1;


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

function handleMouseDown(e){
	
	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    //var canvasX = e.clientX - rect.left;
    //var canvasY = e.clientY - rect.top;
    var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    var canvasY = e.pageY - rect.top;
	console.log("mouse down:" + canvasX + ", " + canvasY);
	
	wordBeingMoved = getWordAtLocation(canvasX, canvasY);
	//console.log(wordBeingMoved.word);
	if(wordBeingMoved != null ){
	   deltaX = wordBeingMoved.x - canvasX; 
	   deltaY = wordBeingMoved.y - canvasY;
	   //attache mouse move and mouse up handlers
	   $("#canvas1").mousemove(handleMouseMove);
	   $("#canvas1").mouseup(handleMouseUp);	   
	}

    // Stop propagation of the event and stop any default 
    //  browser action
    e.stopPropagation();
    e.preventDefault();
	
	drawCanvas();
	}
	
function handleMouseMove(e){
	
	console.log("mouse move");
	
	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    var canvasX = e.pageX - rect.left;
    var canvasY = e.pageY - rect.top;
	
	wordBeingMoved.x = canvasX + deltaX;
	wordBeingMoved.y = canvasY + deltaY;
	
	e.stopPropagation();
	
	drawCanvas();
	}
	
function handleMouseUp(e){

	console.log("mouse up");  		
	e.stopPropagation();
	
	//remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas1").off("mouseup", handleMouseUp); //remove mouse up handler
		
	drawCanvas(); //redraw the canvas
	}
	
//JQuery Ready function -called when HTML has been parsed and DOM
//created
//can also be just $(function(){...});
//much JQuery code will go in here because the DOM will have been loaded by the time
//this runs

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
  
    //update the server with a new location of the moving box
	$.post("positionData",
	    jsonString, 
		function(data, status){
		   //do nothing
		});
}

function handleKeyUp(e){
	console.log("key UP: " + e.which);
	console.log("HII");
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
		playerData[currPlayer].inUse = true;

		document.getElementById("drake").onclick = null;
		var jsonPlayerString = JSON.stringify(playerData);
		console.log("select drake: " + jsonPlayerString);
		$.post("players",
		    jsonPlayerString, 
			function(data, status){
				console.log("new player data: " + JSON.stringify(jsonPlayerString));
				});
	}
}

function selectFuture() {
	// if no player has been selected yet, and future is not in use, choose future
	if(currPlayer == -1 && playerData[1].inUse == false) {
		currPlayer = 1;
		playerData[currPlayer].inUse = true;
		
		// $("#future").prop("disabled",true);
		var jsonPlayerString = JSON.stringify(playerData);
		console.log("select future: " + jsonPlayerString);
		$.post("players",
		    jsonPlayerString, 
			function(data, status){
				console.log("new player data: " + JSON.stringify(jsonPlayerString));
				});
	}
}

$(document).ready(function(){
	
	// TODO: disable/enable Drake and Future buttons based on if they're available
	//add mouse down listener to our canvas object
	$("#canvas1").mousedown(handleMouseDown);
	//add keyboard handler to document
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);
		
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

