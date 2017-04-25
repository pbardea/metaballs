var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

var circles = [];

// Global Flags
var debug = false;
var enableInterpolation = true;
var filledShapes = true;

// Context settings
ctx.font="10px Avenir";

var numRows = debug ? 10 : 200;
var numCols = debug ? 15 : 300;

var rowHeight = canvas.height / numRows;
var colWidth = canvas.width / numCols;

function edge(row, column, table, r1, c1, r2, c2) {
  var a = table[row + r1][column + c1];
  var b = table[row + r2][column + c2];

  if ((a >= 1) == (b >= 1)) { return null; }
  return {
    x: (column + c1) * colWidth + (c1 != c2) * colWidth * interpolate(a, b),
    y: (row + r1) * rowHeight + (r1 != r2) * rowHeight * interpolate(a, b)
  }
}

function top(row, column, table) {
  return edge(row, column, table, 0, 0, 0, 1);
}

function bottom(row, column, table) {
  return edge(row, column, table, 1, 0, 1, 1);
}

function left(row, column, table) {
  return edge(row, column, table, 0, 0, 1, 0);
}

function right(row, column, table) {
  return edge(row, column, table, 0, 1, 1, 1);
}

function interpolate(fa, fb) {
  return enableInterpolation ? ((1-fa)/(fb - fa)) : 0.5;
}

function corner(column, row, c, r) {
  return {
    x: (column + c) * colWidth,
    y: (row + r) * rowHeight
  }
}

function getShape(tl, tr, bl, br, row, column, table) {
  var num = (tl << 3) + (tr << 2) + (bl << 1) + br;
  var bottomRight = corner(column, row, 1, 1);
  var topRight = corner(column, row, 1, 0);
  var topLeft = corner(column, row, 0, 0);
  var bottomLeft = corner(column, row, 0, 1);

  var r = right(row, column, table);
  var b = bottom(row, column, table);
  var l = left(row, column, table);
  var t = top(row, column, table);
  switch (num) {
    case 0: // 0000
      return [];
    case 1: // 0001
      return [r, bottomRight, b];
    case 2: // 0010
      return [l, bottomLeft, b];
    case 3: // 0011
      return [l, bottomLeft, bottomRight, r];
    case 4: // 0100
      return [t, topRight, r];
    case 5: // 0101
      return [t, topRight, bottomRight, b];
    case 6: // 0110
      return [t, topRight, r, b, bottomLeft, l];
    case 7: // 0111
      return [t, topRight, bottomRight, bottomLeft, l];
    case 8: // 1000
      return [l, topLeft, t];
    case 9: // 1001
      return [l, topLeft, t, r, bottomRight, b];
    case 10: // 1010
      return [topLeft, t, b, bottomLeft];
    case 11: // 1011
      return [topLeft, t, r, bottomRight, bottomLeft];
    case 12: // 1100
      return [topLeft, topRight, r, l];
    case 13: // 1101
      return [topLeft, topRight, bottomRight, b, l];
    case 14: // 1110
      return [topLeft, topRight, r, b, bottomLeft];
    case 15: // 1111
      return [topLeft, topRight, bottomRight, bottomLeft];
  }
}

function drawGrid() {
  ctx.fillSytle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid

  ctx.strokeStyle = 'gray'
  if (debug) {
    for (var i = 0; i < numRows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * rowHeight);
        ctx.lineTo(canvas.width, i * rowHeight);
        ctx.stroke();
    }

    for (var i = 0; i < numCols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * colWidth, 0);
        ctx.lineTo(i * colWidth, canvas.height);
        ctx.stroke();
    }
  }
}

function drawBalls() {
  // Populate Table
  var table = [];
  for (var row = 0; row < numRows + 1; row++) {
    table.push([]);
    for (var col = 0; col < numCols + 1; col++) {
      var squareWidth = 5;

      var yPos = row * rowHeight;
      var xPos = col * colWidth;

      var f = 0;
      for (var i = 0; i < circles.length; i++) {
        var c = circles[i];
        f += Math.pow((c.radius), 2) / (Math.pow(xPos - c.posX, 2) + Math.pow(yPos - c.posY, 2));
      }
      table[row].push(f);

      if (debug) {
        if (f >= 1) {
          ctx.fillStyle = 'green';
        } else {
          ctx.fillStyle = 'gray';
        }
        ctx.fillRect(xPos - squareWidth / 2, yPos - squareWidth / 2, squareWidth, squareWidth);
        ctx.fillStyle = 'gray';
        ctx.fillText(f.toFixed(2), xPos - squareWidth, yPos + 2 * squareWidth);
      }

    }
  }

  // Draw lines
  for (var row = 0; row < numRows; row++) {
    for (var col = 0; col < numCols; col++) {
      var tl = table[row][col] >= 1;
      var tr = table[row][col + 1] >= 1;
      var bl = table[row + 1][col] >= 1;
      var br = table[row + 1][col + 1] >= 1;

      if (filledShapes) {
        var shape = getShape(tl, tr, bl, br, row, col, table);

        if (shape.length > 0) {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(shape[0].x, shape[0].y);
          for (var i = 1; i < shape.length; i++) {
            ctx.lineTo(shape[i].x, shape[i].y);
          }
          ctx.lineTo(shape[0].x, shape[0].y);
          ctx.fill();
        }
      } else {
        var t = top(row, col, table);
        var l = left(row, col, table);
        var b = bottom(row, col, table);
        var r = right(row, col, table);

        var points = [];
        // Special case
        if (tl && br && !tr && !bl) {
          points.push(l, b, r, t);
        } else {
          points.push(t, l, b, r);
        }

        var a = points.filter(x => x);
        for (var i = 0; i < a.length / 2; i++) {
          var s = a[2 * i];
          var e = a[2 * i + 1];
          if (row == 0 && col == 0) {
            console.log(s, e);
          }
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'red';
          ctx.beginPath();
          ctx.moveTo(s.x,s.y);
          ctx.lineTo(e.x,e.y);
          ctx.stroke();
        }
      }
    }
  }
}

function makeCircles() {
    for (var i = 0; i < 5; i++) {
        var circle = {
            posX: 200 + 50 * (i + 1),
            posY: 200 + 50 * (i + 1),
            color: 'red',
            speed: 2 * (i + 1),
            radius: 150 / (i + 1),
            direction: 30 * Math.PI / 180
        };
        circles.push(circle);
    }

    function renderContent() {
      drawGrid();
      drawBalls();
      if (debug) {
        for (var i = 0; i < circles.length; i++) {
            var c = circles[i];
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c.posX, c.posY, c.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
      }
    } //end function renderContent

    function animationLoop() {
        canvas.width = canvas.width;
        renderContent();
        for (var i = 0; i < circles.length; i++) {
            var c = circles[i];
            var ySpeed = c.speed * Math.sin(c.direction);
            var xSpeed = c.speed * Math.cos(c.direction);
            c.posY -= ySpeed;
            c.posX -= xSpeed;

            if (c.posX - c.radius < 0 || c.posX + c.radius > canvas.width) {
              c.direction = -1 * c.direction + Math.PI;
            }
            if (c.posY - c.radius < 0 || c.posY + c.radius > canvas.height) {
              c.direction = -1 * c.direction;
            }

            if (c.posY < -40) c.posY = 500;
        }
        setTimeout(animationLoop, 33);
    } //end function animationLoop


    animationLoop();
} //end function makeCircles

makeCircles();
