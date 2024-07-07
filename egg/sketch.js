const bgColour = "#FFFFFF";
const eggColour = "#FCE79E";
const insideColour = "#BBBBBB";//#CBB771;
const eggs = Array(20).fill(0).map(x => Array(2).fill(0))//[20][2];
let currentEgg = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(bgColour);
  drawEgg(0);
}

function drawEgg(i) {
  if (i == eggs.length) {
    return;
  }
  //calculate egg size
  const eggW = min(width, height) / 2 / (i + 1);
  const eggH = eggW * 1.3;
  // const eggH = height / 2 / (i + 1);
  //Draw Inside Of Egg
  fill(insideColour);
  ellipse(width/2, height/2 + eggs[i][0], eggW, eggH/5);
  //Draw Child Egg
  drawEgg(i + 1);
  //Draw Bottom Egg Shell Piece
  fill(eggColour);
  arc(width/2, height/2 + eggs[i][0], eggW, eggH, 0, PI);
  //Draw Bottom Egg Shell Rim
  fill(insideColour);
  arc(width/2, height/2 + eggs[i][0], eggW, eggH / 5, 0, PI);
  //Draw Top Egg Shell Piece
  fill(eggColour);
  ellipse(width/2, height/2 - eggs[i][0], eggW, eggH / 5);
  //Draw Top Egg Shell Rim
  fill(eggColour);
  arc(width/2, height/2 - eggs[i][0], eggW, eggH, PI, 2*PI);
  //Modify gap size based on growth rate in eggs[i][1] (keep within bounds
  if ((eggs[i][0] < height / 2 && eggs[i][1] > 0) || (eggs[i][0] > 0 && eggs[i][1] < 0)) {
    eggs[i][0] += eggs[i][1];
    //Don't let it grow bigger than parent egg
    if (i > 0) {
      eggs[i][0] = min(eggs[i][0], eggs[i-1][0]);
    }
  }
  //Draw Whole Egg (when closed)
  if (eggs[i][0] == 0) {
    ellipse(width/2, height/2, eggW, eggH);
  }
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    eggs[currentEgg][1] = 1;
  }
  if (keyCode == DOWN_ARROW) {
    eggs[currentEgg][1] = -1;
  }
  if (keyCode == ENTER) {
    eggs[currentEgg][1] = 0;
  }
  if (keyCode == LEFT_ARROW) {
    currentEgg = max(0, currentEgg - 1);
  }
  if (keyCode == RIGHT_ARROW) {
    if (eggs[currentEgg][0] != 0) {
      currentEgg = min(eggs.length - 1, currentEgg + 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}