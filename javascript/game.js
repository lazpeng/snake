let width, height;
let numSlotsHor = 26, numSlotsVer;
let snakeStartingX, snakeStartingY;
var gGame;
let updateInterval;
let audio = new Audio('audio/zelda_ost.mp3');
let deathSfx = new Audio('audio/death.mp3');
var levels = [
    {
        "walls": [
            {
                "x": "10",
                "y": "5"
            },
            {
                "type": "pillar",
                "startX": "0",
                "startY": "4",
                "direction": "horizontal",
                "length": "5"
            },
            {
                "x": "20",
                "y": "10"
            }
        ]
    },
    {
        "walls": [
            {
                "x": "5",
                "y": "5"
            },
            {
                "x": "3",
                "y": "3"
            }
        ]
    }
]

function getGridWidth() {
    return width / numSlotsHor;
}

function getGridHeight() {
    return height / numSlotsVer;
}

function fillSquareInsideCell(ctx, offsetX, offsetY, x, y, offsetWidth, offsetHeight) {
    let posX = getGridWidth() * x + (getGridWidth() * (offsetX));
    let posY = getGridHeight() * y + (getGridHeight() * (offsetY));

    ctx.fillRect(posX, posY, getGridWidth() * offsetWidth, getGridHeight() * offsetHeight);
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

    move(currentLevel) {
        this.bodyParts.forEach(p => {
            p.prevX = p.x;
            p.prevY = p.y;
        });

        let head = this.bodyParts[0];
        let modifX = 0, modifY = 0;
        if (head.direction == 'horizontal') {
            modifX = head.modifier;
        } else {
            modifY = head.modifier;
        }

        if (head.x + modifX == numSlotsHor - 1 || head.x + modifX <= 0 || head.y + modifY == numSlotsVer - 1 || head.y + modifY <= 0) {
            die();
            return;
        }

        for(let w = 0; w < levels[currentLevel].walls.length; ++w) {
            let wall = levels[currentLevel].walls[w];

            if(head.x + modifX == wall.x && head.y + modifY == wall.y) {
                die();
                return;
            }
        }

        head.x += modifX;
        head.y += modifY;

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

    drawEyes(ctx) {
        let head = this.bodyParts[0];

        let eyeR = this.r / 2, eyeG = this.g / 2, eyeB = this.b / 2;

        let size = 0.20;
        let positionTable =
        [
            [0.05, 0.05, 0.05, 0.75],
            [0.75, 0.05, 0.75, 0.75],
            [0.05, 0.05, 0.75, 0.05],
            [0.05, 0.75, 0.75, 0.75]
        ];

        let index = (head.modifier > 0 ? 1 : 0) + (head.direction == 'horizontal' ? 0 : 2);

        let arr = positionTable[index];

        ctx.fillStyle = `rgb(${eyeR}, ${eyeG}, ${eyeB})`;
        fillSquareInsideCell(ctx, arr[0], arr[1], head.x, head.y, size, size);
        fillSquareInsideCell(ctx, arr[2], arr[3], head.x, head.y, size, size);
    }

    draw(ctx) {
        ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;

        for (let i = 0; i < this.bodyParts.length; ++i) {
            let part = this.bodyParts[i];

            ctx.fillRect(Math.floor(getGridWidth() * part.x), getGridHeight() * part.y, getGridWidth(), getGridHeight());
        }

        this.drawEyes(ctx);
    }
}

class Fruit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.drawImage(document.getElementById("fruit"), this.x * getGridWidth(), this.y * getGridHeight(), getGridWidth(), getGridHeight());
    }
}

class Game {
    constructor() {
        this.snake = new Snake();
        this.currentLevel = 0;
        this.fruit = this.createFruit();
        this.state = 'paused';
        this.eated_fruits = 0;
        this.missing_fruits = 1;
        this.elapsed = 0;
        this.targetTime = 350;
        this.minTarget = 50;
    }

    createFruit() {
        let x, y;
        let found = false;
        while(!found) {
            x = Math.round((Math.random() * 1000)) % (numSlotsHor - 1);
            y = Math.round((Math.random() * 1000)) % (numSlotsVer - 1);

            x = x == 0 ? 1 : x;
            y = y == 0 ? 1 : y;

            found = true;

            for(let w = 0; w < levels[this.currentLevel].walls.length; ++w) {
                let wall = levels[this.currentLevel].walls[w];

                if(wall.x == x && wall.y == y) {
                    found = false;
                    break;
                }
            }
        }
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

    reset() {
        this.eated_fruits = 0;
        this.fruit = this.createFruit();
        this.state = 'paused';
        this.elapsed = 0;
        this.targetTime = 350;
        this.snake = new Snake();
        document.querySelector('h1#level_text').innerText = `Nível ${this.currentLevel + 1}`;
        document.querySelector('h1#fruit_eated').innerText = `Comeu ${this.eated_fruits += 1} frutinha${this.eated_fruits > 1 ? 's' : ''}`;
        document.querySelector('h1#fruit').innerText = `Falta${this.missing_fruits - this.eated_fruits > 1 ? 'm' : ''} ${this.missing_fruits - this.eated_fruits} frutinha${this.missing_fruits - this.eated_fruits > 1 ? 's' : ''}`;
    }

    eat() {
        let head = this.snake.bodyParts[0];
        if (head.x == this.fruit.x && head.y == this.fruit.y) {
            this.fruit = this.createFruit();
            let last = this.snake.bodyParts[this.snake.bodyParts.length - 1];
            let newLast = new BodyPart(last.prevX, last.prevY, last.direction, last.modifier);
            this.snake.bodyParts.push(newLast);
            
            document.querySelector('h1#fruit_eated').innerText = `Comeu ${this.eated_fruits += 1} frutinha${this.eated_fruits > 1 ? 's' : ''}`;
            document.querySelector('h1#fruit').innerText = `Falta${this.missing_fruits - this.eated_fruits > 1 ? 'm' : ''} ${this.missing_fruits - this.eated_fruits} frutinha${this.missing_fruits - this.eated_fruits > 1 ? 's' : ''}`;

            if(this.targetTime > this.minTarget) {
                this.targetTime -= 12.5;
            }

            if(this.missing_fruits - this.eated_fruits <= 0) {
                if(levels.length - 1 <= this.currentLevel) {
                    alert("Cleared");
                    this.currentLevel = 0;
                    this.reset();
                } else {
                    this.currentLevel += 1;
                    this.reset();
                }
            }
        }       
    }
}

function gameUpdate(ctx, game, deltaTime) {
    ctx.fillStyle = 'rgb(41, 41, 41)';
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(document.getElementById('bg'), 0, 0, width, height);

    for(let row = 0; row < numSlotsVer; ++row) {
        for(let col = 0; col < numSlotsHor; ++col) {
            if(col == 0 || col == numSlotsHor - 1 || row == 0 || row == numSlotsVer - 1) {
                ctx.drawImage(document.getElementById('wall'), getGridWidth() * col, getGridHeight() * row, getGridWidth(), getGridHeight());
            }
        }
    }

    for(let w = 0; w < levels[gGame.currentLevel].walls.length; ++w) {
        let wall = levels[gGame.currentLevel].walls[w];
        ctx.drawImage(document.getElementById("wall"), getGridWidth() * wall.x, getGridHeight() * wall.y, getGridWidth(), getGridHeight());
    }

    game.elapsed += deltaTime;

    if(game.elapsed >= game.targetTime) {
        game.elapsed = 0;

        if(game.state == 'running') {
            game.snake.move(game.currentLevel);
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
    audio.currentTime = 0;
    audio.pause();
}

function onStartResume() {
    let button = document.getElementById('startresume');

    audio.loop = true;
    
    if (gGame !== undefined) {
        if (gGame.state == 'running') {
            gGame.state = 'paused';
            button.innerText = 'Resume';
            audio.pause();
        } else {
            gGame.state = 'running';
            button.innerText = 'Pause';        
            audio.play(); 
        }
    }
}

function onRestart() {
    let button = document.getElementById('startresume');
    button.innerText = "Start";
    button.style = "";
    document.querySelector('h1#fruit').innerText = 'Faltam 30 frutinhas';
    document.querySelector('h1#fruit_eated').innerText = 'Comeu 0 frutinhas';  

    gameStart();
}

function gameStart() {
    let canvas = document.getElementById("canvas");

    width = canvas.width = window.innerWidth / 1.5;
    height = canvas.height = window.innerHeight / 1.5;
    numSlotsVer = Math.round(numSlotsHor * (height / width));
    document.getElementById('lateral').style.height = canvas.height + "px";
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
