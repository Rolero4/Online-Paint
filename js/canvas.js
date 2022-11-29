//#region global components and variables
const canvasFinal = document.getElementById('real');
const canvasDraft = document.getElementById('draft')
const contextFinal = canvasFinal.getContext('2d');
const contextDraft = canvasDraft.getContext('2d');

let currentColor = 'black';
let currentlineWidth = 3;
let paintingStyle = 'brush';

let currentLine = new Line({x: 0, y: 0}, {x: 0, y: 0}, 'black', 0);
let currentCircle = new Circle({x: 0, y: 0}, '0', 'black', 0);
let currentCurve = new Curve([], 'black', 0);
let startPosition;
let endPosition;

let id;
const paintings = [];
//#endregion

window.onload = function(){
	// canvas size init
	canvasFinal.width = canvasDraft.width = canvasDraft.offsetWidth;
	canvasFinal.height = canvasDraft.height = canvasDraft.offsetHeight;
	// canvas events init
	canvasDraft.addEventListener('touchstart', touchStart);
	canvasDraft.addEventListener('touchmove', touchMove);
	canvasDraft.addEventListener('touchend', touchEnd);
	// name and menu init rest
	menuInit();
	urlParameters();
	// server clock init
	getCanvasFromPhp();
	window.setInterval(getCanvasFromPhp, 1000); 
}

//#region URL
function urlParameters(){
	//id section
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	id = urlParams.get('index');
	if(id == null)
		window.open('index.html', '_self');

	//page name section
	const name = urlParams.get('name');
	const pageName = document.getElementById('pageName');
	pageName.innerText = name.replace('%', ' ');
}
//#endregion

//#region Menu and SideBar
function menuInit(){
	// menu buttons events
	const resetButton = document.getElementById('reset');
	const goToMenuButton = document.getElementById('back');
	const undoButton = document.getElementById('undo');

	sideBarInit();

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

}

function sideBarInit(){
	optionsButtonsInit();
	toolsButtonsInit();

	const sidebar = document.querySelector('.sidebar');

	const closeButton = document.querySelector('.close-button');
	closeButton.addEventListener('click', () => {
		sidebar.classList.remove('show-sidebar');
	})

	const toggleButton = document.getElementById('toggle-menu');
	toggleButton.addEventListener('click', () =>{
		sidebar.classList.toggle('show-sidebar');
	});
}

function toolsButtonsInit(){
	const toolButtons = document.querySelectorAll('.option button');
	const descriptions = document.querySelectorAll('.description');
	toolButtons.forEach(element => {
		element.addEventListener('click', function(e){
			const buttonID = e.target.dataset.id;
			paintingStyle = e.target.dataset.style;
			descriptions.forEach(element => { 
					element.classList.remove('checked');
			});
			descriptions[buttonID].classList.add('checked');
		});
	});
}

function optionsButtonsInit (){
	const colorInput = document.getElementById('color');
	colorInput.addEventListener('change', ()=>{
		currentColor = colorInput.value;
	})

	const sizeInput = document.getElementById('size');
	sizeInput.addEventListener('change', ()=>{
		currentlineWidth = sizeInput.value;
	})	
}
//#endregion

//#region TouchEvents
function drawFromPhp(){
	paintings.forEach(element => {
		if(element.name === 'Curve')
			drawCurve(element, contextFinal)
		else if(element.name === 'Line')
			drawLine(element, contextFinal)
		else if(element.name === 'Circle')
			drawCircle(element, contextFinal)
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
		lineMove(e, e.preventDefault())
	if(paintingStyle === 'circle')
		circleMove(e, e.preventDefault())
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
function Curve(points, color, width){
	this.name = 'Curve';
	this.brushPoints = points;
	this.color = color;
	this.width = width;
}

function brushStart(event) {
	contextDraft.beginPath();
	const currentBrushPoint = new Point(getClientOffset(event))
	currentCurve = new Curve([], currentColor, currentlineWidth);
	currentCurve.brushPoints.push(currentBrushPoint);
	contextDraft.moveTo(currentBrushPoint.x*canvasDraft.width, currentBrushPoint.y*canvasDraft.height);
}

function brushMove(event) {
	const currentBrushPoint = new Point(getClientOffset(event))
	currentCurve.brushPoints.push(currentBrushPoint);
	contextDraft.lineTo(currentBrushPoint.x*canvasDraft.width, currentBrushPoint.y*canvasDraft.height);
	contextDraft.strokeStyle= currentCurve.color;
	contextDraft.lineWidth= currentCurve.width;
	contextDraft.stroke();
}

function brushEnd() {
	drawCurve(currentCurve, contextFinal)
	clearCanvas(contextDraft);
	paintings.push(currentCurve);
	saveToJson();
	currentCurve.length = 0;
}

function drawCurve(Curve, context){
	if(Curve.brushPoints.length>1){
		context.beginPath()
		context.moveTo(Curve.brushPoints[0].x*canvasDraft.width, Curve.brushPoints[0].y*canvasDraft.height);
		context.strokeStyle=Curve.color;
		context.lineWidth=Curve.width;
		for(let i=0; i<Curve.brushPoints.length; i++){
			context.lineTo(Curve.brushPoints[i].x*canvasDraft.width, Curve.brushPoints[i].y*canvasDraft.height);
			context.stroke();
		}
		context.closePath();
	}
	else if(Curve.brushPoints.length == 1){
		context.beginPath();
        context.fillStyle = Curve.color;
        context.arc(Curve.brushPoints[0].x*canvasDraft.width, Curve.brushPoints[0].y*canvasDraft.height,
			Curve.width, 0 * Math.PI, 2 * Math.PI);
        context.fill();
	}
}

//#endregion

//#region Line
function Line(startPos, endPos, color, width){
	this.name = 'Line';
	this.startPoint = startPos;
	this.endPoint = endPos;
	this.color = color;
	this.width = width;
}

function lineStart(event){
	startPosition = getClientOffset(event);
}
 
function lineMove(event){
   	endPosition = getClientOffset(event);
	currentLine = new Line(startPosition, endPosition, currentColor, currentlineWidth)
   	clearCanvas(contextDraft);
	drawLine(currentLine, contextDraft);
}
 
function lineEnd(){
	clearCanvas(contextDraft);
	drawLine(currentLine, contextFinal)
	paintings.push(currentLine);
	saveToJson();
}

function drawLine(line, context){
   	context.beginPath();
   	context.moveTo(line.startPoint.x*canvasDraft.width, line.startPoint.y*canvasDraft.height);
   	context.lineTo(line.endPoint.x*canvasDraft.width, line.endPoint.y*canvasDraft.height);
   	context.strokeStyle=line.color;
   	context.lineWidth=line.width;
   	context.stroke();
}
//#endregion

//#region Circle
function Circle(startPos, endPos, color, width){
	this.name = 'Circle';
	this.startPoint = startPos;
	this.endPoint = endPos;
	this.color = color;
	this.width = width;
}

function circleStart(event){
	startPosition = getClientOffset(event);
}
 
function circleMove(event){
	endPosition = getClientOffset(event);
	currentCircle = new Circle(startPosition, endPosition, currentColor, currentlineWidth)
	clearCanvas(contextDraft);
	drawCircle(currentCircle, contextDraft)
}
 
function circleEnd(){
	clearCanvas(contextDraft);
	// if(JSON.stringify(currentCircle) == JSON.stringify(new Circle({x: 0, y: 0}, '0', 'black', 0)))
		paintings.push(currentCircle);
	drawCircle(currentCircle, contextFinal)
	saveToJson();
}

function drawCircle(circle, context){
    context.beginPath();
	let radius = Math.hypot(circle.startPoint.x*canvasDraft.width - circle.endPoint.x*canvasDraft.width, circle.startPoint.y*canvasDraft.height - circle.endPoint.y*canvasDraft.height)/2
    let centerPoint = {
        x: (circle.startPoint.x*canvasDraft.width + circle.endPoint.x*canvasDraft.width)/2,
        y: (circle.startPoint.y*canvasDraft.height + circle.endPoint.y*canvasDraft.height)/2
    }
    context.arc(centerPoint.x, centerPoint.y, radius, 0, 2 * Math.PI);
	context.strokeStyle=circle.color;
	context.lineWidth=circle.width;
    context.stroke();
}
//#endregion

//#region Php commucation
function saveToJson(){
	const xhr = new XMLHttpRequest();
	stringId = id+'';
    xhr.open('POST', './php/saveToJson.php?id=' + stringId, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () { //Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
			getCanvasFromPhp();
        }
    };
    xhr.send(JSON.stringify(paintings));
}

function getCanvasFromPhp(){
    const xhr = new XMLHttpRequest();
	stringId = id+'';
    xhr.onreadystatechange = function() {
      if(xhr.readyState === 4){
        if(xhr.status === 200 || xhr.status === 304){
			try{
            	const readyResponse = JSON.parse(this.response);
				if(JSON.stringify(paintings) != this.response){
					clearCanvas(contextFinal);
					paintings.length = 0;
					readyResponse.forEach(element =>
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
    xhr.open('GET', './php/getFromJson.php?id=' + stringId, true); 
    xhr.setRequestHeader('Content-Type', ' application/json')
    xhr.send();
}

//#endregion

//#region other functions
function Point(point){
	this.x = point.x;
	this.y = point.y;
}
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
//clearing context
function clearCanvas(context){
    context.clearRect(0, 0, canvasDraft.width, canvasDraft.height);
}
//#endregion 