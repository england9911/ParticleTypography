// REFS:
// https://b2renger.github.io/p5js_typo/
// http://b2renger.github.io/
// https://p5js.org/examples/form-regular-polygon.html
// http://printingcode.runemadsen.com/examples/typography/font/
// https://b2renger.github.io/p5js_patterns/

var f; // store the current font
var path; // store the path calculated from the current font
var polys; // store the array of polygons calculated from the current font
var drawing = false; // as loading is asynchron we need to keep track of its progression
var gui, params; // store gui related things.

var anchorX, anchorY;
var particles = [];

// Loads a font, and creates an array of polygons
// a polygon being an array of vectors with x/y coordinates
function getPoints(){
    drawing = false;
    f = new Rune.Font(params.font)
    vectorLetters = [];

    f.load(function(err){
        path = f.toPath(params.message, 0, 0, params.size)
        polys = path.toPolygons({ spacing:params.spacing })
        for (var j=0; j < polys.length; j++){ // get each polygon (letter)
            var poly = polys[j];
        }
        drawing = true;
    });
}

function setup(){
    createCanvas(windowWidth,windowHeight)
    background(0)
    params = new Parameters();
    getPoints();
}


function draw(){    // draw is an infinite loop that runs until the page is closed.
    
    // Background paint.
    noStroke();
    fill(params.background)
    rect(0,0,windowWidth,windowHeight)

    if (drawing) {

        translate(params.xoffset, params.yoffset);

        // Each polygon.
        for (var i = 0 ; i < polys.length ; i++) {

            var letterVectors = polys[i].state.vectors;

            if(typeof polys[i-1] !== 'undefined') {
                var thisLetter = new Letter(letterVectors, polys[i-1].state.vectors);
            } 
            else {
                var thisLetter = new Letter(letterVectors);
            }
            thisLetter.draw();
        }
    }
}

function Letter(letterVectors, prevVectors){
    
    this.draw = function(){
 
        noStroke();

        // Detect if current polygon was contained inside the previous polygon.
        // In that case, we're drawing the center / hole in a letter so the fill
        // can be inverted.
        if(this.polygonContained(letterVectors, prevVectors)) {
            fill(0);
        } 
        else {
            fill(255);
        }

        beginShape();
        for (var j = 0 ; j < letterVectors.length ; j++) {
            vertex(letterVectors[j].x, letterVectors[j].y);
        }
        endShape(CLOSE);
    }

    this.polygonContained = function(currentVectors, prevVectors) {
        
        for (var j = 0 ; j < currentVectors.length ; j++) {
            if(this.pointInPolygon(letterVectors[j], prevVectors)) {
                return true;
            }
            return false;
        }
    }

    // Check if every point in the current polygon is contained by the previous.
    // This is to check if we're printing the center / hole of a letter.
    this.pointInPolygon = function (point, vs) {

        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        var xi, xj, i, intersect,
            x = point['x'],
            y = point['y'],
            inside = false;

        if (typeof vs !== 'undefined') {
            for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
              xi = vs[i]['x'],
              yi = vs[i]['y'],
              xj = vs[j]['x'],
              yj = vs[j]['y'],
              intersect = ((yi > y) != (yj > y))
                  && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              if (intersect) {
                inside = !inside;
              }
            }
        }
        return inside;
    }
}

var Parameters = function(){

    this.font = "../fonts/Frequency/Frequency_AW.ttf";
    this.message = 'LOUDER';
    this.spacing = 1;
    this.size = window.innerWidth / 4;

    this.background = [0,0,0,25 ];
    this.color = [255,255,255,7.5];
    this.particle_size = 10;
    this.repulsion_threshold = 150;

    this.xoffset = windowWidth/4 - this.size/2
    this.yoffset = windowHeight/2

    this.regenerate = function(){
        background(0);
        getPoints();
    }

    this.save = function(){
        saveCanvas()
    }

    this.clear = function(){
        background(0);
    }

    this.preset0 = function(){
        this.spacing = 3;
        this.size = 400;

        this.background = [0,0,0,25];
        this.color = [237,34,93,8];
        this.particle_size = 10;
        this.repulsion_threshold = 150;
    }

    this.preset1 = function(){
        this.spacing = 10;
        this.size = 400;

        this.background = [0,0,0,50];
        this.color = [237,34,93];
        this.particle_size = 2;
        this.repulsion_threshold = 50;
    }

    this.preset2 = function(){
        this.spacing = 8;
        this.size = 375;

        // TODO: Solid letters - still with the repulsion on mouseover.
        //
        // TODO: Slight particle movement when mouse is still.
        // TODO: Using something like: https://p5js.org/examples/math-noise-wave.html
        // TODO: Can the noise be a realtime param? To take musical note/freq instead of random noise?

        this.background = [0,0,0,50];
        // this.color = [237,34,93,7];
        this.color = [255,255,255,7];

        this.particle_size = 5;
        this.repulsion_threshold = 50;
    }
}




// Chladni pattern functions:


// http://paulbourke.net/geometry/chladni/
// var m = 10;
// var n = 2;
// var epsilon = 0.05;
// var pg

// function setup() {
//     createCanvas(windowWidth, windowHeight);
//     pg = createGraphics(320, 240)
//     pg.background(0);
//     pg.pixelDensity(1)
//     pixelDensity(1)
// }

// function draw() {
//     m = map(mouseX, 0, width, 1, 20);
//     n = map(mouseY, 0, height, 1, 20);

//     pg.strokeWeight(1.5)
//     pg.background(0);
//     pg.noFill()
//     //pg.fill(255)
//     pg.stroke(255, 15);

//     for (var y = 0; y < pg.height; y++) {
//         for (var x = 0; x < pg.width; x++) {
//             var chladni = cos(n * PI * x / pg.width) * cos(m * PI * y / pg.width) - cos(m * PI * x / pg.width) * cos(n * PI * y / pg.width);
//             if (abs(chladni) <= epsilon) {
//                 pg.ellipse(x, y, 20,20);
//             }
//         }
//     }

//     for (var i = 0; i < windowWidth / pg.width; i++) {
//         for (var j = 0; j < windowWidth / pg.width; j++) {

//             image(pg, i*pg.width, j*pg.height)
//         }
//     }


//     /*
//     var params = "m=" + int(m) + "; n=" + int(n) + "; epsilon=" + epsilon;
//     fill(0, 205, 255);
//     textSize(20)
//     text(params, 5, 15);*/

// }

// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
// }
