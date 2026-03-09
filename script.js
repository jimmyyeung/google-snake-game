const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const foodCountElement = document.getElementById('foodCount');
const livesElement = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let foods = [];
let bullets = [];
let dx = 0;
let dy = 0;
let score = 0;
let foodCount = 0;
let lives = 3;
let gameRunning = false;

function randomTile() {
    return Math.floor(Math.random() * tileCount);
}

function generateFood() {
    let newFood = {
        x: randomTile(),
        y: randomTile()
    };
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
            generateFood();
            return;
        }
    }
    foods.push(newFood);
    foodCount++;
    foodCountElement.textContent = foodCount;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'green';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw foods
    ctx.fillStyle = 'red';
    for (let food of foods) {
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw bullets
    ctx.fillStyle = 'blue';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x * gridSize, bullet.y * gridSize, gridSize - 2, gridSize - 2);
    }
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    let ateFood = false;
    for (let i = 0; i < foods.length; i++) {
        if (head.x === foods[i].x && head.y === foods[i].y) {
            score += 10;
            scoreElement.textContent = score;
            foods.splice(i, 1);
            foodCount--;
            foodCountElement.textContent = foodCount;
            if (foodCount === 0) generateFood();
            ateFood = true;
            break;
        }
    }

    if (!ateFood) {
        snake.pop();
    }
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Check wall collision
        if (bullet.x < 0 || bullet.x >= tileCount || bullet.y < 0 || bullet.y >= tileCount) {
            lives += 67;
            livesElement.textContent = lives;
            bullets.splice(i, 1);
            continue;
        }

        // Check food collision
        for (let j = foods.length - 1; j >= 0; j--) {
            if (bullet.x === foods[j].x && bullet.y === foods[j].y) {
                foods.splice(j, 1);
                foodCount--;
                foodCountElement.textContent = foodCount;
                if (foodCount === 0) generateFood();
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;

    moveSnake();
    moveBullets();

    if (checkCollision()) {
        lives--;
        livesElement.textContent = lives;
        if (lives <= 0) {
            gameRunning = false;
            alert('Game Over! Score: ' + score);
            return;
        } else {
            // Reset snake position
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
        }
    }

    drawGame();
    setTimeout(gameLoop, 100); // Adjust speed here
}

function startGame() {
    snake = [{x: 10, y: 10}];
    foods = [];
    bullets = [];
    dx = 0;
    dy = 0;
    score = 0;
    foodCount = 0;
    lives = 3;
    scoreElement.textContent = score;
    foodCountElement.textContent = foodCount;
    livesElement.textContent = lives;
    generateFood();
    gameRunning = true;
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    const key = e.key;
    if (key === 'ArrowLeft' && dx === 0) {
        dx = -1;
        dy = 0;
    } else if (key === 'ArrowUp' && dy === 0) {
        dx = 0;
        dy = -1;
    } else if (key === 'ArrowRight' && dx === 0) {
        dx = 1;
        dy = 0;
    } else if (key === 'ArrowDown' && dy === 0) {
        dx = 0;
        dy = 1;
    } else if (key === 'f' || key === 'F') {
        if (dx !== 0 || dy !== 0) {
            bullets.push({x: snake[0].x, y: snake[0].y, dx: dx, dy: dy});
        }
    }
});

startBtn.addEventListener('click', startGame);

// Initial draw
drawGame();