
//#region components
const canvas = document.getElementById('real');
const canvasDraft = document.getElementById('draft')
const board = document.querySelector('.board');

const colorInput = document.getElementById("color");
const sizeInput = document.getElementById("size");

const resetButton = document.getElementById('reset');

const toolButtons = document.querySelectorAll('.option button');
const descriptions = document.querySelectorAll('.description');

//#endregion

//#region Menu
const closeButton = document.querySelector(".close-button").addEventListener("click", closeSideBar);
const toggleButton = document.getElementById("toggle-menu").addEventListener("click", toggleSideBar);
const sidebar = document.querySelector(".sidebar");

function closeSideBar(){
    sidebar.classList.remove("show-sidebar");
	// board.style.visibility = 'visible';
};

function toggleSideBar(){
    sidebar.classList.toggle("show-sidebar");
	// board.style.visibility = 'hidden';

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
// const pageName = window.location.pathname.split("/").pop().split(".")[0];

const paintings = [];

//#endregion

window.onload = function(){
	// canvas events
	canvas.width = canvasDraft.width = canvasDraft.offsetWidth;
	canvas.height = canvasDraft.height = canvasDraft.offsetHeight;
	canvasDraft.addEventListener('touchstart', touchStart);
	canvasDraft.addEventListener('touchmove', touchMove);
	canvasDraft.addEventListener('touchend', touchEnd);
	// color + size events
	sizeInput.addEventListener('change', changeSize)
	colorInput.addEventListener('change', changeColor)
	// menu buttons events
	resetButton.addEventListener('click', function(){
		clearCanvas(contextFinal);
	});
	//local storage
	// var index = localStorage.getItem('index');
	// if(index == null)
	// 	index = 0;
	// console.log(index)


	//parametr url
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const id = urlParams.get('index');
	console.log(id);
	if(id == null)
		window.open('index.html', '_self');
}


//#region TouchEvents
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
function BrushPoint(x, y, color, width){
	this.x = x;
	this.y = y;
	this.color = color;
	this.width = width;
}


function brushStart(event) {
	contextFinal.beginPath();
	const currentBrushPoint = new BrushPoint(event.pageX - canvasDraft.offsetLeft, event.pageY - canvasDraft.offsetTop,
		 currentColor, currentlineWidth)
	currentCurve.push(currentBrushPoint);
	contextFinal.moveTo(event.pageX - canvasDraft.offsetLeft, event.pageY - canvasDraft.offsetTop);
	isIdle = false;
}

function brushMove(event) {
	if (isIdle) return;
	const currentBrushPoint = new BrushPoint(event.pageX - canvasDraft.offsetLeft, event.pageY - canvasDraft.offsetTop, currentColor, currentlineWidth)
	currentCurve.push(currentBrushPoint);
	contextFinal.lineTo(currentBrushPoint.x, currentBrushPoint.y);
	contextFinal.strokeStyle=currentBrushPoint.color;
	contextFinal.lineWidth=currentBrushPoint.width;
	contextFinal.stroke();
}

function brushEnd(event) {
	if (isIdle) return;
	prepareObjectToJson(currentCurve);
	currentCurve = []
	brushMove(event)
	isIdle = true;
}

function drawCurve(brushPoints, context){
	context.moveTo(brushPoints[0].x, brushPoints[0].y);
	for(let i=0; i<brushPoints.length; i++){
		context.lineTo(brushPoints[i].x, brushPoints[i].y);
		context.strokeStyle=brushPoints[i].color;
		context.lineWidth=brushPoints[i].width;
		context.stroke();
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
   	context.moveTo(line.startX, line.startY);
   	context.lineTo(line.endX, line.endY);
   	context.strokeStyle=line.color;
   	context.lineWidth=line.width;
   	context.stroke();
}



//#endregion

//#region Circle

function Circle(centerPoint, radius, color, width){
	this.centerX = centerPoint.x;
	this.centerY = centerPoint.y;
	this.radius = radius;
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
	let radius = Math.sqrt(Math.pow(startPosition.x - lineCoordinates.x, 2) + Math.pow(startPosition.y - lineCoordinates.y, 2))/2
    let centerPoint = {
        x: (startPosition.x + lineCoordinates.x)/2,
        y: (startPosition.y + lineCoordinates.y)/2
    }
	currentCircle = new Circle(centerPoint, radius, currentColor, currentlineWidth)
	clearCanvas(contextDraft);
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
    context.arc(circle.centerX, circle.centerY, circle.radius, 0, 2 * Math.PI);
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

function JsonObject(object){
	this.className = object.constructor.name;
	this.attributes = object;
}


function prepareObjectToJson(object){
	paintings.push(new JsonObject(object))
	// console.log(object.constructor.name)
	// console.log(paintings);
	var arrayToString = JSON.stringify(Object.assign({}, paintings));  // convert array to string
	var stringToJsonObject = JSON.parse(arrayToString);  // convert string to json object
	
	console.log(stringToJsonObject);
}
//#endregion

//#region other functions
//position on canvas
function getClientOffset(event){
    const {pageX, pageY} = event.touches ? event.touches[0] : event;
    const x = pageX - canvasDraft.offsetLeft;
    const y = pageY - canvasDraft.offsetTop;
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