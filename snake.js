const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let changingDirection = false;
let gameOver = false;

highScoreEl.textContent = highScore;

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    // Ensure food doesn't spawn on the snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    ctx.fillStyle = 'lightgreen';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function update() {
    if (gameOver) return;

    changingDirection = false;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }

    // Wall collision
    if (head.x < 0 || head.x * gridSize >= canvas.width || head.y < 0 || head.y * gridSize >= canvas.height) {
        endGame();
        return;
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    if (keyPressed === 'ArrowUp' && !goingDown) direction = 'up';
    if (keyPressed === 'ArrowDown' && !goingUp) direction = 'down';
    if (keyPressed === 'ArrowLeft' && !goingRight) direction = 'left';
    if (keyPressed === 'ArrowRight' && !goingLeft) direction = 'right';
}

function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
    alert(`Game Over! Your score was ${score}. Press OK to restart.`);
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreEl.textContent = score;
    gameOver = false;
    generateFood();
    main();
}

function main() {
    if (gameOver) return;
    setTimeout(() => {
        update();
        draw();
        main();
    }, 100);
}

document.addEventListener('keydown', changeDirection);
generateFood();
main();
