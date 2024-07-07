let debugFloat;
//Manage cheats and related
let cheats = false; //Prevents a collision from ending game
const codes = [ //All the cheatcodes to enable certain effects
  ['h', 'e', 'l', 'p'],
  ['s', 't', 'o', 'r', 'm'],
  ['l', 'a', 's', 'e', 'r'],
  ['s', 't', 'r', 'o', 'b', 'e'],
  ['a', 'r', 'r', 'o', 'w'],
  ['d', 'o', 'n', 'e'],
  ['b', 'u', 'b', 'b', 'l', 'e'],
  ['c', 'h', 'e', 'c', 'k', 'e', 'r', 's'],
  ['s', 'm', 'a', 'l', 'l'],
  ['h', 'o', 'l', 'e', 's'],
  ['c', 'h', 'e', 's', 's'],
  ['a', 'u', 't', 'o']
];
let cheatCodeCounters = new Array(codes.length); //Counters for how many letters of each above cheat code have been entered in succession
let cheatCodeEffects = new Array(codes.length); //Keeps track of which effects have been activated
let bubble = false;  //Assist bubble effect toggling
let oldTarget = 99; //Determines the pedestrian auto-pilot target

//Initialise movement variables
const speed = 5;
let scrollRate = 0;

//Initialise game-flow variables
let difficulty = 6; //Set number of pedestrians on-screen
let initialDifficulty; //recorded to switch back to when 'storm' cheat turned off
let score = 0; //Track number of yellow stars picked up & asteroids shot
let highScore = 0; //Track best score across multiple restarts (not re-runs)

//Manage game-state and overlays
let textStartY = 150; //Control scrolling on info screen
let titleColour; //Depending on stage, use black or white for titles
let gameInfo = false;
let gameStarted = false; //Variable to control initial play
let gameStartUp = false; //Variable to start movement initially
let gamePaused = false; //Variable to stop/start movement
let gameOver = false; //Variable to stop movement and tint red
let gameWon = false; //Variable to display Done screen
let gameContinued = false; //Variable to remove Done screen and keep going

//Manage specifically end of game animation overlay
let explosionRadius = 15;
let gameOverQuantity = 1;
let framesSinceGameOver;

//Track chosen framerate
let frameRateSelected = 60;

//Initialise grass and related
let grassWidth = 5;
let grassColour = ["#3FA037", "#1D8115", "#2ECB21"]; //Colour: 3 different shades of green
let grass; //Array: of rows, with columns, with x,y,colour

//Initialise pavement and related
const pavementWidth = 40;
let pavementColour = ["#BBBFB1", "#8C8C8C"]; //Colour: Light gray and Dark gray
let pavement; //Array: of rows, with columns, with x,y
let pavementSpecks; //Array: of 200 particles with x,y
let bubbleSize = 1.4; //Value for size of bubble pavement
let patterning = 1; //Used for chess, checkers and strobe effects

//Initialise trees and related
let treeColour = ["#9B5909", "#086709"]; //Colour: Trunk brown, Leaf green
let trees; //Array: of rows, with columns, with x,y,velocityX,velocityY,scale,bulbs,radius
let jitter = 0; //When enabled, places trees in imperfect rows for style

//Initialise player and related
let player = new Array(12); //Array: with x,y,velocityX,velocityY,height,width
let flameColour = ["#FFCD17", "#FF6517", "#06CECC"];
// let window = true; //Control whether to draw window (depending on size)
let bullet = new Array(9); //Manage bullet charactistics
let charging = false; //Manage size of bullet
// let portal = new int[2][3]; //Manage animation for player dash
let portal = new Array(2);
for (let i = 0; i < portal.length; i++) {
  portal[i] = new Array(3);
}
let crosshairMax = 15; //Value for drawing teleport crosshair
let crosshairMin = 7; //Value for drawing teleport crosshair
let targeting = false;
let teleportNow = false;

//Initialise pedestrians and related
let pedestrianColour = ["#818181", "#AAAAAA", "#797979"]; //Colour: 3 different shades of grey
let pedestrianFlameColour = ["#FFCD17", "#F2822C"];
let pedestrians; //Array: of 6 pedestrians with x,y,width,speed,colour
let pedestrianWidthMultiplier = 1; //Increases size based on score
let maxPedestrianWidth; //Introduce maximum regardless of score

//Initialise powerup and related
let powerupRadius = 20;
let powerupColour = ["#CECB06", "#08CE06", "#06CECC", "#FF0000"]; //Colour: Bright Lightning yellow, Fluro-green, Electric blue, Red
let powerups; //Array: of 3 powerup objects, with x,y,eatenStatus,colour
let powerupSlow = 0; //Countdown, effect is active while >0
let powerupShield = 0; //Countdown, effect is active while >0
let powerupSmall = -1; //Countdown, effect is active while >0
let luck;

function setup() {
  createCanvas(400, 600);
  //Populate arrays
  populateGrass();
  populatePavement();
  populatePavementSpecks();
  populateTrees();
  populatePlayer();
  populatePedestrians();
  populatePowerups();
}

function draw() {
  // console.log(frameRate);
  //Draw major game components
  drawGrass();
  drawPavement();
  drawPavementSpecks();
  managePowerups();
  managePlayer();
  managePedestrians();
  manageTrees();
  //Manage game flow
  manageGameState();
  managePowerupBars();
  manageCheatcodes();
  manageColourScheme();
  manageOverlays();
  drawScore();
  //Debug
  if (debugFloat != 0) text(debugFloat, width/2, height/2);
}

function populateGrass() {
  //Populate grass array
  // grass = new int[height/grassWidth + 1][width/grassWidth][3];
  grass = new Array(height/grassWidth + 1);
  for (let i = 0; i < grass.length; i++) {
    grass[i] = new Array(width/grassWidth);
    for (let j = 0; j < grass[i].length; j++) {
      grass[i][j] = new Array(3);
      grass[i][j][0] = j*grassWidth; //x-value
      grass[i][j][1] = i*grassWidth; //y-value
      grass[i][j][2] = Math.floor(random(grassColour.length)); //colour-index
    }
  }
}

function populatePavement() {
  //Populate pavement array
  let pavementTotalWidth = ((width*3)/5);
  // pavement = new int[height/pavementWidth + 1][pavementTotalWidth/pavementWidth][3];
  pavement = new Array(height/pavementWidth + 1);
  //For pavement rows
  for (let i = 0; i < pavement.length; i++) {
    pavement[i] = new Array(pavementTotalWidth/pavementWidth);
    //For pavement columns
    for (let j = 0; j < pavement[i].length; j++) {
      pavement[i][j] = new Array(3);
      pavement[i][j][0] = width/5 + j * pavementWidth; //x-value
      pavement[i][j][1] = i * pavementWidth; //y-value
      pavement[i][j][2] = Math.floor(random(10)); //whether to draw or not when in holes mode
    }
  }
}

function populatePavementSpecks() {
  //Populate pavementSpecks array
  let numberOfSpecks = 200;
  // pavementSpecks = new int[numberOfSpecks][2];
  pavementSpecks = new Array(numberOfSpecks);
  //For each pavement speck
  for (let i = 0; i < pavementSpecks.length; i++) {
    pavementSpecks[i] = new Array(2);
    pavementSpecks[i][0] = Math.floor(random(width*1/5, width*4/5));//x-coord
    pavementSpecks[i][1] = Math.floor(random(height));//y-coord
  }
}

function populateTrees() {
  //Populate trees array
  let rowsOfTrees = 4;
  let columnsOfTrees = 2;
  // trees = new int[rowsOfTrees][columnsOfTrees][6];
  trees = new Array(rowsOfTrees);
  //For each row of trees
  for (let i = 0; i < trees.length; i++) {
    trees[i] = new Array(columnsOfTrees);
    //For each column of trees
    for (let j = 0; j < trees[i].length; j++) {
      trees[i][j] = new Array(6);
      trees[i][j][0] = width*(8*j+1)/10; //x-coord
      trees[i][j][1] = i*height/2; //y-coord
      trees[i][j][2] = Math.floor(random(10, 40)); //scale
      trees[i][j][3] = Math.floor(random(3, 7)); //bulbs
      trees[i][j][4] = Math.floor(random(20, 50)); //radius
      trees[i][j][5] = 0; 
    }
  }
}

function populatePlayer() {
  //Populate player array
  player[0] = width/2; //x-coord
  player[1] = height*9/10; //y-coord
  player[2] = 0; //velocityX
  player[3] = 0; //velocityY
  player[4] = width/10; //player width
  player[5] = Math.floor(height*(70/600.0)); //player height
  player[6] = player[4]; //saves initial width
  player[7] = player[5]; //saves initial height
  player[8] = player[0]; //teleport target x-coord
  player[9] = player[1]; //teleport target y-coord
  player[10] = 0; //teleport target velocityX
  player[11] = 0; //teleport target velocityY
  //Populate bullet array
  bullet[0] = 0;
  bullet[1] = -height; //start player's bullet out of view
  bullet[2] = 0;
  bullet[3] = 0;
  bullet[4] = 0;
  bullet[5] = 0;
  bullet[6] = 0;
  bullet[7] = 0;
  bullet[8] = 0;
}

function populatePedestrians() {
  //Populate pedestrians array
  // pedestrians = new int[difficulty][6];
  pedestrians = new Array(difficulty);
  //For each pedestrian
  for (let i = 0; i < pedestrians.length; i++) {
    pedestrians[i] = new Array(6);
    pedestrians[i][0] = 0;
    pedestrians[i][1] = 2*height; //Starting off the screen immediately activate's re-roll by managePedestrians()
    pedestrians[i][3] = 0;
    pedestrians[i][2] = 0;
    pedestrians[i][4] = 0;
    pedestrians[i][5] = 0;
  }
}

function populatePowerups() {
  //Populate powerups array
  let powerupQuantity = 3;
  // powerups = new int[powerupQuantity][4];
  powerups = new Array(powerupQuantity);
  //For each powerup (coke no sugar)
  for (let i = 0; i < powerups.length; i++) {
    powerups[i] = new Array(4);
    powerups[i][1] = -height; //y-coord
  }
}

function drawGrass() {
  background(grassColour[1]);
  //Iterate through each row of grass
  for (let i = 0; i < grass.length; i++) {
    //Iterate through each column of grass
    for (let j = 0; j < grass[i].length; j++) {
      //Draw grass (use a circle in bubble mode, a square elsewhere)
      noStroke();
      fill(grassColour[grass[i][j][2]]);
      if (bubble) {
        circle(grass[i][j][0], grass[i][j][1], grassWidth);
      } else {
        square(grass[i][j][0], grass[i][j][1], grassWidth);
      }
      //Increment downward by scrollRate
      grass[i][j][1] += scrollRate;
      //Re-roll at bottom (move to top)
      if (grass[i][j][1] >= height) {
        grass[i][j][1] = -grassWidth; //y-coord
        grass[i][j][2] = Math.floor(random(grassColour.length)); //colour
      }
    }
  }
}

function drawPavement() {
  //When in chessboard mode, draw the black tiles
  if (cheatCodeEffects[10]) {
    fill("#000000");
    rect(width/5, 0, width*3/5, height);
  }
  //Iterate through each row of pavers
  for (let i = 0; i < pavement.length; i++) {
    //Iterate through each column of pavers
    for (let j = 0; j < pavement[i].length; j++) {
      //Draw pavement
      let coolPatterns = [2, 3, 6, 6]; //list of integers that create interesting patterns in strobe mode
      if (frameCount % 4 == 0 && scrollRate != 0) { //reroll patterning value every couple of frames (only used in strobe)
        patterning = (cheatCodeEffects[3]) ? coolPatterns[Math.floor(random(4))] : (cheatCodeEffects[7]) ? 2 : 1;
      }
      fill(pavementColour[0]);
      stroke(pavementColour[1]);
      strokeWeight(2);
      //determine whether to draw a tile in holes mode (using random generated value for each paver)
      let drawTile = (cheatCodeEffects[9]) ? (pavement[i][j][2] > 5) : true;
      //if drawTile is true, and if the tile's x and y positions fit the patterning value, draw the tile
      if (((j%patterning == 0 && i%patterning == 0) || (j%patterning == 1 && i%patterning == 1)) && drawTile) {
        //use a circle in bubble mode, otherwise use a square
        if (bubble) {
          circle(pavement[i][j][0] + pavementWidth/2, pavement[i][j][1] + pavementWidth/2, pavementWidth * bubbleSize);
          noFill();
        } else {
          square(pavement[i][j][0], pavement[i][j][1], pavementWidth);
        }
      }
      //Increment downward by scrollRate (evaluates to zero when scrolling is false, used throughout)
      pavement[i][j][1] += scrollRate;
      //Re-roll at bottom (move to top)
      if (pavement[i][j][1] >= height) {
        pavement[i][j][1] = -pavementWidth; //y-coord
        pavement[i][j][2] = Math.floor(random(10)); //holes random value
      }
    }
  }
}

function drawPavementSpecks() {
  //Iterate through each speck
  for (let i = 0; i < pavementSpecks.length; i++) {
    //Draw speck
    stroke(pavementColour[1]);
    circle(pavementSpecks[i][0], pavementSpecks[i][1], 1);
    //Increment downward by scrollRate
    pavementSpecks[i][1] += scrollRate;
    //Re-roll at bottom (move to top)
    if (pavementSpecks[i][1] >= height) {
      pavementSpecks[i][1] = -1; //y-coord
    }
  }
}

function manageTrees() {
  //Iterate through each row of trees
  for (let i = 0; i < trees.length; i++) {
    //Iterate through each column of trees
    for (let j = 0; j < trees[i].length; j++) {
      //Draw the tree by handing values to drawTree function
      drawTree(
        trees[i][j][0], trees[i][j][1] + trees[i][j][5],
        trees[i][j][2], trees[i][j][4], 
        trees[i][j][3]
        );
      //Increment downward by scrollRate
      trees[i][j][1] += scrollRate; //y-coord
      //Re-roll at bottom (move to top)
      if (trees[i][j][1] >= 4*height/3) {
        trees[i][j][1] = -height/3; //y-coord
        trees[i][j][2] = Math.floor(random(10, 40)); //scale
        trees[i][j][3] = Math.floor(random(3, 10)); //bulbs
        trees[i][j][4] = Math.floor(random(10, 80)); //branch radius
        trees[i][j][5] = Math.floor(random(-jitter, jitter)); //y-jitter
      }
    }
  }
}

function drawTree(x, y, scale, radius, bulbs) {
  //Draw trunk
  fill(treeColour[0]);
  noStroke();
  circle(x, y, scale);
  //Repeat for each bulb
  for (let i = 0; i < bulbs; i++) {
    //Calculate positions of bulbs/branches
    const angle = (i / (float)(bulbs)) * 2 * PI;
    const branchEndX = x+radius*cos(angle);
    const branchEndY = y-radius*sin(angle);
    //Draw branch
    stroke(treeColour[0]);
    strokeWeight(5);
    line(x, y, branchEndX, branchEndY);
    //Draw bulb
    noStroke();
    fill(treeColour[1]);
    star(branchEndX, branchEndY, (scale*1.3), (scale*1.2), Math.floor(scale));
  }
}

function managePlayer() {
  movePlayer(); //Updates position with velocity as governed by WASD
  moveAutopilotPlayer(); //Teleports horizontally to aim at nearest pedestrian, in auto mode
  moveTeleportTarget(); //Updates position with velocity as governed by LEFT,RIGHT,UP,DOWN
  drawTeleportTarget(); //Draws a crosshair at the teleport target
  drawPortal(); //Draws portals when player dash teleports
  drawBullet(); //Draws a bullet when player shoots
  drawPlayer(player[0], player[1]); //Draws the actual player, a rocketship
}

function movePlayer() {
  //set velocity to zero if gameState is stopped
  if (scrollRate == 0) player[2] = player[3] = 0;
  //when in slowmotion powerup, double speed to compensate
  if (powerupSlow > 0) {
    if (abs(player[2]) == scrollRate) player[2] *= 2;
    if (abs(player[3]) == scrollRate) player[3] *= 2;
  }
  //add x&y velocities to x&y coords, so long as within boundaries of wally's walks
  player[0] = Math.floor(within(player[0] + player[2], width/5 + player[4]/2, width*4/5 - player[4]/2));
  player[1] = Math.floor(within(player[1] + player[3], 0 + player[5]/2, height - player[5]/2));
}

function moveAutopilotPlayer() {
  if (cheatCodeEffects[11]) {
    //Calculate closest pedestrian
    let maxY = 0;
    for (let i = 0; i < pedestrians.length; i++) maxY = max(maxY, (pedestrians[i][1] < player[1]) ? pedestrians[i][1] : 0);
    //Get the x position of that pedestrian and move player directly in line
    for (let i = 0; i < pedestrians.length; i++) {
      //if this pedestrian matches the one selected earlier, teleport
      if (pedestrians[i][1] == maxY) {
        //control animation
        let autopilotTeleport = false;
        if (player[0] != pedestrians[i][0]) autopilotTeleport = true;
        if (autopilotTeleport) setPortal(1);
        player[0] = Math.floor(within(pedestrians[i][0], width*1/5, width*4/5));
        if (autopilotTeleport) setPortal(0);
        //shoot (condition makes sure only one bullet is fired per pedestrian, otherwise reload time breaks autopilot
        if (oldTarget != i) {
          bullet[0] = player[0]; //bullet x-coord = player x-coord
          bullet[1] = player[1]; //bullet y-coord = player y-coord
          bullet[3] = -scrollRate * 4; //bullet velocity (4x speed in autopilot mode)
          bullet[4] = 1; //'boolean'ish to control whether bullet is active
          oldTarget = i; //note down which pedestrian this was
        }
      }
    }
  }
}

function moveTeleportTarget() {
  //set velocity to zero if gameState is stopped
  if (scrollRate == 0) player[2] = player[3] = 0;
  //add x&y velocities to x&y coords, so long as within boundaries of wally's walks
  player[8] = Math.floor(within(player[8] + player[10], width/5 + crosshairMax, width*4/5 - crosshairMax));
  player[9] = Math.floor(within(player[9] + player[11], crosshairMax, height - crosshairMax));
}

function drawTeleportTarget() {
  //when playing is aiming the teleport crosshairs, draw them. otherwise, keep the crosshair location = to player location
  if (targeting) {
    strokeWeight(10);
    stroke("#00FF00");
    fill("#FF0000");
    point(player[8], player[9]);
    strokeWeight(4);
    line(player[8]+crosshairMin, player[9]+crosshairMin, player[8]+crosshairMax, player[9]+crosshairMax);
    line(player[8]+crosshairMin, player[9]-crosshairMin, player[8]+crosshairMax, player[9]-crosshairMax);
    line(player[8]-crosshairMin, player[9]+crosshairMin, player[8]-crosshairMax, player[9]+crosshairMax);
    line(player[8]-crosshairMin, player[9]-crosshairMin, player[8]-crosshairMax, player[9]-crosshairMax);
    noStroke();
  } else {
    player[8] = player[0];
    player[9] = player[1];
  }
  //when player actually hits teleport, draw animation and change x&y coords of player, turn off targeting
  if (teleportNow) {
    setPortal(1);
    player[0] = player[8];
    player[1] = player[9];
    setPortal(0);
    targeting = false;
    teleportNow = false;
  }
}

//doesn't really follow the order but makes more sense here than at the end (called by keyRelease() )
function setPortal(i) {
  //sets one of two portal locations
  portal[i][0] = player[0]; //x-coord
  portal[i][1] = player[1] - 10; //y-coord
  portal[i][2] = i * 10; //frame-wise countdown for animation
}

function drawPortal() {
  //if the first portal's countdown is active, draw a star (starts small, grows)
  if (portal[0][2] < 10) {
    fill("#FF00FF80"); //transparent purple
    star(portal[0][0], portal[0][1], scrollRate * portal[0][2], scrollRate * 0.8 * portal[0][2], 7);
    portal[0][2]++; //increase size
  }
  //if second portal's countdown is active, draw a star (starts big, shrinks)
  if (portal[1][2] > 0) {
    fill("#FF00FF80"); //transparent purple
    star(portal[1][0], portal[1][1], scrollRate * portal[1][2], scrollRate * 0.8 * portal[1][2], 7);
    portal[1][2]--; //decrease size
  }
}

//out of order again but makes more sense here, called by keyRelease()
function dashPlayer() {
  //Only if game moving
  if (scrollRate != 0) {
    //Draw exit portal
    setPortal(1);
    //Move player, depending on current velocity (if not moving, dash forward
    if (player[2] == 0 && player[3] == 0) {
      player[1] = max(player[1] - 30 * scrollRate, 0 + player[5]);
    } else {
      //otherwise, dash in direction of movement
      player[0] = Math.floor(within(player[0] + player[2] * 20, width/5 + player[4], width*4/5 - player[4]));
      player[1] = Math.floor(within(player[1] + player[3] * 20, 0 + player[5], height - player[5]));
    }
    //Draw entry portal
    setPortal(0);
  }
}

//Out of the order again but makes more sense here, called by keyRelease()
function shootBullet() {
  //Only allow shooting if bullet has travelled full screen (or hit something) and gameState is moving
  if (bullet[1] <= 0 && scrollRate != 0) {
    bullet[0] = player[0]; //x-coord
    bullet[1] = player[1]; //y-coord
    bullet[3] = -scrollRate * 2; //velocity
    bullet[4] = 1; //tracks whether to draw bullet or not (0 if it collides with something)
  }
}

function drawBullet() {
  //Increase bullet size while charging
  if (charging && scrollRate != 0) {
    bullet[8]++;
  }
  //If laser cheatcode enabled, draw a laser
  if (cheatCodeEffects[2]) {
    strokeWeight(max(20, bullet[8])/4);
    stroke(255, 0, 0);
    line(player[0], player[1], player[0], 0);
  } else {
    //Otherwise, if visible (that's what bullet[4] tracks) draw a normal bullet
    if (bullet[4] == 1) {
      //Change the colour of bullet depending on y-coord, for flash effect
      if (bullet[1]/30%2==0) {
        fill("#96A7AF");
      } else {
        fill("#B5E6FC");
      }
      //Actually draw the bullet circle (minimum size is 20)
      circle(bullet[0], bullet[1], max(20, bullet[8]));
    }
    //Draw shrinking explosion on collision sites (collision coords and frames stored in bullet array)
    if (bullet[7] > 0) {
      drawExplosion(bullet[5], bullet[6], bullet[7]*5, 7);
      bullet[7]--; //framecount for animation
    }
    //Move the bullet by it's velocity
    if (scrollRate != 0) {
      bullet[0] += bullet[2]; //Increase bullet X by bullet X velocity
      bullet[1] += bullet[3]; //Increase bullet Y by bullet Y velocity
    }
  }
}

function drawPlayer(x, y) {
  //calculate size of body (accounts for size changes)
  let bodyWidth = Math.floor(player[4] * 3.0/4);
  let bodyHeight = Math.floor(player[5] * 5.0/7);
  let bodyFactor = Math.floor(30.0/bodyWidth);
  noStroke();
  //Flames
  drawPlayerFlame(x, y, bodyWidth, bodyHeight, bodyFactor);
  //Main body:
  //Admittedly gross line, but replaces a bulky chunk of code, picks rocket body colour
  fill((powerupSmall > 0 && powerupSmall < 40 && frameCount/5%2==0 && !cheatCodeEffects[8] && scrollRate != 0) ? "#FFFFFF" : (cheats) ? "#BF1111" : "#8EB1C1");
  //^^if powerupSmall is running out, flash rocket white every few frames, otherwise if cheats are on use red, otherwise use steel blue
  //Decide the structure of the rocket (bubble and small mean some detail won't be drawn)
  if (bubble) {
    //Draw lots of circles to make an oval
    for (let i = 0; i < player[5] - bodyHeight*2/3; i++) {
      circle(x, y - i, bodyHeight*2/3);
    }
  } else {
    //Draw a pointy rocket ship arc
    arc(x, y, bodyWidth, bodyHeight * 2, -PI, 0, CLOSE);
    rect(x-bodyWidth/2, y, bodyWidth, bodyHeight/5);
    if (player[4] >= player[6]) { //if rocket is not in small mode, draw all the extra details (fins, window)
      //Fins
      fill("#469BC1"); //Colour: Steel-blue
      let finHeight = height/60;
      let finWidth = width/40;
      let finStart = -width/40;
      triangle(x-finStart, y-5-finHeight, x-finStart, y+5, x-finStart+finWidth, y+5);
      triangle(x+finStart, y-5-finHeight, x+finStart, y+5, x+finStart-finWidth, y+5);
      rect(x-1, y-15, 2, 20);
      //Window: Determine fill colour on whether bullet is reloaded
      fill((bullet[1] <= 0) ? "#B5E6FC" : "#FFFFFF");
      circle(x, y-30, 15);
    }
  }
  //Shield
  if (powerupShield > 0) { //If powerupShield is active, draw a shield around the player,
    fill((powerupShield < 90 && frameCount/10%2==0) ? "#0000FF00" : "#6000FF00"); //Flash when running out
    ellipse(x, y-5, player[4] * 2.375, player[5] * 1.35);
  }
}

function drawPlayerFlame(x, y, bodyWidth, bodyHeight, bodyFactor) {
  //calculate where the flames start (initial because the two layers of flames are drawn by changing the base)
  let initialFlameBaseY = (bodyFactor == 0) ? y : y + height/60/bodyFactor;
  //Draw two layers of flames using fairly ugly loop: loops through twice with the two colours of flames
  for (let flameBaseY = initialFlameBaseY; flameBaseY >= initialFlameBaseY - height/75; flameBaseY-=height/75) {
    //Calculate some flame positions
    let minorFlameEndY = flameBaseY + height/40 - player[3];
    let majorFlameEndY = flameBaseY + 3*height/80 - player[3];
    //Determine flame colour
    fill((flameBaseY == initialFlameBaseY) ? flameColour[0] : (powerupSlow > 0) ? flameColour[2] : flameColour[1]);
    //Determine flame shape
    if (bubble) {
      //Draw thick lines
      if (bodyFactor == 1) { //Only draw peripheral flames if body is full-sized
        stroke(flameColour[0]);
        strokeWeight(player[4]/4);
        line(x-5, y, x-5-player[2]/bodyFactor, minorFlameEndY);
        line(x+5, y, x+5-player[2]/bodyFactor, minorFlameEndY);
        noStroke();
      }
      //Draw main flame
      stroke(flameColour[1]);
      strokeWeight(player[4]/4);
      line(x, y, x-player[2]/bodyFactor, majorFlameEndY);
      noStroke();
    } else {
      //Draw actual triangles
      if (bodyFactor == 1) { //Only draw peripheral flames if body is full-sized
        triangle(x-bodyWidth/2, flameBaseY, x-5, flameBaseY, x-10-player[2]/bodyFactor, minorFlameEndY);
        triangle(x+bodyWidth/2, flameBaseY, x+5, flameBaseY, x+10-player[2]/bodyFactor, minorFlameEndY);
      }
      //Draw main flame
      triangle(x-8*bodyWidth/30.0, flameBaseY, x+8*bodyWidth/30.0, flameBaseY, x-player[2], majorFlameEndY);
    }
  }
}

function managePedestrians() {
  //Iterate through each of 6 pedestrians
  for (let i = 0; i < pedestrians.length; i++) {
    //Draw pedestrian
    drawPedestrian(
      pedestrians[i][0], pedestrians[i][1], //x,y
      pedestrians[i][2], pedestrians[i][4], //diameter, colourIndex
      pedestrians[i][5] //Random 0-9 (for special pedestrian draw)
      );
    //Increment downward by individual pedestrian's speed
    if (scrollRate != 0) pedestrians[i][1] += pedestrians[i][3];
    //Re-roll at bottom (move to top)
    if (pedestrians[i][1] - pedestrians[i][2] > height) {
      pedestrianWidthMultiplier = min(2, 1 + score/20.0); //increase average pedestrian size with score, cap at double size
      maxPedestrianWidth = pedestrianWidthMultiplier * width/16; //calculate the biggest a pedestrian can be (ufo will always have this width)
      const pedestrianWidth = Math.floor(random(pedestrianWidthMultiplier * width/40, maxPedestrianWidth)); //calculate a random width for this particular pedestrian
      pedestrians[i][0] = Math.floor(random(width*1/5 + pedestrianWidth, width*4/5 - pedestrianWidth)); //x-coord
      pedestrians[i][1] = Math.floor(random(-height, -pedestrianWidth)); //y-coord
      pedestrians[i][2] = pedestrianWidth; //width
      pedestrians[i][3] = Math.floor(random(scrollRate+1, 10)); //speed
      pedestrians[i][4] = Math.floor(random(pedestrianColour.length)); //colour
      pedestrians[i][5] = Math.floor(random(10)); //chance value for specialPedestrian (will be a UFO if this number is greater  than 7)
    }
    //Up-size the special UFO pedestrians to full size
    if (pedestrians[i][5] > 7) {
      pedestrians[i][2] = Math.floor(maxPedestrianWidth);
    }
    //Handle collisions (By checking position with four different booleans, and acting when all are true)
    let collision = determineCollision(
      pedestrians[i][0], pedestrians[i][1], pedestrians[i][2], pedestrians[i][2],
      player[0], player[1], player[4], player[5]
      );
    //End game if condition met: collision has just occurred and both shield and cheats are inactive
    if (collision && powerupShield <= 0 && !cheats) {
      gameOver = true; //displays game over screen and stops movement
      targeting = false; //makes sure teleport crosshairs are not visible
      managePlayerExplosion((player[0] + pedestrians[i][0])/2, (player[1] + pedestrians[i][1])/2); //draws explosion animation
    }
    //Handle near miss between player and pedestrian
    let nearMiss = determineCollision(
      pedestrians[i][0], pedestrians[i][1], Math.floor(pedestrians[i][2] * 2), Math.floor(pedestrians[i][2] * 1.5),
      player[0], player[1], player[4], player[5]
      );
    //Animation if nearMiss (little star like spark flying)
    if (nearMiss && !collision) {
      fill("#FFFFFF");
      star((player[0] + pedestrians[i][0])/2, (player[1] + pedestrians[i][1])/2, 20, 5, 4);
    }
    //Handle collision with bullet
    let shot = false;
    //if laser is active, pedestrians are 'shot' if just the x value matches up
    if (cheatCodeEffects[2]) {
      shot = dist(pedestrians[i][0], 0, player[0], 0) < (bullet[8]/4 + pedestrians[i][2])/2 && pedestrians[i][1] > 100;
    }
    //otherwise, if the bullet is normal and has been fired, pedestrians are 'shot if x and y values are near
    else if (bullet[4] == 1) {
      shot = dist(pedestrians[i][0], pedestrians[i][1], bullet[0], bullet[1]) < max(20, bullet[8]/2);
    }
    //Remove pedestrian if bullet collides with it
    if (shot) {
      //Just draw the animation if laser is active
      if (cheatCodeEffects[2]) {
        drawExplosion(pedestrians[i][0], pedestrians[i][1], 25, 7);
      } else {
        //If not a laser, manage bullet
        if (!cheatCodeEffects[4]) bullet[1] = -height; //Reset bullet y
        if (!cheatCodeEffects[4]) bullet[4] = 0; //Reset bullet velocity y
        bullet[5] = pedestrians[i][0]; //Multi-frame explosion location x
        bullet[6] = pedestrians[i][1]; //Multi-frame explosion location y
        bullet[7] = 10; //Set frame countdown for multi-frame explosion
        if (!cheatCodeEffects[4]) bullet[8] = 20; //Reset bullet charge size
        if (!cheatCodeEffects[4] || (cheatCodeEffects[4] && bullet[1] > 0)) score++; //Add a point
      }
      pedestrians[i][1] = 2 * height; //Re-roll shot pedestrian
    }
  }
}

function drawPedestrian(x, y, diameter, colourIndex, random) {
  //Draw pedestrian
  noStroke();
  //if random value is bigger than 7 (out of 10), draw a UFO instead
  if (random > 7 && !bubble) {
    drawPedestrianSpecial(x, y, diameter);
  } else {
    //otherwise, draw a normal asteroid
    y -= diameter/2;
    drawPedestrianFlames(x, y, diameter+10, y-diameter*2, y-diameter*4, diameter);
    // console.log(colourIndex);
    // console.log(pedestrianColour[colourIndex]);
    fill(pedestrianColour[colourIndex]);
    // fill("#ff0000");
    star(x, y+diameter/2, diameter, diameter*0.9, 10);
  }
}

function drawPedestrianFlames(baseX, baseY, baseWidth, minorEndY, majorEndY, gap) {
  //if bubble mode is on, draw thick lines as flames
  if (bubble) {
    stroke(flameColour[0]);
    strokeWeight(max(-baseWidth/2, baseWidth/2));
    line(baseX-baseWidth/3, baseY, baseX-baseWidth/3, minorEndY);
    line(baseX+baseWidth/3, baseY, baseX+baseWidth/3, minorEndY);
    stroke(flameColour[1]);
    line(baseX, baseY, baseX, majorEndY);
    noStroke();
  }
  //otherwise, draw triangles
  else {
    //Outer flames
    fill(pedestrianFlameColour[0]); //Colour: Yellow
    triangle(baseX+baseWidth/2, baseY, baseX, baseY, baseX+baseWidth/4, minorEndY);
    triangle(baseX-baseWidth/2, baseY, baseX, baseY, baseX-baseWidth/4, minorEndY);
    triangle(baseX-baseWidth/4, baseY, baseX+baseWidth/4, baseY, baseX, majorEndY);
    //Adjust for inner flames
    baseY+= gap;
    minorEndY += gap;
    majorEndY += gap;
    //Inner flames
    fill(pedestrianFlameColour[1]);
    triangle(baseX+baseWidth/2, baseY, baseX, baseY, baseX+baseWidth/4, minorEndY);
    triangle(baseX-baseWidth/2, baseY, baseX, baseY, baseX-baseWidth/4, minorEndY);
    triangle(baseX-baseWidth/4, baseY, baseX+baseWidth/4, baseY, baseX, majorEndY + gap);
  }
}

function drawPedestrianSpecial(x, y, diameter) {
  //Draw super cool light beam (with gradient transparency and increasing width)
  strokeWeight(2);
  let beamHeight = 5 * diameter / 2;
  let beamWidth1 = 0;
  let beamWidth2 = diameter * 2;
  for (let i = y; i <= y+beamHeight; i++) {
    //reminder: map converts a value within a range to a comparable value in a different range (like rescaling)
    let brightness = map(i, y, y+beamHeight, 255, 0); //convert progress in loop to a transparency alpha value
    let currentWidth = map(i, y, y+beamHeight, beamWidth1, beamWidth2); //convert progress in loop to beam width
    stroke(255, 255, 0, brightness);
    line(x-currentWidth/2, i, x+currentWidth/2, i);
  }
  //Draw main UFO body (grey disc,
  fill("#8EB1C1");
  circle(x, y, diameter*2);
  fill(0, 255, 255);
  circle(x, y, diameter);
  //Draw green light bulbs on UFO
  fill(0, 255, 0);
  let lights = 8;
  for (let i = 0; i < lights; i++) {
    //Calculate positions of UFO lights
    let angle = (i / (1.0 * lights)) * 2 * PI;
    let lightX = x+(diameter/2+diameter/4)*cos(angle);
    let lightY = y-(diameter/2+diameter/4)*sin(angle);
    //Draw a green circle
    circle(lightX, lightY, diameter/5.0);
  }
}

function managePlayerExplosion(x, y) {
  //Draw player death explosion (number of points increases with size)
  let points = min(explosionRadius/7, 7);
  drawExplosion(x, y, explosionRadius, points);
  //Increase size of explosion (up to a certain size)
  if (explosionRadius <= 70) explosionRadius *= 1.15;
}

function drawExplosion(x, y, size, points) {
  //Draw three stars of decreasing size on top of each other and increasing redness
  fill(flameColour[0]);
  star(x, y, size, size/2, points);
  fill(flameColour[1]);
  star(x, y, size*7/10, size*7/20, points);
  fill("#FF0000");
  star(x, y, size*3/10, size*3/20, points);
}

function managePowerups() {
  //Iterate through each of 3 powerup stars
  for (let i = 0; i < powerups.length; i++) {
    //Draw powerup if not eaten yet
    if (powerups[i][2] == 0) drawPowerup(powerups[i][0], powerups[i][1], powerups[i][3]);
    //Increment downward by scrollRate
    powerups[i][1] += scrollRate;
    //Re-roll at bottom (move to top)
    if (powerups[i][1] - powerupRadius >= height) {
      powerups[i][0] = Math.floor(random(width*1/5 + 2 * powerupRadius, width*4/5 - 2 * powerupRadius)); //x-coord
      powerups[i][1] = -powerupRadius; //y-coord
      powerups[i][2] = 0; //picked up or not
      powerups[i][3] = Math.floor(random(powerupColour.length)); //colour
    }
    //Handle collisions (By checking position with four different booleans, and acting when all are true)
    let collision = determineCollision(
      powerups[i][0], powerups[i][1], powerups[i][2], powerups[i][2],
      player[0], player[1], player[4], player[5]
      );
    //If there is a collision (i.e. the player picks up a powerup, determine which effect to apply
    if (collision) {
      //If a yellow star: Give player a point
      if (powerups[i][3] == 0 && powerups[i][2] == 0) score++;
      //If a green star: Activate shield
      if (powerups[i][3] == 1) powerupShield = 240;
      //If a blue star: Activate time-slow
      if (powerups[i][3] == 2) powerupSlow = 180;
      //If a red star: Change player size (Big/Small depends on luck)
      if (powerupSmall <= 0) luck = random(1); //Re-roll luck for size-change, but only once:
      //^this way, if the player picks up more red stars before the powerup runs out, they just increase their time, no risk
      if (powerups[i][3] == 3) powerupSmall = 180;
      //Register this powerup as being consumed (Resets during re-roll at bottom of screen)
      powerups[i][2] = 1;
    }
    //While powerupSlow is positive, reduce frameRate to 30 frames
    frameRateSelected = (powerupSlow > 0) ? 30 : 60;
    frameRate(frameRateSelected);
    //While powerupShield is positive, prevent game from ending
    if (powerupShield > 0) gameOver = false;
    //Control size based on powerupSmall and luck (where player[4]&[5] are current x&y dimensions, and [6]&[7] are original x&y dimensions
    player[4] = (powerupSmall < 0) ? player[6] : (luck >= 0.2) ? player[6]/2 : player[6];
    player[5] = (powerupSmall < 0) ? player[7] : (luck >= 0.2) ? player[7]/2 : Math.floor(player[7]*1.5);
  }
  //Each frame, deduct one from the respective timers (measured in frames not seconds) for each powerup
  if (scrollRate != 0) {
    powerupSlow--;
    powerupShield--;
    if (!cheatCodeEffects[8]) powerupSmall--; //Don't deduct when cheatCode SMALL is active
  }
}

function drawPowerup(x, y, colourIndex) {
  //Draw powerup
  fill(powerupColour[colourIndex]);
  noStroke();
  star(x, y, powerupRadius, powerupRadius/2, 5);
}

function manageGameState() {
  //Manage game startup, triggered by 'b' key
  if (gameStartUp) {
    //Record difficulty
    if (difficulty != 99) initialDifficulty = difficulty;
    //Set game states
    gameStarted = true;
    gameInfo = gameWon = gameContinued = gameStartUp = gameOver = false;
    //Manage specific gameover state controls
    framesSinceGameOver = 0;
    gameOverQuantity = 1;
    explosionRadius = 15;
    //Enable motion
    scrollRate = speed;
    //Disable residual cheats/powerups (important for restarts)
    cheatCodeEffects[2] = false; //Turn off laser
    cheatCodeEffects[9] = false; //Turn off holes
    powerupSlow = powerupShield = powerupSmall = -1;
    //Revert player, bullet, pedestrian & powerup positions
    player[0] = width/2;
    player[1] = height*9/10;
    bullet[1] = -height * 10;
    for (let i = 0; i < pedestrians.length; i++) pedestrians[i][1] = 2*height;
    for (let i = 0; i < powerups.length; i++) {
      powerups[i][0] = Math.floor(random(width*1/5, width*4/5)); //x-coord
      powerups[i][1] = Math.floor(random(-height, 0)); //y-coord
    }
    //Final preparations
    revertColourScheme();
    score = 0;
    populatePedestrians();
  }
  if (gameOver || gamePaused) {
    //Stop motion
    scrollRate = 0;
    //Disable time-slow
    powerupSlow = 0;
  }
  //Control game win
  if (score >= 25 && !gameWon && scrollRate != 0) gameWon = cheats = true;
  //Control grass size
  grassWidth = (bubble) ? 20 : 5;
}

//out of the order here, but makes more sense to me (called by keyPressed())
function returnToMenu() {
  setup();
  gameStarted = false;
  gameOver = false;
  highScore = score = 0;
}

function managePowerupBars() {
  let barY = 580;
  //Draw three bars, reducing y for the next bar only if it was drawn (so they stack nicely)
  if (powerupSlow > 0) {
    drawBar(20, barY, 100, powerupSlow, 180, "#06CECC");
    barY -= 30;
  }
  if (powerupSmall > 0) {
    drawBar(20, barY, 100, powerupSmall, 180, "#FF0000");
    barY -= 30;
  }
  if (powerupShield > 0) {
    drawBar(20, barY, 100, powerupShield, 240, "#00FF00");
  }
  //just incase, a noStroke so following visuals are unaffected
  noStroke();
}

function drawBar(x, y, lengthX, current, max, barColour) {
  //Draw full bar backdrop
  stroke(255);
  strokeWeight(20);
  line(x, y, x + lengthX, y);
  //Draw representative bar in foreground (never bigger than backdrop)
  stroke(barColour);
  strokeWeight(10);
  line(x, y, x + min(max, lengthX*((1.0 * current)/max)), y);
}

function manageCheatcodes() {
  //Go through each code and enable relevant effects
  for (let i = 0; i < codes.length; i++ ) {
    if (cheatCodeCounters[i] == codes[i].length) {
      //Toggle effect and reset counter
      cheatCodeEffects[i] = !cheatCodeEffects[i];
      cheatCodeCounters[i] = 0;
    }
  }
  //some cheat codes are more complex (i.e. aren't controlled by just a boolean):
  manageSpecificCheatCodes();
}

function manageSpecificCheatCodes() {
  //Manage help cheatcode
  if (cheatCodeEffects[0]) for (let i = 0; i < pedestrians.length; i++) pedestrians[i][1] = -Math.floor(random(height, height * 2));
  //Manage storm cheatcode
  if (cheatCodeEffects[1]) {
    if (difficulty == 99) difficulty = initialDifficulty;
    else difficulty = 99;
    populatePedestrians();
  }
  //Manage done cheatcode
  if (cheatCodeEffects[5] && scrollRate != 0) score = 999999999;
  //Manage bubble cheatcode (doesn't fit well into the loop cheatcode structure)
  if (cheatCodeEffects[6]) {
    bubble = !bubble;
    cheatCodeEffects[7] = (bubble) ? true : false;
    grassWidth = (bubble) ? 20 : 5;
    populateGrass();
  }
  //Manage small cheatcode
  if (cheatCodeEffects[8]) {
    luck = 1;
    powerupSmall = 1;
  }
  //Manage chess cheatcode
  if (cheatCodeEffects[10]) {
    pavementColour[0] = "#FFFFFF";
    cheatCodeEffects[7] = true;
  }
  //Disable one-pulse cheat codes: bubble (sort of), done, storm, help
  cheatCodeEffects[6] = cheatCodeEffects[5] = cheatCodeEffects[1] = cheatCodeEffects[0] = false;
}

function manageOverlays() {
  //Draw all the different overlays, with careful conditionals to stop multiple overlays ever being drawn together
  textAlign(CENTER);
  if (!gameStarted) drawGameStartScreen();
  if (gameOver) drawGameOverScreen();
  if (gamePaused && !(gameWon && !gameContinued) && !gameOver) drawPauseScreen();
  if (gameWon && !gameContinued) drawWinScreen();
  if (gameInfo) drawInfoScreen();
  // if (frameCount < frameRateSelected * 2) drawLoadingScreen(); //draw cute faux loading bar for the first 2 seconds of runtime
}

function drawGameStartScreen() {
  //Make sure pavement is displaying right at menu
  cheatCodeEffects[9] = false;
  //Display main title (with small font s for style's sake)
  let topTextY = 145;
  textSize(50);
  text("WALLY", width/2, topTextY);
  textAlign(LEFT);
  let textWallyWidth = textWidth("WALLY");
  textSize(35);
  text("'s", width/2+textWallyWidth/2-5, topTextY);
  textAlign(CENTER);
  textSize(50);
  text("WALKER", width/2, topTextY + 45);
  textSize(22);
  //Display instructions
  text("Press 'b' to begin", width/2, topTextY + 90);
  text("Difficulty: " + difficulty, width/2, topTextY + 170);
  textSize(17);
  text("(Adjust with arrow keys)", width/2, topTextY + 190);
  let longestLine = textWidth("'i' for more info");
  let leftAlignment = width/2 - longestLine/2;
  textAlign(LEFT);
  let body = [
    "'a' move left",
    "'d' move right",
    "'w' move up",
    "'s' move down",
    "SHIFT to dash",
    "'p' to pause",
    "'i' for more info"
  ];
  for (let i = 0; i < body.length; i++) text(body[i], leftAlignment, topTextY + 220 + i * 20);
  //^the body array is printed by this loop
}

function drawGameOverScreen() {
  //set initial locaiton of gameOver text (it moves later)
  let gameOverX = width/2;
  let gameOverY = height*2/5;
  framesSinceGameOver++; //counter controls how far it moves
  //Calculate highScore
  highScore = max(score, highScore);
  //Display end screen
  fill(255, 0, 0, 60);
  rect(0, 0, width, height);
  //Display game over animation (at certain framesSinceGameOver milestones, another set of gameOver text appears, moving diagonally down/right. 
  if (framesSinceGameOver > 60) fill("#FF0000");
  else fill(titleColour);
  textSize(45);
  for (let i = 0; i < gameOverQuantity; i++) text("GAME OVER", gameOverX + i, gameOverY + i);
  if (framesSinceGameOver > 70) {
    for (let i = 0; i < gameOverQuantity - 70; i++) text("GAME OVER", gameOverX - 100 + i, gameOverY - 220 + i);
  }
  if (framesSinceGameOver > 80) {
    for (let i = 0; i < gameOverQuantity - 80; i++) text("GAME OVER", gameOverX - 300 + i, gameOverY - 100 + i);
  }
  if (framesSinceGameOver > 60 && gameOverQuantity < 500) {
    gameOverQuantity *= 1.2;
    fill("#FF0000");
  }
  //Display instructions
  fill(titleColour);
  textSize(22);
  textAlign(CENTER);
  text("Press 'r' to restart", width/2, 260);
  text("Press 'm' for menu", width/2, 280);
  textAlign(CENTER);
  text("High Score: " + highScore, width/2, 400);
}

function drawPauseScreen() {
  //Display pause screen
  fill(titleColour);
  textSize(45);
  text("PAUSED", width/2, 240);
  textSize(22);
  text("Press 'p' to resume", width/2, 260);
}

function drawWinScreen() {
  //Display win screen
  fill(titleColour);
  textSize(45);
  text("YOU WIN!", width/2, 240);
  textSize(22);
  text("Press 'c' to keep going", width/2, 260);
}

function drawInfoScreen() {
  //Manage pause
  if (gameStarted && !gameOver) gamePaused = true;
  //Draw new background
  fill("#000000");
  rect(0, 0, width, height);
  //Draw subheadings & body
  let lMargin = 20;
  let bodyTextSize = 20;
  let headerTextSize = 30;
  let textRestartY = textStartY;
  fill("#FFFFFF");
  textAlign(LEFT);
  let body = [
    ["MOVEMENT", "H"],
    ["Move spaceship with WASD", "B"],
    ["Dash in direction of movement with SHIFT", "B"],
    ["  *You can dash through obstacles", "B"],
    ["  *If stationary, dashes forward", "B"],
    ["TELEPORT", "H"],
    ["Move target with arrow keys", "B"],
    ["Teleport to target with '/'", "B"],
    ["POWERUPS", "H"],
    ["Pick up yellow stars for points", "B"],
    ["Pick up green stars for a shield", "B"],
    ["Pick up blue stars for super-speed", "B"],
    ["Pick up red stars for small hitbox", "B"],
    ["  *or a bigger one, depending on luck", "B"],
    ["SHOOTING", "H"],
    ["Press SPACE to shoot", "B"],
    ["Hold 'H' to charge bullet (increase size)", "B"],
    ["Score a point & instant reload on hit", "B"],
    ["Miss and you'll have to wait for reload", "B"],
    ["CHEAT-CODES", "H"],
    ["Type 'c' for invincibility/cheat-codes", "B"],
    [(cheats) ? "  shhh, they're secret" : "  enable cheats to see them", "B"],
    [(cheats) ? "H-E-L-P: Clear all pedestrians from screen" : "", "B"],
    [(cheats) ? "L-A-S-E-R: Activate laser beam" : "", "B"],
    [(cheats) ? "S-T-O-R-M: Set pedestrian quantity to 99" : "", "B"],
    [(cheats) ? "S-T-R-O-B-E: Make colours strobe" : "", "B"],
    [(cheats) ? "A-R-R-O-W: Piercing bullets" : "", "B"],
    [(cheats) ? "B-U-B-B-L-E: Round the edges a bit" : "", "B"],
    [(cheats) ? "D-O-N-E: Instant win" : "", "B"],
    [(cheats) ? "C-H-E-C-K-E-R-S: Checker board pavement" : "", "B"],
    [(cheats) ? "C-H-E-S-S: Chess board pavement" : "", "B"],
    [(cheats) ? "H-O-L-E-S: Holes in the pavement" : "", "B"],
    [(cheats) ? "S-M-A-L-L: Mini rocket" : "", "B"],
    [(cheats) ? "A-U-T-O: Autopilot - inot perfect..." : "", "B"],
    [(cheats) ? "   ...but better than you" : "", "B"]
  ];
  //Display each line of the body string array, 
  for (let i = 0; i < body.length; i++) {
    //if the line is a heading, use bigger font and add an extra space
    if ( body[i][1] == "H") {
      textSize(headerTextSize);
      textRestartY += bodyTextSize;
    } else {
      textSize(bodyTextSize);
    }
    text(body[i][0], lMargin, textRestartY);
    textRestartY += bodyTextSize;
  }
  //Draw top margin cut-off thing
  fill("#000000");
  rect(0, 0, width, height/5);
  //Draw bottom margin cut-off thing
  fill("#000000");
  rect(0, height-bodyTextSize*1.5, width, bodyTextSize*1.5);
  fill("#FFFFFF");
  rect(50, height-bodyTextSize*1.5, width-100, 2);
  //Draw title
  fill("#FFFFFF");
  rect(width/2-98, height/6-64, 190, 80);
  textAlign(CENTER);
  textSize(70);
  fill("#000000");
  text("HELP", width/2, height/6);
  //Draw paging instructions
  textSize(bodyTextSize);
  fill("#FFFFFF");
  text("Scroll with mouse wheel", width/2, height - bodyTextSize/2);
}

function drawLoadingScreen() {
  //Draw black rectangle over whole screen and loading bar at center, for 2 seconds
  fill(0);
  rect(0, 0, width, height);
  drawBar(150, height / 2, 100, frameCount, frameRateSelected * 2, 0);
}

function drawScore() {
  if (!gameInfo) {
    //Draw score in bottom right corner
    let scorePhrase = "SCORE: " + score;
    textAlign(RIGHT);
    textSize(20);
    fill(0);
    rect(width-textWidth(scorePhrase)-10, height-30, width, height, 10);
    fill(255);
    text(scorePhrase, width-5, height-5);
  }
}

function manageColourScheme() {
  //use actual score, or if in strobe mode, use random number less than 20
  let colourScore = (cheatCodeEffects[3] && scrollRate != 0) ? Math.floor(random(20)) : score;
  //Set colour scheme at less than 5 points
  if (colourScore < 5) revertColourScheme();
  //Change colour scheme at 5 points
  if (colourScore >= 5) {
    titleColour = 255;
    grassColour[0] = "#9804C6";
    grassColour[1] = "#7E12A0";
    grassColour[2] = "#ED871A";
    treeColour[0] = "#086709";
    treeColour[1] = "#24B9ED";
    pavementColour[0] = "#000000";
    pavementColour[1] = "#FFFFFF";
  }
  //Change colour scheme at 10 points
  if (colourScore >= 10) {
    titleColour = 0;
    grassColour[0] =
      grassColour[1] =
      grassColour[2] = "#FFFFFF";
    treeColour[0] = "#086709";
    treeColour[1] = "#24B9ED";
    pavementColour[0] = "#FFFFFF";
    pavementColour[1] = "#ED871A";
  }
  //Change colour scheme at 15 points
  if (colourScore >= 15) {
    titleColour = 255;
    grassColour[0] =
      grassColour[1] =
      grassColour[2] = "#00FF00";
    treeColour[0] =
      treeColour[1] = "#FF0000";
    pavementColour[0] =
      pavementColour[1] = "#0000FF";
    pedestrianColour[0] =
      pedestrianColour[1] =
      pedestrianColour[2] = "#000000";
    pedestrianFlameColour[0] =
      pedestrianFlameColour[1] = "#FFFF00";
  }
  //Change colour scheme at 20 points
  if (colourScore >= 20) {
    revertColourScheme();
    grassColour[0] = 120;
    grassColour[1] = 130;
    grassColour[2] = 140;
    treeColour[0] = 170;
    treeColour[1] = 160;
    pavementColour[0] = 220;
    pavementColour[1] = 210;
    pedestrianColour[0] = 0;
    pedestrianColour[1] = 70;
    pedestrianColour[2] = 100;
    pedestrianFlameColour[0] =
      pedestrianFlameColour[1] = "#FFFFFF";
  }
  //Change colour scheme at 25 points
  if (score >= 25) revertColourScheme();
  //Pavement always white in chess mode
  if (cheatCodeEffects[10]) {
    pavementColour[0] = "#FFFFFF";
    pavementColour[1] = "#FFFFFF";
  }
}

function revertColourScheme() {
  //Revert colours
  titleColour = 0;
  grassColour[0] = "#3FA037";
  grassColour[1] = "#1D8115";
  grassColour[2] = "#2ECB21";
  treeColour[0] = "#9B5909";
  treeColour[1] = "#086709";
  pavementColour[0] = "#BBBFB1";
  pavementColour[1] = "#8C8C8C";
  pedestrianColour[0] = "#818181";
  pedestrianColour[1] = "#AAAAAA";
  pedestrianColour[2] = "#797979";
  pedestrianFlameColour[0] = "#FFCD17";
  pedestrianFlameColour[1] = "#F2822C";
}

//Collision determining function
function determineCollision(
  object1X, object1Y, object1Width, object1Height,
  object2X, object2Y, object2Width, object2Height
  ) {
  //Check each of 4 borders of object 2
  let belowObject2Top = object1Y + object1Height/2 > object2Y - 15 - object2Height/2;
  let aboveObject2Bottom = object1Y - object1Height/2 < object2Y - 15 + object2Height/2;
  let rightOfObject2Left = object1X - object1Width/2 < object2X + object2Width/2;
  let leftOfObject2Right = object1X + object1Width/2  > object2X - object2Width/2;
  //Make overall decision
  let collision =
    belowObject2Top && aboveObject2Bottom && rightOfObject2Left && leftOfObject2Right;
  return collision;
}

//Keeps value within lower and upper bounds, i.e. returns the bound if bound exceeded by value
function within(value, lower, upper) {
  return max(min(value, upper), lower);
}

//Reference: Star Function by processing.org from https://processing.org/examples/star.html, accessed 2022-08-10 (Open-source project)
//Used to give extra detail to shape of powerups, pedestrians, portals and tree bulbs
function star(x, y, radius1, radius2, npoints) {
  //Just use a circle if bubble mode
  if (bubble) {
    circle(x, y, radius1*2);
  } else {
    //Otherwise draw the normal star function, as per processing.org
    noStroke();
    let angle = TWO_PI / npoints;
    let halfAngle = angle/2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a+halfAngle) * radius1;
      sy = y + sin(a+halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
}

function keyPressed() {
  managePlayerKeyPresses(key, keyCode);
  manageGameStateKeyPresses(key);
  //Manage various others
  if (key == 'j') jitter = (jitter == 50) ? 0 : 50; //slightly shift the tree rows randomly
  if (key == '=') score += 5; //dev option: change score
  if (key == '-') score -= 5; //^ditto
  if (key == '0') score = 0; //^ditto
}

function managePlayerKeyPresses(key, keyCode) {
  //Set movement direction
  if (key == 'a' || key == 'A') player[2] = -scrollRate;
  if (key == 'd' || key == 'D') player[2] = scrollRate;
  if (key == 'w' || key == 'W') player[3] = -scrollRate;
  if (key == 's' || key == 'S') player[3] = scrollRate;
  //Using the arrow keys in-game moves the teleport target
  if (keyCode == LEFT_ARROW)  player[10] = -scrollRate;
  if (keyCode == RIGHT_ARROW) player[10] = scrollRate;
  if (keyCode == UP_ARROW)    player[11] = -scrollRate;
  if (keyCode == DOWN_ARROW)  player[11] = scrollRate;
  //Teleport
  if (player[10] != 0 || player[11] != 0) targeting = true;
  if (key == '/') teleportNow = true;
  //Charge bullet
  if (key == 'h') charging = true;
  //Fire bullet
  if (key == ' ') shootBullet();
  //Toggle Cheats
  if (key == 'c' && (!gameOver || gameInfo))            cheats = !cheats;
  if (key == 'c' && (!gameOver || gameInfo) && !cheats) powerupShield = 180;
  if (key == 'c' && (!gameOver || gameInfo) && gameWon && !gameContinued) cheatCodeEffects[9] = true;
  if (key == 'c' && (!gameOver || gameInfo) && gameWon) gameContinued = true;
  //Manage cheatcodes
  for (let i = 0; i < codes.length; i++) {
    if (key == codes[i][cheatCodeCounters[i]]) cheatCodeCounters[i]++;
    else cheatCodeCounters[i] = 0;
  }
}

function manageGameStateKeyPresses(key) {
  //Open/close info screen
  if (key == 'i') gameInfo = !gameInfo;
  //Begin game
  if (key == 'b' && !gameStarted && !gameInfo && (true || frameCount > frameRateSelected * 2)) gameStartUp = true;
  //Pause game
  if (key == 'p' && !gameOver && gameStarted && cheatCodeCounters[0] != 3) gamePaused = !gamePaused;
  if (key == 'p' && !gameOver && gameStarted && cheatCodeCounters[0] != 3 && !gamePaused) scrollRate = speed;
  //Restart game
  if (key == 'r' && gameOver) gameStartUp = true;
  //Return to menu
  if (key == 'm' && gameOver) returnToMenu();
  //Scroll info screen with UP and DOWN keys
  if (keyCode == DOWN_ARROW && gameInfo) textStartY++;
  if (keyCode == UP_ARROW && gameInfo) textStartY--;
  //Change difficulty (UP and RIGHT to the same thing, same with DOWN and LEFT)
  if ((keyCode == UP_ARROW ||   keyCode == RIGHT_ARROW) && !gameStarted && !gameInfo) difficulty = min(6, difficulty + 1);
  if ((keyCode == DOWN_ARROW || keyCode == LEFT_ARROW) && !gameStarted && !gameInfo)  difficulty = max(1, difficulty - 1);
}

function keyReleased() {
  //Stop player movement on key release
  if (((key == 'a' || key == 'A') && player[2] != scrollRate) || ((key == 'd' || key == 'D') && player[2] != -scrollRate)) player[2] = 0;
  if (((key == 'w' || key == 'W') && player[3] != scrollRate) || ((key == 's' || key == 'S') && player[3] != -scrollRate)) player[3] = 0;
  //Stop teleport target movement on key release
  if ((keyCode == LEFT_ARROW && player[10] != scrollRate) || (keyCode == RIGHT_ARROW && player[10] != -scrollRate)) player[10] = 0;
  if ((keyCode == UP_ARROW && player[11] != scrollRate) || (keyCode == DOWN_ARROW && player[11] != -scrollRate)) player[11] = 0;
  //Stop bullet charging
  if (key == 'h') charging = false;
  //Dash on shift release
  if (keyCode == SHIFT) dashPlayer();
}

function mouseWheel(scroll) {
  //Enable mouse scroll of info screen
  textStartY -= scroll.deltaY / 3;
  // console.log(scroll.deltaY);
  //Bounds checking
  textStartY = max(min(textStartY, 225), 0)
}