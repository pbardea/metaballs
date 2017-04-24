var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('myCanvas');
var ctx: CanvasRenderingContext2D = canvas.getContext('2d');

var radius = 70;

var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
ctx.fillStyle = 'green';
ctx.fill();
ctx.lineWidth = 10;
ctx.strokeStyle = '#003300';
ctx.stroke();
