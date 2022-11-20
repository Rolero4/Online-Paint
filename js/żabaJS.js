var can;
var info;
window.onload=function(){
	//alert("11");
	can=document.querySelector('canvas');
	can.addEventListener('touchstart',startDotyku,true);
	can.addEventListener('touchend',stopDotyku,true);
	can.addEventListener('touchmove',ruchDotyku,true);
	info=document.querySelector('#info');
	q=can.getContext('2d');
}

var tablicaDotyk=[];
var kolory=['red','green','blue','magenta','cyan'];
var q;

function startDotyku(e)
{

	for(var i=0; i<e.touches.length; i++)
	{
		var x=e.touches[i].pageX;
		var y=e.touches[i].pageY;
		var k=Math.floor(Math.random()*5);		
		tablicaDotyk.push({x:x,y:y,k:k});
	}
	e.preventDefault();
	e.stopPropagation()
}


function stopDotyku(e)
{
	tablicaDotyk.length=0;
}

function ruchDotyku(e)
{
	var x1=can.offsetLeft;
	var y1=can.offsetTop;
	for(var i=0; i<e.touches.length && i<tablicaDotyk.length; i++)
	{
		var x=e.touches[i].pageX;
		var y=e.touches[i].pageY;
		q.beginPath();
		q.moveTo(tablicaDotyk[i].x-x1,tablicaDotyk[i].y-y1);
		q.strokeStyle=kolory[tablicaDotyk[i].k];
		q.lineWidth=7;
		q.lineTo(x-x1, y-y1);
		q.stroke();
		tablicaDotyk[i].x=x;
		tablicaDotyk[i].y=y;
	}
	e.preventDefault();
	e.stopPropagation()
}
