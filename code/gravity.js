// ------------------------------------------------
//                     Data Values
// ------------------------------------------------

const G = 6.67259e-11

const scaleFactor = 1e6

const variables = ['x', 'y', 'r', 'mass', 'vx', 'vy', 'color']

const hertz = 50 // updates per sec

var tStep = 2 // 10 sec

// 384,400km between earth and moon

var earth = 
    {
        x: 500.0, // one pixel represents 1000 km or 1 million meters
        y: 500.0,
        r: 10,
        mass: 5.972e24,
        vx: 0.0,
        vy: 0.0,
        color: '#0000FF'
    }

var moon = 
    {
        x: 884.4, // 500 (earth) + 384.4 (distance between earth and moon in millions of meters)
        y: 500.0,
        r: 2,
        mass: 7.34767309e22,
        vx: 0.0, // 3,683 kilometers per hour -> 1023.0556 m/s
        vy: 1.0230556, // 3.683 million meters per s
        color: '#555555'
    }

var object3 = 
    {
        x: 250.0,
        y: 500.0,
        r: 2,
        mass: 7.34767309e22,
        vx: 0.0, 
        vy: -1.0230556,
        color: '#FF0000'
    }

// ------------------------------------------------
//               Graphics Functions
// ------------------------------------------------

function drawLine(canvas, x1, y1, x2, y2)
{
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCircle(canvas, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

function fillCircle(canvas, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawObjects() {
    for (var i = 0; i < planetList.length; i++) {
        ctx.fillStyle = planetList[i].color;
        fillCircle(ctx, planetList[i].x, planetList[i].y, planetList[i].r)
    }
}

// ------------------------------------------------
//            Math & Physics Functions
// ------------------------------------------------

function distanceSq(obj1, obj2) {
    deltaX = (obj2.x - obj1.x) * scaleFactor
    deltaY = (obj2.y - obj1.y) * scaleFactor
    return (deltaX * deltaX + deltaY * deltaY)
}

function distance(obj1, obj2) {
    return Math.sqrt(distanceSq(obj1, obj2)) // already scaled by distanceSq
}

function angle(objHome, objTarget) {
    a = Math.atan((objHome.y - objTarget.y)/(objHome.x - objTarget.x))
    if ((objHome.x - objTarget.x) < 0) {
        a += Math.PI
    }
    return a + Math.PI
}

function accelerationGrav(objHome, objTarget) {
    var theta = angle(objHome, objTarget)
    var acc = G * objTarget.mass / distanceSq(objHome, objTarget)
    var ax = Math.cos(theta) * acc
    var ay = Math.sin(theta) * acc
    return [ax, ay]
}
function stepPhysicsObject(objHome, objTargetList) {
    objHome.x += objHome.vx * tStep
    objHome.y += objHome.vy * tStep 

    for (var i = 0; i < objTargetList.length; i++)
    {
        var acc = accelerationGrav(objHome, objTargetList[i]) // acc is in m/s^2
        objHome.vx += acc[0] * tStep
        objHome.vy += acc[1] * tStep // velocity is in Mm/s
    }
}

function stepPhysics()
{
    // moon and earth
    for (var i = 0; i < planetList.length; i++) {
        stepPhysicsObject(planetList[i], planetList.slice(0,i).concat(planetList.slice(i + 1)), tStep)
    }
}

/*
var canvas = document.getElementById("myCanvas");
canvas.height = 1200;
canvas.width = 1200;

canvas.style.width = "600px";
canvas.style.height = "600px";

var ctx = canvas.getContext("2d")
ctx.scale(2,2);*/

//get DPI
var dpi = window.devicePixelRatio;
//get canvas
var canvas = document.getElementById('myCanvas');
//get context
var ctx = canvas.getContext('2d');
function fix_dpi() {
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    var style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    //get CSS width
    var style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}
fix_dpi()

//console.log(angle(moon, earth))
//console.log(angle(earth, moon))

//console.log(accelerationGrav(moon, earth))
//console.log(accelerationGrav(earth, moon))

// ------------------------------------------------
//                   Table Stuff
// ------------------------------------------------

function setupTable() {
    txt = ''
    txt += '<tr><th style="width: 200px">x</th><th style="width: 200px">y</th><th>r</th><th>Mass</th>'
    txt += '<th style="width: 200px">v<sub>x</sub></th><th style="width: 200px">v<sub>y</sub></th>'
    txt += '<th>color</th></tr>'

    for (var i = 0; i < planetList.length; i++) 
    {
        txt += '<tr>'
        for (var j in variables) {
            txt += '<td onclick="changeToInput(' + i + ',\'' + variables[j] + '\')">' + planetList[i][variables[j]] + '</td>'
        }
    }
    document.getElementById('dataTable').innerHTML = txt

    //console.log('Update!')
}

// ------------------------------------------------
//                  JS & HTML Stuff
// ------------------------------------------------

function changeToInput(row, column) {
    // row is a number, column a string
    var prev = planetList[row][column]
    console.log(prev)
    var d = document.getElementById('dataTable').children[0].children
    var columnIndex = variables.indexOf(column)
    var element = d[row + 1].children[columnIndex]
    console.log(element)
    txt = '<input name="dataPiece" value="' + prev + '" onblur="changeFromInput(' + row + ',\'' + column + '\')">'
    element.innerHTML = txt
    element.attributes.removeNamedItem('onclick')

}

function changeFromInput(row, column) {
    //console.log('changeFromInput')
    //console.log(row, column)

    var d = document.getElementById('dataTable').children[0].children
    var columnIndex = variables.indexOf(column)
    var element = d[row + 1].children[columnIndex]

    var value = element.children[0].value
    element.innerHTML = value

    element.setAttribute('onclick','changeToInput(' + row + ',\'' + column + '\')')

    if (column != 'color') {
        value = parseFloat(value)
    }
    
    planetList[row][column] = value
}

function addObject() {
    planetList.push(JSON.parse(JSON.stringify(moon)))
    setupTable()
}

function removeObject() {
    var val = parseInt(document.getElementById('removeID').value)
    if (val.toString() == NaN.toString()) {
        return
    }

    planetList = planetList.slice(0,val).concat(planetList.slice(val + 1))

    setupTable()
}

function tStepChange() {
    var val = parseInt(document.getElementById('tStepValue').value)
    if (val.toString() == NaN.toString()) {
        return
    }

    tStep = val
}

// ------------------------------------------------
//                    Main Loop
// ------------------------------------------------

var intervalID = 0

var planetList = []

function startup(objects) {
    for (var i = 0; i < objects.length; i++) {
        planetList.push(JSON.parse(JSON.stringify(objects[i])))
        //console.log(JSON.stringify(objects[i]))
    }
}

function main() {
    stepPhysics()
    //ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawObjects()
    setupTable()
}

function stop() {
    clearInterval(intervalID)
    document.getElementById('stop').disabled = true
    document.getElementById('resume').disabled = false
    document.getElementById('addObject').disabled = false
    document.getElementById('removeObject').disabled = false
    document.getElementById('tStepSubmit').disabled = false
}

function resume() {
    intervalID = setInterval(main, 1000 / hertz)
    document.getElementById('stop').disabled = false
    document.getElementById('resume').disabled = true
    document.getElementById('addObject').disabled = true
    document.getElementById('removeObject').disabled = true
    document.getElementById('tStepSubmit').disabled = true
}

function restart() {
    stop()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    planetList = []
    startup([earth, moon, object3])
    drawObjects()
    setupTable()
}

document.getElementById('tStepValue').value = tStep
document.getElementById('hertzValue').innerHTML = hertz

startup([earth, moon, object3])

intervalID = setInterval(main, 1000 / hertz)

