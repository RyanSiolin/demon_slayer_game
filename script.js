const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let score = 100;
ctx.font = '70px Impact';
let timeToNextEnemy = 0;
let enemyInterval = 1000;
let lastTime = 0;

let enemies = [];

class Player {
    constructor(){
        this.image = new Image();
        this.image.src = 'tanjiro.png'
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        this.sizeModifier = 3;
        this.width = this.spriteWidth * this.sizeModifier*1.5;
        this.height = this.spriteHeight * this.sizeModifier;
        this.y = 50;
        this.x = 250;
        this.speed = 10;
        this.frame = 0;
        this.action = 0;
        this.maxFrame = 2;
        this.timeSinceFrame = 0;
        this.frameInterval = 100;
        this.keys = {
            'w': false,
            'a': false,
            's': false,
            'd': false
        };
    }
    update(deltaTime){
        document.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);
        if (this.keys["w"]) this.y -= this.speed;
        if (this.keys["s"]) this.y += this.speed;
        if (this.keys["a"]) this.x -= this.speed*2;
        if (this.keys["d"]) this.x += this.speed*2;
        if (this.keys[" "]) this.action = 1;
        else this.action = 0;

        this.timeSinceFrame += deltaTime;
        if (this.timeSinceFrame > this.frameInterval){
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame ++;
            this.timeSinceFrame = 0;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, this.action * this.spriteHeight, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height);
    }

}
let player = new Player();

class Enemy {
    constructor(){
        this.image = new Image();
        this.image.src = 'enemy1.png';
        this.spriteWidth = 293;
        this.spriteHeight = 155;
        this.sizeModifier = Math.random() * 0.4 + 0.6;
        this.width = this.spriteWidth*this.sizeModifier*1.5;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0;
        this.directionX = Math.random() * 5 - 2.5;
        this.directionY = Math.random() * 4 - 7;
        this.markedForDeletion = false;
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFrame = 0;
        this.frameInterval = 100;
    }
    update(deltaTime, score){
        if (this.x < 0  || this.x > canvas.width - this.width){
            this.directionX *= -1;
        }
        this.x -=this.directionX;
        this.y -= this.directionY;  
        if (this.y > canvas.height + this.height) {
            this.markedForDeletion = true;
        }
        this.timeSinceFrame += deltaTime;
        if (this.timeSinceFrame > this.frameInterval){
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame ++;
            this.timeSinceFrame = 0;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height);
    }
}

function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 20, 60);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 25, 65);
}

window.addEventListener('click', function(e){
    const detectPixelColor = ctx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
});

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    console.log(enemies.length);
    lastTime = timestamp;
    timeToNextEnemy += deltaTime;
    if (timeToNextEnemy > enemyInterval){
        enemies.push(new Enemy());
        timeToNextEnemy = 0;
    };
    drawScore();
    let qtdA = enemies.length;
    [...enemies].forEach(object => object.update(deltaTime));
    [...enemies].forEach(object => object.draw());
    enemies = enemies.filter(object => !object.markedForDeletion);
    score -= Math.abs(qtdA - enemies.length);
    player.update(deltaTime);
    player.draw();
    requestAnimationFrame(animate);
}

animate(0);