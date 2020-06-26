let width, height;
let numSlotsHor = 26, numSlotsVer;
let snakeStartingX, snakeStartingY;
var gGame;
let updateInterval;

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
        this.moved = true;
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
        if ((head.x == numSlotsHor || head.x < 0) || head.y == numSlotsVer || head.y < 0) {
            die();
        }
        for (let i = 1; i < this.bodyParts.length; ++i) {
            let part = this.bodyParts[i];
            let prev = this.bodyParts[i - 1];
            if (head.x == part.x && head.y == part.y) {
                die();
            }

            part.x = prev.prevX;
            part.y = prev.prevY;
        }

        this.moved = true;
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
        this.count = 0;
        this.elapsed = 0;
        this.targetTime = 500;
        this.minTarget = 75;
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
                if (head.direction != 'horizontal' && this.snake.moved) {
                    head.direction = 'horizontal';
                    head.modifier = -1;
                    this.snake.moved = false;
                }
                break;
            case 38:
                if (head.direction != 'vertical' && this.snake.moved) {
                    head.direction = 'vertical';
                    head.modifier = -1;
                    this.snake.moved = false;
                }
                break;
            case 39:
                if (head.direction != 'horizontal' && this.snake.moved) {
                    head.direction = 'horizontal';
                    head.modifier = 1;
                    this.snake.moved = false;
                }
                break;
            case 40:
                if (head.direction != 'vertical' && this.snake.moved) {
                    head.direction = 'vertical';
                    head.modifier = 1;
                    this.snake.moved = false;
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
            let newLast = new BodyPart(last.prevX, last.prevY, last.direction, last.modifier);
            this.snake.bodyParts.push(newLast);
            
            document.querySelector('h1#fruit').innerText = `Comeu ${this.count += 1} frutinha${this.count > 1 ? 's' : ''}`;

            if(this.targetTime > this.minTarget && (this.count % 2) == 0) {
                this.targetTime -= 25;
            }
        }
    }
}

function gameUpdate(ctx, game, deltaTime) {
    ctx.fillStyle = 'rgb(41, 41, 41)';
    ctx.fillRect(0, 0, width, height);

    for(let row = 0; row < numSlotsVer; ++row) {
        for(let col = 0; col < numSlotsHor; ++col) {
            ctx.drawImage(document.getElementById('bg'), getGridWidth() * col, getGridHeight() * row, getGridWidth(), getGridHeight());
        }
    }

    game.elapsed += deltaTime;

    if(game.elapsed >= game.targetTime) {
        game.elapsed = 0;

        if(game.state == 'running') {
            game.snake.move();
            game.eat();
        }
    }

    game.fruit.draw(ctx);
    game.snake.draw(ctx);

    if (gGame.state != 'running') {
        ctx.fillStyle = 'rgba(99, 99, 99, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.font = '32px "Comic Sans"';
        let text;
        if(gGame.state == 'paused') {
            text = "Paused";
        } else if(gGame.state == 'dead') {
            text = "You (not Watanabe) are dead";
        }
        ctx.fillText(text, width / 2, height / 2);
    }
}

function die() {
    let button = document.getElementById('startresume');

    gGame.state = 'dead';
    button.innerText = 'Start';
    button.style = "display: none;";
}

function onStartResume() {
    let button = document.getElementById('startresume');

    if (gGame !== undefined) {
        if (gGame.state == 'running') {
            gGame.state = 'paused';
            button.innerText = 'Resume';
        } else {
            gGame.state = 'running';
            button.innerText = 'Pause';
        }
    }
}

function onRestart() {
    let button = document.getElementById('startresume');
    button.innerText = "Start";
    button.style = "";

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

        if (updateInterval) {
            clearInterval(updateInterval);
        }

        updateInterval = setInterval(gameUpdate, 1000.0 / 60, ctx, game, 1000.0 / 60);
    }
}
