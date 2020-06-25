let width, height;
let numSlotsHor = 26, numSlotsVer;
let snakeStartingX, snakeStartingY;
var gGame;


function getGridWidth() {
    return width / numSlotsHor;
}

function getGridHeight() {
    return height / numSlotsVer;
}

class BodyPart {
    constructor(x, y, direction, modifier) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.modifier = modifier;
    }
}

class Snake {
    constructor() {
        this.bodyParts = [
            new BodyPart(snakeStartingX, snakeStartingY, 'vertical', -1),
            new BodyPart(snakeStartingX, snakeStartingY + 1, 'vertical', -1),
            new BodyPart(snakeStartingX, snakeStartingY + 2, 'vertical', -1),
        ];
        this.r = (Math.random() * 1000) % 256;
        this.g = (Math.random() * 1000) % 256;
        this.b = (Math.random() * 1000) % 256; 
    }

    move() {
        for(let i = 0; i < this.bodyParts.length; ++i) {
            let part = this.bodyParts[i];
            if (part.direction=='horizontal') {
                part.x += part.modifier;
            } else {
                part.y += part.modifier;                
            }
        }

        for(let i = 0; i < this.bodyParts.length; ++i) {
            if(i >= this.bodyParts.length - 1) {
                break;
            }

            let current = this.bodyParts[i];
            let next = this.bodyParts[i + 1];

            if(current.direction != next.direction) {
                next.direction = current.direction;
                next.modifier = current.modifier;
                break;
            }
        }
    
    }

    draw(ctx) {
        ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;

        let part = this.bodyParts[0];

        ctx.fillRect(getGridWidth() * part.x, getGridHeight() * part.y, getGridWidth(), getGridHeight());

        const middle = Math.round(getGridHeight() / 2);
        const ytenth = Math.round(getGridHeight() / 5);
        const xtenth = getGridWidth() / 5;

        let eyeR = this.r / 2, eyeG = this.g / 2, eyeB = this.b / 2;

        ctx.fillStyle = `rgb(${eyeR}, ${eyeG}, ${eyeB})`;

        ctx.fillRect(getGridWidth() * part.x + xtenth, getGridHeight() * part.y + middle - ytenth * 2, xtenth, ytenth);
        ctx.fillRect(getGridWidth() * part.x + xtenth, getGridHeight() * part.y + middle + ytenth, xtenth, ytenth);

        ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;

        for(let i = 1; i < this.bodyParts.length; ++i) {
            let part = this.bodyParts[i];

            ctx.fillRect(Math.floor(getGridWidth() * part.x), getGridHeight() * part.y, getGridWidth(), getGridHeight());
        }
    }
}

class Fruit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.fillStyle = 'rgb(255, 0, 50)';

        ctx.fillRect(this.x * getGridWidth(), this.y * getGridHeight(), getGridWidth(), getGridHeight());
    }
}

class Game {
    constructor() {
        this.snake = new Snake();
        this.fruit = this.createFruit();
        let count=0;
        this.eventQueue = [];
    }
    createFruit() {
        let x = Math.round((Math.random() * 1000)) % numSlotsHor;
        let y = Math.round((Math.random() * 1000)) % numSlotsVer;
        return new Fruit(x, y);
    }

    readKey(e) {
        let head = this.snake.bodyParts[0];

        let code = e.keyCode;
        switch (code){
            case 37:
                if(head.direction !== 'horizontal') { //left
                    //head.direction = 'horizontal';
                    //head.modifier = -1;
                    this.eventQueue.push("left");
                }
                break; 
            case 38:
                if(head.direction !== 'vertical') { //down
                    //head.direction = 'vertical';
                    //head.modifier = -1;
                    this.eventQueue.push("down");
                }
                break; 
            case 39:
                if(head.direction !== 'horizontal') { //right
                    //head.direction = 'horizontal';
                    //head.modifier = +1;
                    this.eventQueue.push("right");
                }
                break; 
            case 40:
                if(head.direction !== 'vertical') {  //up
                    //head.direction = 'vertical';
                    //head.modifier = +1;
                    this.eventQueue.push("up");
                }
                break; 
            default: break;
        }
    }
    eat(){
        let head = this.snake.bodyParts[0];

        //let fruit = Fruit.x
        console.log(this.fruit.x);
        console.log(this.fruit.y);
        if (head.x==this.fruit.x && head.y==this.fruit.y){
            this.fruit= this.createFruit();
            let last = this.snake.bodyParts[this.snake.bodyParts.length - 1];
            let x = last.direction == 'vertical' ? last.x : last.x - last.modifier;
            let y = last.direction == 'horizontal' ? last.y : last.y - last.modifier;
            let newLast = new BodyPart(x, y, last.direction, last.modifier);
            this.snake.bodyParts.push(newLast);
            this.count+=1;
        }
    }
    fixedUpdate(){
        this.eat();
        this.snake.move();
        this.processMovement();
    }
    processMovement(){
        let head = this.snake.bodyParts[0];
            switch(this.eventQueue[0]){
                case "left":
                    head.direction = 'horizontal';
                    head.modifier = -1;
                    break;
                case "right":
                    head.direction = 'horizontal';
                    head.modifier = +1;
                    break;
                case "up":
                    head.direction = 'vertical';
                    this.head.modifier = +1;
                    break;
                case "down":
                    head.direction = 'vertical';
                    head.modifier = -1;
                    break;
            }
            this.eventQueue = [];
    }
}


function gameUpdate(ctx, game) {
    ctx.fillStyle = 'rgb(41, 41, 41)';
    ctx.fillRect(0, 0, width, height);

    game.fruit.draw(ctx);
    game.snake.draw(ctx);
}

function gameStart() {
    let canvas = document.getElementById("canvas");

    width = canvas.width = window.innerWidth / 1.5;
    height = canvas.height = window.innerHeight / 1.5;
    numSlotsVer = Math.round(numSlotsHor * (height / width));
    snakeStartingX = Math.round(numSlotsHor / 2);
    snakeStartingY = Math.round(numSlotsVer / 2);

    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');

        let game = gGame = new Game();
        window.addEventListener('keydown', game.readKey.bind(game), false);

        setInterval(game.fixedUpdate.bind(game), 500);
        setInterval(gameUpdate, 1000.0 / 30, ctx, game);
    }
}
