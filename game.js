document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const basket = document.getElementById('basket');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const livesElement = document.getElementById('lives');
    const gameOverScreen = document.getElementById('gameOver');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    const gameContent = document.querySelector('.game-content');

    let score = 0;
    let lives = 5;
    let gameSpeed = 2;
    let spawnRate = 2000;
    let lastSpawnTime = 0;
    let gameLoop;
    let stars = [];
    let basketPosition = gameArea.clientWidth / 2;
    let isGameOver = false;
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highScoreElement.textContent = highScore;

    function updateBasketPosition(e) {
        if (isGameOver) return;
        const speed = 15;
        const gameAreaRect = gameArea.getBoundingClientRect();
        const basketWidth = basket.offsetWidth;

        if (e.type === 'mousemove' || e.type === 'touchmove') {
            e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const rect = gameArea.getBoundingClientRect();
            const relativeX = clientX - rect.left;
            basketPosition = Math.max(0, Math.min(relativeX - basketWidth / 2, gameAreaRect.width - basketWidth));
        } else if (e.type === 'keydown') {
            if (e.key === 'ArrowLeft') {
                basketPosition = Math.max(basketPosition - speed, 0);
            } else if (e.key === 'ArrowRight') {
                basketPosition = Math.min(basketPosition + speed, gameAreaRect.width - basketWidth);
            }
        }
        basket.style.left = basketPosition + 'px';
    }

    function createStar() {
        const star = document.createElement('div');
        const starTypes = ['gold', 'blue', 'red', 'purple'];
        const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
        star.className = `star star-${starType}`;
        const gameAreaRect = gameArea.getBoundingClientRect();
        const starWidth = 30;
        const randomX = Math.random() * (gameAreaRect.width - starWidth - 10) + 5;
        star.style.left = randomX + 'px';
        star.style.top = '0px';
        gameArea.appendChild(star);
        
        let speed = gameSpeed;
        let points = 1;
        
        switch(starType) {
            case 'red':
                speed *= 1.4;
                points = 3;
                break;
            case 'blue':
                speed *= 1.2;
                points = 2;
                break;
            case 'purple':
                speed *= 1.3;
                points = 2;
                break;
        }
        
        stars.push({
            element: star,
            x: randomX,
            y: 0,
            speed: speed,
            points: points
        });
    }

    function moveStar(star) {
        star.y += star.speed;
        star.element.style.top = star.y + 'px';
        return star.y > gameArea.clientHeight;
    }

    function checkCollision(star) {
        const basketRect = basket.getBoundingClientRect();
        const starRect = star.element.getBoundingClientRect();

        return !(basketRect.right < starRect.left || 
                basketRect.left > starRect.right || 
                basketRect.bottom < starRect.top || 
                basketRect.top > starRect.bottom);
    }

    function updateGame() {
        const currentTime = Date.now();
        if (currentTime - lastSpawnTime > spawnRate) {
            createStar();
            lastSpawnTime = currentTime;
        }

        stars = stars.filter(star => {
            const isFallen = moveStar(star);
            if (isFallen) {
                gameArea.removeChild(star.element);
                lives--;
                livesElement.textContent = lives;
                if (lives <= 0) endGame();
                return false;
            }

            if (checkCollision(star)) {
                gameArea.removeChild(star.element);
                score++;
                scoreElement.textContent = score;
                increaseDifficulty();
                return false;
            }
            return true;
        });

        if (!isGameOver) {
            requestAnimationFrame(updateGame);
        }
    }

    function increaseDifficulty() {
        if (score % 10 === 0) {
            gameSpeed += 0.1;
            spawnRate = Math.max(800, spawnRate - 50);
        }
    }

    function endGame() {
        isGameOver = true;
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    function startGame() {
        score = 0;
        lives = 5;
        gameSpeed = 2;
        spawnRate = 2000;
        isGameOver = false;
        stars.forEach(star => gameArea.removeChild(star.element));
        stars = [];
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        gameOverScreen.classList.add('hidden');
        startScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        lastSpawnTime = Date.now();
        requestAnimationFrame(updateGame);
    }

    document.addEventListener('keydown', updateBasketPosition);
    gameArea.addEventListener('mousemove', updateBasketPosition);
    gameArea.addEventListener('touchmove', updateBasketPosition, { passive: false });
    gameArea.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    restartButton.addEventListener('click', startGame);
    startButton.addEventListener('click', startGame);
});
