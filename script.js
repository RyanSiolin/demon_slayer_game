const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 1050;
canvas.height = 1400;
let lifePoints = 5;
let score = 0;
ctx.font = '70px Impact';
let timeToNextEnemy = 0;
let enemyInterval = 1000;
let lastTime = 0;
let heart = new Image();
heart.src = 'heart.png';

let enemies = [];
let explosions = [];

class Player {
    constructor(){
        this.image = new Image();
        this.image.src = 'tanjiro.png'
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        this.sizeModifier = 1.5;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.y = 1100;
        this.x = 425;
        this.speed = 7;
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
    restart(){
        this.y = 50;
        this.x = 250;
        this.frame = 0;
    }
    update(deltaTime, enemies){
        document.addEventListener("keydown", e => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener("keyup", e => this.keys[e.key.toLowerCase()] = false);
        if (this.keys["w"]) this.y -= this.speed;
        if (this.keys["s"]) this.y += this.speed;
        if (this.keys["a"]) this.x -= this.speed;
        if (this.keys["d"]) this.x += this.speed;
        if (this.keys[" "]) this.action = 1;
        else if (this.frame === 0)this.action = 0;
        if (this.action === 1) {
            enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < enemy.height/3.5 + this.width/2) enemy.isEnemyHit = true;
            });
        };
        this.timeSinceFrame += deltaTime;
        if (this.timeSinceFrame > this.frameInterval){
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame ++;
            this.timeSinceFrame = 0;
        }
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.height/2, 0, Math.PI*2);
        ctx.stroke();
        ctx.drawImage(this.image, this.frame * this.spriteWidth, this.action * this.spriteHeight, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height);
    }

}
let player = new Player();

class Background{
    constructor(){
        this.image = new Image();
        this.image.src = 'background.jpg';
        this.spriteWidth = 800;
        this.spriteHeight = 1067;
    }
    draw(){
        ctx.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, 0, 0, this.spriteWidth*1.3125, this.spriteHeight*1.3125);
    }
}

class Enemy {
    constructor(){
        this.image = new Image();
        this.type = Math.round(Math.random()*3);
        if (this.type === 0){
            this.image.src = 'oni_sprite.png';
        } else if (this.type === 1) {
            this.image.src = 'oni_sprite1.png';
        } else {
            this.image.src = 'oni_sprite2.png';
        }
        this.spriteWidth = 100;
        this.spriteHeight = 100;
        this.sizeModifier = Math.random() * 2 +  0.8;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0;
        this.directionX = Math.random() * 5 - 2.5;
        this.directionY = Math.random() * 4 - 7;
        this.isEnemyHit = false;
        this.markedForDeletion = false;
        this.frame = 0;
        this.maxFrame = 2;
        this.timeSinceFrame = 0;
        this.frameInterval = 100;
    }
    update(deltaTime){
        if (this.x < 0  || this.x > canvas.width - this.width){
            this.directionX *= -1;
        }
        this.x -= this.directionX;
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
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/3.5, 0, Math.PI*2);
        ctx.stroke();
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height);
    }
}
class Explosion {
    constructor(enemy) {
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.x = enemy.x;
        this.y = enemy.y;
        this.sizeModifier = enemy.sizeModifier;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.frame = 0;
        this.maxFrame = 3;
        this.timeSinceFrame = 0;
        this.frameInterval = 100;
        this.delete = false;
        this.sound = new Audio();
        this.sound.src = 'boom.wav';
        this.sound.volume = 0.5;
    }
    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceFrame += deltaTime;
        if (this.timeSinceFrame > this.frameInterval){
            if (this.frame > this.maxFrame) this.delete = true;
            else this.frame ++;
            this.timeSinceFrame = 0;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, 
            this.x, this.y, this.width, this.height);

    }
}
function drawLifePoints(){
    ctx.drawImage(heart, 0, 0, 800, 800, 0, 0, 125, 125);
    ctx.fillStyle = 'black';
    ctx.fillText(lifePoints, 40, 90);
    ctx.fillStyle = 'white';
    ctx.fillText(lifePoints, 45, 95);
}
function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 700, 60);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 705, 65);
    if (lifePoints === 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText('FIM DE JOGO!', 525, 725);
    }
}
let background = new Background();
function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (lifePoints != 0) requestAnimationFrame(animate);
    background.draw();
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextEnemy += deltaTime;
    if (timeToNextEnemy > enemyInterval){
        enemies.push(new Enemy());
        timeToNextEnemy = 0;
    };
    drawLifePoints();
    drawScore();
    [...enemies].forEach(object => object.update(deltaTime));
    [...enemies].forEach(object => object.draw());
    [...enemies].forEach(object => {
        if (object.isEnemyHit) {
            explosions.push(new Explosion(object));
        }
    });
    let qtdA = enemies.length;
    enemies = enemies.filter(object => !object.isEnemyHit);
    [...explosions].forEach(object => object.update(deltaTime));
    [...explosions].forEach(object => object.draw());
    explosions = explosions.filter(object => !object.delete);
    score += Math.abs(qtdA - enemies.length);
    qtdA = enemies.length;
    enemies = enemies.filter(object => !object.markedForDeletion);
    lifePoints -= Math.abs(qtdA - enemies.length);
    player.update(deltaTime, enemies);
    player.draw();
}

animate(0);