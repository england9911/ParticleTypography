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
    particles = [];

    f.load(function(err){
        path = f.toPath(params.message, 0, 0, params.size)
        polys = path.toPolygons({ spacing:params.spacing })

        for (var j=0; j < polys.length; j++){ // get each polygon (letter)
                var poly = polys[j];
                for(var k = 0; k < poly.state.vectors.length; k++) { // get each point of each polygon
                    var vec = poly.state.vectors[k];
                    // push particles into the outline of the letter.
                    particles.push(new Particle(random(0-params.xoffset,windowWidth-params.xoffset), random(0-params.yoffset,windowHeight-params.yoffset), vec.x,vec.y));
                }
        }
        drawing = true;
    });
}


function setup(){
    createCanvas(windowWidth,windowHeight)
    background(0)

    params = new Parameters();
    // create dat.gui drawer
    gui = new dat.GUI();
    // gui setup
    var f2 = gui.addFolder('configuration / path generation');
    var f1 = gui.addFolder('real-time parameters');

    // Configuration parameters
    // font selector
    f2.add(params, 'font', {Avenir : "../fonts/AvenirNextLTW01-Medium.woff", BlackOpsOne : "../fonts/Black_Ops_One/BlackOpsOne-Regular.ttf",
                            Comfortaa : "../fonts/Comfortaa/Comfortaa-Bold.ttf",
                            UnicaOne : "../fonts/Unica_One/UnicaOne-Regular.ttf",
                            FrequencyWave : "../fonts/Frequency/Frequency_wav_AW.ttf",
                            Frequency : "../fonts/Frequency_AW.ttf"});
    f2.add(params, 'message');
    f2.add(params, 'spacing', 2, 40).listen();
    f2.add(params, 'size', 100, 1000).listen();
    f2.add(params, 'regenerate');

    f1.addColor(params, 'background').listen();
    f1.addColor(params, 'color').listen();
    f1.add(params, 'particle_size',5,20).listen();
    f1.add(params, 'repulsion_threshold',10,500 ).listen();
    f1.add(params, 'xoffset',0,windowWidth-300).listen();
    f1.add(params, 'yoffset',0,windowHeight).listen();

    gui.add(params, 'preset0').listen();
    gui.add(params, 'preset1').listen();
    gui.add(params, 'preset2').listen();

    gui.add(params, 'clear')
    gui.add(params, 'save')

    getPoints();
}


function draw(){    // draw is an infinite loop that runs until the page is closed.
    noStroke();
    fill(params.background)
    rect(0,0,windowWidth,windowHeight)

    if (drawing){

            push()
                translate(params.xoffset, params.yoffset)
                // strokeWeight(params.strokeWeight)
                // stroke(params.color);
                // stroke([24,133,13,7.5]);
            for (var i = 0 ; i < particles.length ; i++){
                particles[i].attract();
                particles[i].repulse(mouseX,mouseY);
                particles[i].check_bounds();
                particles[i].update();
                particles[i].draw();
            }
            pop();
    }
}


function Particle(x,y,tx,ty){
    this.x =x ;
    this.y =y;
    // Make particles between these two sizes at random.
    this.size = random(1,2);

    var r = random(1)
    var sign = 1
    if(r < 0.5){
        sign = -1
    }
    this.xspeed = sign * random(1,2)

    r = random(1)
    sign = 1
    if(r < 0.5){
        sign = -1
    }
    this.yspeed = sign * random(1,2)

    //this.xspeed = 0;
    //this.yspeed = 0;

    this.xacc = 0;
    this.yacc = 0;

    this.targetX = tx;
    this.targetY = ty;

    // Draw particle, fill with colour and set size based on params.
    this.draw = function(){
        fill(params.color);
        noStroke();
        ellipse(this.x, this.y, params.particle_size*this.size, params.particle_size*this.size);
    }

    this.update = function(){
        this.xspeed += this.xacc
        this.yspeed += this.yacc

        this.x = this.x + this.xspeed
        this.y = this.y + this.yspeed

        this.xacc = 0;
        this.yacc = 0;
    }

    this.check_bounds = function(){
        if (this.x < 0-params.xoffset || this.x> windowWidth-params.xoffset){
            this.xspeed = - this.xspeed;
        }
        else if (this.y<0-params.yoffset || this.y>windowHeight-params.yoffset){
            this.yspeed = - this.yspeed;
        }
    }

    this.repulse = function(x,y){
        var vmouse = createVector(x-params.xoffset,y-params.yoffset)
        var vpos = createVector(this.x, this.y)
        var frict = createVector(this.xspeed,this.yspeed);

        frict.normalize();
        frict.mult(-1)
        frict.mult(0.05)
        this.xacc += frict.x;
        this.yacc += frict.y;

        if( dist(vmouse.x,vmouse.y, vpos.x, vpos.y)< params.repulsion_threshold){
            var dir = vpos.sub(vmouse);
            var d = dir.mag();
            dir.normalize();
            dir.mult(1);
            dir.div(1/d*d)
            dir.mult(0.5)
            this.xacc += dir.x;
            this.yacc += dir.y;
        }
    }

    this.attract = function(){
        var vtarget = createVector(this.targetX,this.targetY)
        var vpos = createVector(this.x, this.y)
        var frict = createVector(this.xspeed,this.yspeed);

        frict.normalize();
        frict.mult(-1)
        frict.mult(0.055)
        this.xacc += frict.x;
        this.yacc += frict.y;


        var dir = vpos.sub(vtarget);
        var d = dir.mag();
        dir.normalize();
        dir.mult(-1);
        dir.div(1/d*d)
        dir.div(5)
        this.xacc += dir.x;
        this.yacc += dir.y;
    }
}


var Parameters = function(){

    this.font = "../fonts/Frequency/Frequency_AW.ttf";
    this.message = 'LOUDER';
    this.spacing = 5;
    this.size = 375;

    this.background = [0,0,0,25 ];
    this.color = [255,255,255,7.5];
    this.particle_size = 10;
    this.repulsion_threshold = 150;

    this.xoffset = windowWidth/3 - this.size/2
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
        // OR
        // TODO: Different colour particles
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
