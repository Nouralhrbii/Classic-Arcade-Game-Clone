 
 // Grid constants
let GY = 83;
let GX = 101;
let Grid_Y_Top_Empty_Space = 50;
let Grid_Y_Bottom_Empty_Space = 20;
let Max_Player_Move_Up = 0 * GY + Grid_Y_Top_Empty_Space;
let Max_Player_Move_Down = 5 * GY - Grid_Y_Bottom_Empty_Space;
let Max_Player_Move_Left = 0;
let Max_Player_Move_Right = 4 * GX;
// Player start constant
let Player_Start_X = GX * 2;
let Player_Start_Y = GY * 5 - Grid_Y_Bottom_Empty_Space;
// Enemy Speed Min Max constants
let Min_Speed = 100;
let Max_Speed = 700;
// Enemy Spawn
let Enemy_Spawn = 4;
// Hitbox Adjustment
let Right_Adjust = 83;
let Left_Adjust = 18;
let Top_Adjust = 81;
let Bottom_Adjust = 132;
// Enemy Adjustment
let Enemy_Right_Adjust = 98;
let Enemy_Left_Adjust = 3;
let Enemy_Top_Adjust = 81;
let Enemy_Bottom_Adjust = 132;

let Blue_Gem = 'images/Gem Blue.png';
let Green_Gem = 'images/Gem Green.png';
let Orange_Gem = 'images/Gem Orange.png';
let Boy = 'images/char-boy.png';
let gemColor = [Blue_Gem, Green_Gem, Orange_Gem];

// Returns a random integer between min (included) and max (excluded)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Returns true if compared actors intersect
function intersect(actor1, actor2) {
        return !(actor1.right < actor2.left ||
                actor1.left > actor2.right ||
                actor1.top > actor2.bottom ||
                actor1.bottom < actor2.top);
}

// Actor is Super class

class Actor {

    constructor(x, y,img,rightAdj, leftAdj, topAdj, botAdj){
    this.x = x;
    this.y = y;
    this.rightAdj = rightAdj;
    this.leftAdj = leftAdj;
    this.topAdj = topAdj;
    this.botAdj = botAdj;
    this.sprite = img;
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
    }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

  updateHitbox() {
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
     }
}

// Enemy Class extends Actor

class Enemy extends Actor {

    constructor(x, y, rightAdj, leftAdj, topAdj, botAdj) {
    super( x, y, 'images/enemy-bug.png', rightAdj, leftAdj, topAdj, botAdj);
        // Determines a random speed for the enemy 
    this.speed = getRandomArbitrary(Min_Speed, Max_Speed);
  }

    update(dt) {
      // Resets the enemy sprite once it goes off screen to the right
     if(this.x > GX * 5) {
        this.x = GX * -1;
        this.y = GY * getRandomInt(1, 4) - Grid_Y_Bottom_Empty_Space;
        this.speed = getRandomArbitrary(Min_Speed, Max_Speed);
    }
  
    this.x = this.x + this.speed * dt;
    }

}

// Player Class extends Actor

class Player extends Actor {
    constructor(x, y, rightAdj, leftAdj, topAdj, botAdj){
    super( x, y, Boy,rightAdj, leftAdj, topAdj, botAdj);
    this.alive = true;
    this.score = 0;
    this.level = 0;
    this.lives = 3;
 
    }

   handleInput(keyCode) {
    if(keyCode == "up" && this.y > Max_Player_Move_Up) this.y = this.y - GY;
    else if(keyCode == "down" &&  this.y < Max_Player_Move_Down) this.y = this.y + GY;
    else if(keyCode == "left" && this.x > Max_Player_Move_Left) this.x = this.x - GX;
    else if(keyCode == "right" && this.x < Max_Player_Move_Right) this.x = this.x + GX;
    }

    update() {
     // Checks to see if player goes into water 
    if(this.y <= 0 * GY + Grid_Y_Top_Empty_Space) {
        this.x = Player_Start_X;
        this.y = Player_Start_Y;
        this.sprite = Boy;
        this.score = this.score + 1;
        this.level= this.level+1;
         // Checks to see if player win or not
       if(this.level===10){
        EndGame(this.score);
       }

    }
    
    // Checks to see if player died and reset position
    if(this.alive === false) {
        this.x = Player_Start_X;
        this.y = Player_Start_Y;
        this.sprite = Boy;
        this.alive = true;
        if(this.lives ===1){
            GameOver(this.score,this.level);
           
        } else {
            this.lives = this.lives - 1;
        }
    }
   
}

    renderStatus() {
    ctx.clearRect(0, 20 , 505 , 25);
    ctx.font = "20px serif";
    // Draw scores on the top left
    ctx.fillText("Score: " + this.score, 0, 40);
    // Draw lives on the top right
    ctx.fillText("Lives: " + this.lives, 404, 40);
    // Draw level on the top 
    ctx.fillText("Level : " + this.level, 202, 40);
    
}

    checkCollisions(allEnemies,gem) {
    
    let self = this;
    allEnemies.forEach(function(enemy) {
        if(intersect(enemy, self)){
           self.alive = false;
        }
    });
    
    if(intersect(gem, this)) {
        gem.taken = true;
        this.score = this.score + gem.value;
    }
    

    
    
}
}


// Gem Class extends Actor - Player gains points by grabbing gems


class Gem extends Actor{

   constructor (x, y, rightAdj, leftAdj, topAdj, botAdj){
   
    // Randomly will choose a gem with a value
    let value = getRandomInt(0, 3) + 1;
    super( x, y,gemColor[value - 1], rightAdj, leftAdj, topAdj, botAdj);
    this.taken = false;
    this.value=value;

   }

    update() {
    // Random type of gem will randomly spawn at a location
    // after player grabs it
    if(this.taken === true) {
        this.value = getRandomInt(0, 3) + 1;
        this.sprite = gemColor[this.value - 1];
        // Reset gem in a random location
        this.x = GX * getRandomInt(0, 5);
        this.y = GY * getRandomInt(1, 4) - Grid_Y_Bottom_Empty_Space;
        this.taken = false;
    }
}
}

// if win level==10
 function EndGame(score) {
    
   swal({
        closeOnEsc: false,
        allowOutsideClick: false,
        title: 'Congratulations! You Won!',
        text: 'With ' + score + ' Score ',
        icon: 'success',
        button: 'Play again!'
    }).then(function (isConfirm) {
        if (isConfirm) {
           // init();
        }
    })
init();
}
// if lives==0 then game over
 function GameOver (score,level){

    swal({
        closeOnEsc: true,
        allowOutsideClick: true,
        title: 'Game Over!',
        text: 'With ' + score + ' Score In Level ' +level,
        icon: 'error',
        button: 'Play again!'
    }).then(function (isConfirm) {
        if (isConfirm) {
           // init();
        }
    })
init();
 }


let player;
let allEnemies;
let gem;

 function init() {
// Instantiate Player Object
player = new Player(Player_Start_X, Player_Start_Y, Right_Adjust, Left_Adjust, Top_Adjust, Bottom_Adjust);


// Instantiate Enemy Object in an array
allEnemies = [];
for (let i = 0; i < Enemy_Spawn; i++)
    allEnemies.push(new Enemy(GX * -1, GY * getRandomInt(1, 4) - Grid_Y_Bottom_Empty_Space, Enemy_Right_Adjust, Enemy_Left_Adjust, Enemy_Top_Adjust, Enemy_Bottom_Adjust));
    
// Instantiate Gem Object
 gem = new Gem(GX * getRandomInt(0, 5), GY * getRandomInt(1, 4) - Grid_Y_Bottom_Empty_Space, Right_Adjust, Left_Adjust, Top_Adjust, Bottom_Adjust);
}

init();
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

