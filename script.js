const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let score = 0;
ctx.font = '70px Impact';
let timeToNextEnemy = 0;
let enemyInterval = 500;
let lastTime = 0;

let enemies = [];
class Enemy {
    constructor(){
        this.image = new Image();
        this.image.src = 'enemy1.png';
        this.spriteWidth = 293;
        this.spriteHeight = 155;
        this.sizeModifier = Math.random() * 0.4 + 0.6;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier*1.5;
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
    update(deltaTime){
        if (this.x < 0  || this.x > canvas.width - this.width){
            this.directionX *= -1;
        }
        this.x -=this.directionX;
        this.y -= this.directionY;  
        if (this.y > this.height + this.y) this.markedForDeletion = true; 

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
    lastTime = timestamp;
    timeToNextEnemy += deltaTime;

    if (timeToNextEnemy > enemyInterval){
        enemies.push(new Enemy());
        timeToNextEnemy = 0;
    };
    drawScore();
    [...enemies].forEach(object => object.update(deltaTime));
    [...enemies].forEach(object => object.draw());
    enemies = enemies.filter(object => !object.markedForDeletion);
    console.log(enemies);
    requestAnimationFrame(animate);
}

animate(0);