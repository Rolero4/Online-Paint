
//#region components
const canvas = document.getElementById('real');
const canvasDraft = document.getElementById('draft')

const colorInput = document.getElementById("color");
const sizeInput = document.getElementById("size");

const resetButton = document.getElementById('reset');
const goToMenuButton = document.getElementById('back');
const undoButton = document.getElementById('undo');

const toolButtons = document.querySelectorAll('.option button');
const descriptions = document.querySelectorAll('.description');

//#endregion

//#region Menu
const closeButton = document.querySelector(".close-button").addEventListener("click", closeSideBar);
const toggleButton = document.getElementById("toggle-menu").addEventListener("click", toggleSideBar);
const sidebar = document.querySelector(".sidebar");

function closeSideBar(){
    sidebar.classList.remove("show-sidebar");
};

function toggleSideBar(){
    sidebar.classList.toggle("show-sidebar");
};

// adding checked to current option
toolButtons.forEach(element => {
	element.addEventListener('click', function(e){
		const id = e.target.dataset.id;
		paintingStyle = e.target.dataset.style;
		descriptions.forEach(element => { 
				element.classList.remove('checked');
		});
		descriptions[id].classList.add('checked');
	});
});

//#endregion

//#region global variables
const contextFinal = canvas.getContext('2d');
const contextDraft = canvasDraft.getContext('2d')
let touchArray = [];
let currentColor = 'black';
let currentlineWidth = 3;
let paintingStyle = 'brush';
let isDrawStart = false;
let startPosition = {x: 0, y: 0};
let lineCoordinates = {x: 0, y: 0};
let currentLine = new Line({x: 0, y: 0}, {x: 0, y: 0}, 'black', 0);
let currentCircle = new Circle({x: 0, y: 0}, '0', 'black', 0);
let currentCurve = [];
let id;

const paintings = [];

//#endregion

window.onload = function(){
	// canvas events
	canvas.width = canvasDraft.width = canvasDraft.offsetWidth;
	canvas.height = canvasDraft.height = canvasDraft.offsetHeight;
	canvas.width = canvasDraft.width;
	canvas.height = canvasDraft.height;
	canvasDraft.addEventListener('touchstart', touchStart);
	canvasDraft.addEventListener('touchmove', touchMove);
	canvasDraft.addEventListener('touchend', touchEnd);
	// color + size events
	sizeInput.addEventListener('change', changeSize)
	colorInput.addEventListener('change', changeColor)
	// menu buttons events
	resetButton.addEventListener('click', function(){
		clearCanvas(contextFinal);
		paintings.length = 0;
		saveToJson();
	});

	goToMenuButton.addEventListener('click', function(){
		window.open('index.html', '_self');
	});

	undoButton.addEventListener('click', function(){
		if(paintings.length > 0){
			paintings.length = paintings.length - 1;
			saveToJson();
			clearCanvas(contextFinal);
			drawFromPhp();
		}
	});


	// sendNewCanvasToPhp();
	saveToJson();
	window.setInterval(getCanvasFromPhp, 1000); 

	//parametr url
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	id = urlParams.get('index');
	if(id == null)
		window.open('index.html', '_self');
	const name = urlParams.get('name');
	const pageName = document.getElementById('pageName');
	pageName.innerText = name.replace('%', ' ');
}


//#region TouchEvents
function drawFromPhp(){
	paintings.forEach(element => {
		if(element.className === 'Array')
			drawCurve(element.attributes, contextFinal)
		else if(element.className === 'Line')
			drawLine(element.attributes, contextFinal)
		else if(element.className === 'Circle')
			drawCircle(element.attributes, contextFinal)
	});
}

function touchStart(e){
	if(paintingStyle === 'brush')
		brushStart(e.touches[0])
	if(paintingStyle === 'line')
		lineStart(e)
	if(paintingStyle === 'circle')
		circleStart(e)
	
}
function touchMove(e){
	if(paintingStyle === 'brush')
		brushMove(e.touches[0], e.preventDefault())
	if(paintingStyle === 'line')
		lineMove(e)
	if(paintingStyle === 'circle')
		circleMove(e)
}
function touchEnd(e){
	if(paintingStyle === 'brush')
		brushEnd(e.changedTouches[0])
	if(paintingStyle === 'line')
		lineEnd(e)
	if(paintingStyle === 'circle')
		circleEnd(e)
}
//#endregion

//#region Brush
function BrushPoint(point, color, width){
	this.x = point.x;
	this.y = point.y;
	this.color = color;
	this.width = width;
}


function brushStart(event) {
	contextDraft.beginPath();
	const currentBrushPoint = new BrushPoint(getClientOffset(event),
		 currentColor, currentlineWidth)
	currentCurve.push(currentBrushPoint);
	contextDraft.moveTo(currentBrushPoint.x*canvasDraft.width, currentBrushPoint.y*canvasDraft.height);
}

function brushMove(event) {
	const currentBrushPoint = new BrushPoint(getClientOffset(event), currentColor, currentlineWidth)
	currentCurve.push(currentBrushPoint);
	contextDraft.lineTo(currentBrushPoint.x*canvasDraft.width, currentBrushPoint.y*canvasDraft.height);
	contextDraft.strokeStyle=currentBrushPoint.color;
	contextDraft.lineWidth=currentBrushPoint.width;
	contextDraft.stroke();
}

function brushEnd(event) {
	// currentCurve.shift()
	drawCurve(currentCurve, contextFinal)
	clearCanvas(contextDraft);
	prepareObjectToJson(currentCurve);
	currentCurve = [];
}


function drawCurve(brushPoints, context){
	if(brushPoints.length>1){
		context.beginPath()
		context.moveTo(brushPoints[0].x*canvasDraft.width, brushPoints[0].y*canvasDraft.height);
		context.strokeStyle=brushPoints[0].color;
		context.lineWidth=brushPoints[0].width;
		for(let i=0; i<brushPoints.length; i++){
			context.lineTo(brushPoints[i].x*canvasDraft.width, brushPoints[i].y*canvasDraft.height);
			context.stroke();
		}
		context.closePath();
	}
	else if(brushPoints.length == 1){
		context.beginPath();
        context.fillStyle = brushPoints[0].color;
        context.arc(brushPoints[0].x*canvasDraft.width, brushPoints[0].y*canvasDraft.height, brushPoints[0].width, 0 * Math.PI, 2 * Math.PI);
        context.fill();
	}
}

//#endregion

//#region Line

function Line(startPos, endPos, color, width){
	this.startX = startPos.x;
	this.startY = startPos.y;
	this.endX = endPos.x;
	this.endY = endPos.y;
	this.color = color;
	this.width = width;
}

function lineStart(event){
	startPosition = getClientOffset(event);
	isDrawStart = true;
 }
 
 function lineMove(event){
   	if(!isDrawStart) return;
   	lineCoordinates = getClientOffset(event);
   	clearCanvas(contextDraft);
	currentLine = new Line(startPosition, lineCoordinates, currentColor, currentlineWidth)
	drawLine(currentLine, contextDraft);
	event.preventDefault();
}
 
function lineEnd(){
	drawLine(currentLine, contextFinal)
	prepareObjectToJson(currentLine);
	clearCanvas(contextDraft)
	isDrawStart = false;
}

function drawLine(line, context){
   	context.beginPath();
   	context.moveTo(line.startX*canvasDraft.width, line.startY*canvasDraft.height);
   	context.lineTo(line.endX*canvasDraft.width, line.endY*canvasDraft.height);
   	context.strokeStyle=line.color;
   	context.lineWidth=line.width;
   	context.stroke();
}



//#endregion

//#region Circle

function Circle(startPos, endPos, color, width){
	this.startX = startPos.x;
	this.startY = startPos.y;
	this.endX = endPos.x;
	this.endY = endPos.y;
	this.color = color;
	this.width = width;
}


function circleStart(event){
	startPosition = getClientOffset(event);
	isDrawStart = true;
}
 
function circleMove(event){
	if(!isDrawStart) return;
	lineCoordinates = getClientOffset(event);
	clearCanvas(contextDraft);
	currentCircle = new Circle(startPosition, lineCoordinates, currentColor, currentlineWidth)
	drawCircle(currentCircle, contextDraft)
	event.preventDefault()
}
 
function circleEnd(event){
	drawCircle(currentCircle, contextFinal)
	prepareObjectToJson(currentCircle);
	clearCanvas(contextDraft)
	isDrawStart = false;
}

function drawCircle(circle, context){
    context.beginPath();
	let radius = Math.hypot(circle.startX*canvasDraft.width - circle.endX*canvasDraft.width, circle.startY*canvasDraft.height - circle.endY*canvasDraft.height)/2
    let centerPoint = {
        x: (circle.startX*canvasDraft.width + circle.endX*canvasDraft.width)/2,
        y: (circle.startY*canvasDraft.height + circle.endY*canvasDraft.height)/2
    }
    context.arc(centerPoint.x, centerPoint.y, radius, 0, 2 * Math.PI);
	context.strokeStyle=circle.color;
	context.lineWidth=circle.width;
    context.stroke();
}



//#endregion

//#region Tools
function changeColor(){
	currentColor = colorInput.value;
}

function changeSize(){
	currentlineWidth = sizeInput.value;
}
//#endregion

//#region communication with PHP

function Canvas(){
	this.id = id;
	this.paintings = paintings;
}

// function JsonObject(object){
// 	this.className = object.constructor.name;
// 	this.attributes = object;
// }

function prepareObjectToJson(object){
	// paintings.push(new JsonObject(object))
	paintings.push({
		className: object.constructor.name,
		attributes: object
	})
	saveToJson();
}

function saveToJson(){
	const xhr = new XMLHttpRequest();
	stringId = id+'';
    xhr.open("POST", "./php/saveToJson.php?id=" + stringId, true);
    xhr.setRequestHeader('Content-type', "application/json");
    xhr.onreadystatechange = function () { //Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
			getCanvasFromPhp();
        }
    };
    xhr.send(JSON.stringify(Object.assign({}, new Canvas())));
}

function getCanvasFromPhp(){
    const xhr = new XMLHttpRequest();
	stringId = id+'';
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200 || xhr.status === 304){
			try{
            	const readyResponse = JSON.parse(JSON.parse(JSON.parse(this.response)));
				if(JSON.stringify(paintings) !== JSON.stringify(readyResponse.paintings)){
					clearCanvas(contextFinal);
					paintings.length = 0;
					readyResponse.paintings.forEach(element =>
						paintings.push(element)
					);
					drawFromPhp();
				}
			}
			catch(error){

			}
        }
      }
    };
    xhr.open("GET", "./php/getFromJson.php?id=" + stringId, true); 
    xhr.setRequestHeader('Content-Type', ' application/json')
    xhr.send();
}

//#endregion

//#region other functions
//position on canvas
function getClientOffset(event){
    const {pageX, pageY} = event.touches ? event.touches[0] : event;
    const x = (pageX - canvasDraft.offsetLeft)/canvasDraft.width;
    const y = (pageY - canvasDraft.offsetTop)/canvasDraft.height;
    return {
       x,
       y
    } 
}
//clearing canvas
function clearCanvas(context){
    context.clearRect(0, 0, canvasDraft.width, canvasDraft.height);
}

//#endregion 