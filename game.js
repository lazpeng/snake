let width, height;
let numSlotsHor = 26, numSlotsVer;
let snakeStartingX, snakeStartingY;
var gGame;
let updateInterval, fixedInterval;

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
        this.prevX = x;
        this.prevY = y;
        this.direction = direction;
        this.modifier = modifier;
    }
}

class Snake {
    constructor() {
        let head = new BodyPart(snakeStartingX, snakeStartingY, 'vertical', -1);
        let middle = new BodyPart(snakeStartingX, snakeStartingY + 1, 'vertical', -1);
        let tail = new BodyPart(snakeStartingX, snakeStartingY + 2, 'vertical', -1);
        this.bodyParts = [
            head,
            middle,
            tail,
        ];
        this.r = (Math.random() * 1000) % 256;
        this.g = (Math.random() * 1000) % 256;
        this.b = (Math.random() * 1000) % 256;
    }

    move() {
        this.bodyParts.forEach(p => {
            p.prevX = p.x;
            p.prevY = p.y;
        });

        let head = this.bodyParts[0];
        if (head.direction == 'horizontal') {
            head.x += head.modifier;
        } else {
            head.y += head.modifier;
        }

        for (let i = 1; i < this.bodyParts.length; ++i) {
            let part = this.bodyParts[i];
            let prev = this.bodyParts[i - 1];

            part.x = prev.prevX;
            part.y = prev.prevY;
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

        for (let i = 1; i < this.bodyParts.length; ++i) {
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
        this.state = 'paused';
    }

    createFruit() {
        let x = Math.round((Math.random() * 1000)) % numSlotsHor;
        let y = Math.round((Math.random() * 1000)) % numSlotsVer;
        return new Fruit(x, y);
    }

    readKey(e) {
        let head = this.snake.bodyParts[0];

        switch (e.keyCode) {
            case 37:
                if(head.direction != 'horizontal') {
                    head.direction = 'horizontal';
                    head.modifier = -1;
                }
                break;
            case 38:
                if(head.direction != 'vertical') {
                    head.direction = 'vertical';
                    head.modifier = -1;
                }
                break;
            case 39:
                if(head.direction != 'horizontal') {
                    head.direction = 'horizontal';
                    head.modifier = +1;
                }
                break;
            case 40:
                if(head.direction != 'vertical') {
                    head.direction = 'vertical';
                    head.modifier = 1;
                }
                break;
            default: break;
        }
    }

    eat() {
        let head = this.snake.bodyParts[0];

        if (head.x == this.fruit.x && head.y == this.fruit.y) {
            this.fruit = this.createFruit();
            let last = this.snake.bodyParts[this.snake.bodyParts.length - 1];
            let x = last.direction == 'vertical' ? last.x : last.x - last.modifier;
            let y = last.direction == 'horizontal' ? last.y : last.y - last.modifier;
            let newLast = new BodyPart(x, y, last.direction, last.modifier);
            this.snake.bodyParts.push(newLast);
        }
    }

    fixedUpdate() {
        if(this.state != 'running') {
            return;
        }

        this.snake.move();
        this.eat();
    }
}

function gameUpdate(ctx, game) {
    ctx.fillStyle = 'rgb(41, 41, 41)';
    ctx.fillRect(0, 0, width, height);

    game.fruit.draw(ctx);
    game.snake.draw(ctx);

    if(gGame.state != 'running') {
        ctx.fillStyle = 'rgba(99, 99, 99, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.font = '32px "Comic Sans"';
        ctx.fillText('Paused', width / 2, height / 2);
    }
}

function onStartResume() {
    let button = document.getElementById('startresume');

    if(gGame !== undefined) {
        if(gGame.state == 'running') {
            gGame.state = 'paused';
            button.innerText = 'Start';
        } else {
            gGame.state = 'running';
            button.innerText = 'Pause';
        }
    }
}

function onRestart() {
    let button = document.getElementById('startresume');
    button.innerText = "Start";

    gameStart();
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

        if(fixedInterval) {
            clearInterval(fixedInterval);
        }

        if(updateInterval) {
            clearInterval(updateInterval);
        }

        fixedInterval = setInterval(game.fixedUpdate.bind(game), 300);
        updateInterval = setInterval(gameUpdate, 1000.0 / 30, ctx, game);
    }
}
