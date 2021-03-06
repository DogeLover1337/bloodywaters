// cache our canvas and context to draw
var canvas;
var ctx;
var gameOver = true;
var backpos = 0;
var speed = -3;
var score = 0;
var badGuysArray = [];
var shark = {
	x: 380,
	y: 350,
	yAccel: 0,
	landing: false,
	jumpCounter: 0,
	invulnerable: false,
	width: 90,
	height: 36
}
var death = {
	x: 100,
	y: 300,
	width: 120,
	height: 120

}
var doot = new Audio("sounds/doot.mp3");
var recordscratch = new Audio("sounds/recordscratch.mp3")
var sharkSprite = new Image();
sharkSprite.src = "images/swimdefault1.png";
var background = new Image();
background.src = "images/background.png";
var deathSprite = new Image();
deathSprite.src = "images/death.png";
var logSprite = new Image();
logSprite.src = "images/log.png";
var flyingLog = new Image();
flyingLog.src = "images/airlog.png";

// cache inputs
var keys = [];

window.onkeydown = function (e) {
	keys[e.key] = true;
};

window.onkeyup = function (e) {
	keys[e.key] = false;
};

// initialize our variables and start our game loop
function startGame() {
	canvas = document.getElementById("gc");
	ctx = canvas.getContext("2d");

	var fps = 60 / 1000;
	window.setInterval(update, fps); 
	window.setInterval(swimtimer, (speed + 6)*100);
	window.setInterval(function(){
		if(!gameOver){
		doot.play();
	}
	}, 192000)
	window.setInterval(function(){
		var oneBadGuy = new BadGuy();
 		badGuysArray.push(oneBadGuy);
	}, 10000)
	draw();
}

function restartGame(){
	score = 0;
	backpos = 0;
	speed = -3;
	shark.y = 0;
	shark.x = 380;
	shark.landing = true;
	shark.invulnerable= false;
	death.x = 100;
	gameOver=false;
	badGuysArray = [];
	for(var i = 0; i < 1; i++){
  	 	var oneBadGuy = new BadGuy();
 		badGuysArray.push(oneBadGuy);
	}
	shark.invulnerable = true;
   	setTimeout(function(){
   		shark.invulnerable = false;
   	}, 2000);
	doot.load();
	doot.play();
}

// game loop
function update() {
	if(!gameOver){
		handleLogic();
		draw();
	}
}

function playDoot(){
	if(!gameOver){
		doot.play();
	}
}

function swimtimer() {
	
	if (sharkSprite.src.endsWith("images/swimdefault1.png")){
		sharkSprite.src="images/swimdefault2.png";
		
	}else{
		sharkSprite.src="images/swimdefault1.png";
	}
	speed-= 0.05;
	score++;
}

// handle inputs, handle player, handle enemies, etc
function handleLogic() {
	if (keys["ArrowRight"] && shark.x < 900) {
		shark.x+=2;
	}
	if (keys["ArrowLeft"] && shark.x > -90) {
		shark.x-=2;
	}
	if (keys["ArrowUp"] && shark.yAccel >= -2.5 && !shark.landing) {
		shark.yAccel = -2.5; 
		shark.jumpCounter++;
		if (shark.jumpCounter > 125) {
		shark.landing = true;
		}
	}
	//handles gravity
	shark.y+=shark.yAccel;
	if(shark.yAccel <= 4 && shark.y < 350){
		shark.yAccel+=0.1;
		sharkSprite.src="images/jumping.png";
		shark.height = 90;
	}else if(shark.y > 350){
		shark.y = 350;
		shark.jumpCounter = 0;
		shark.landing = false;
		shark.height = 36;
	}
	console.log(shark.yAccel + ", " + shark.y);

	//handles speed
	backpos+=speed;
	if(death.x>-20){
		death.x+=speed+2
	}else{
		death.x++;
	}
	console.log(speed, speed+2);

	//handles death & slowdown
	if(checkCollisions(shark, death)){
		gameOver = true;
		doot.pause();
		recordscratch.play();
		ctx.drawImage(sharkSprite, shark.x, shark.y, shark.width, shark.height);
	}
	for(var i = 0; i < badGuysArray.length; i++){
  		if(checkCollisions(badGuysArray[i], shark)){
   			if(!shark.invulnerable){
   				badGuysArray[i].x = 900;
   				badGuysArray[i].y = Math.random()*350; 
   				speed += 1;
   				shark.invulnerable = true;
   				setTimeout(function(){
   					shark.invulnerable = false;
   				}, 2000);
   			}
  		}
  		if(badGuysArray[i].x < -90){
  			badGuysArray[i].x = 900;
   			badGuysArray[i].y = Math.random()*350;  
  		}
  		if(badGuysArray[i].y >= 350){
  			badGuysArray[i].airborne = false;
  		}else{
  			badGuysArray[i].airborne = true;
  		}
	}


}

function BadGuy(){
	if((Math.random()+1)*(score) > score+30){
		this.airborne = true;
		this.y = Math.random()*400;
	}else{
		this.y = 350;
		this.airborne = false;
	}
  	this.x = Math.random()*1200;
  	this.width = 90;
  	this.height = 36;
}



// draw our game to the canvas
function draw() {
	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// draw background
	ctx.fillStyle = "black";
	ctx.drawImage(background, backpos+900, 0, 900, 700);
    ctx.drawImage(background, backpos, 0, 900, 700);
    ctx.drawImage(background, backpos-900, 0, 900, 700);
    if(backpos > 900 || backpos < -900){
        backpos=0;
    }
    // draw score
    ctx.fillStyle = "red";
 	ctx.font="30px Arial";
  	ctx.fillText("SCORE: " +  score, 10, 35);
  	if(gameOver){
  		ctx.font="60px Arial"
  		ctx.fillText("CLICK TO BEGIN PLAYING", 80, 200);
  	}
	// draw sprites
	death.y = shark.y+10;
	if(!shark.invulnerable){
		ctx.drawImage(sharkSprite, shark.x, shark.y, shark.width, shark.height);
	}else if (Math.random()*2 > 1){
		ctx.drawImage(sharkSprite, shark.x, shark.y, shark.width, shark.height);
	}
	ctx.drawImage(deathSprite, death.x, death.y, death.width, death.height);

	// draw logs
	for(var i = 0; i < badGuysArray.length; i++){
 	badGuysArray[i].x += speed;
	if(!badGuysArray[i].airborne){
		badGuysArray[i].height = 36;
		ctx.drawImage(logSprite, badGuysArray[i].x, badGuysArray[i].y, badGuysArray[i].width, badGuysArray[i].height);
	}else{
		badGuysArray[i].height = 36;
		badGuysArray[i].y+=Math.random();
		ctx.drawImage(flyingLog, badGuysArray[i].x, badGuysArray[i].y, badGuysArray[i].width, badGuysArray[i].height);
	}
  	
}


}


// collision detection for 2 objects
function checkCollisions(rect1, rect2) {
	if (rect1.x < rect2.x + rect2.width &&
		rect1.x + rect1.width > rect2.x &&
		rect1.y < rect2.y + rect2.height &&
		rect1.height + rect1.y > rect2.y) {
		return true;
	} else {
		return false
	}
}