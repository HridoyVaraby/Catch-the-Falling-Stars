document.addEventListener('DOMContentLoaded', () => {
    // Create audio elements
    const bgMusic = new Audio('assets/audio/background-music.mp3');
    const catchSound = new Audio('assets/audio/catch-star.mp3');
    const gameOverSound = new Audio('assets/audio/game-over.mp3');
    const catchHeartSound = new Audio('assets/audio/catch-heart.mp3');
    const catchDebrisSound = new Audio('assets/audio/catch-debris.mp3');
    bgMusic.loop = true;
    
    // Handle audio loading errors
    [bgMusic, catchSound, gameOverSound, catchHeartSound, catchDebrisSound].forEach(audio => {
        audio.addEventListener('error', () => {
            console.warn('Audio file failed to load:', audio.src);
        });
    });

    const gameArea = document.getElementById('gameArea');
    const basket = document.getElementById('basket');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startScreenHighScore = document.getElementById('startScreenHighScore');
    const livesElement = document.getElementById('lives');
    const gameOverScreen = document.getElementById('gameOver');
    const finalScoreElement = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    const gameContent = document.querySelector('.game-content');
    const musicVolume = document.getElementById('musicVolume');
    const sfxVolume = document.getElementById('sfxVolume');
    const settingsButton = document.getElementById('settingsButton');

    let score = 0;
    let lives = 5;
    let gameSpeed = 2;
    let spawnRate = 2000;
    let lastSpawnTime = 0;
    let gameLoop;
    let stars = [];
    let basketPosition = gameArea.clientWidth / 2;
    let targetBasketPosition = basketPosition;
    let basketVelocity = 0;
    let isGameOver = false;
    let highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highScoreElement.textContent = highScore;
    startScreenHighScore.textContent = highScore;

    // Initialize audio volumes
    const savedMusicVolume = localStorage.getItem('musicVolume') || 0.5;
    const savedSfxVolume = localStorage.getItem('sfxVolume') || 0.5;
    if (musicVolume) {
        musicVolume.value = savedMusicVolume;
    }
    if (sfxVolume) {
        sfxVolume.value = savedSfxVolume;
    }
    bgMusic.volume = savedMusicVolume;
    catchSound.volume = savedSfxVolume;
    gameOverSound.volume = savedSfxVolume;
    catchHeartSound.volume = savedSfxVolume;
    catchDebrisSound.volume = savedSfxVolume;

    // Handle volume changes
    if (musicVolume) {
        musicVolume.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            bgMusic.volume = volume;
            localStorage.setItem('musicVolume', volume);
        });
    }

    if (sfxVolume) {
        sfxVolume.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            catchSound.volume = volume;
            gameOverSound.volume = volume;
            catchHeartSound.volume = volume;
            catchDebrisSound.volume = volume;
            localStorage.setItem('sfxVolume', volume);
        });
    }

    function updateBasketPosition(e) {
        if (isGameOver) return;
        const speed = 20; // Increased speed for better responsiveness
        const gameAreaRect = gameArea.getBoundingClientRect();
        const basketWidth = basket.offsetWidth;

        if (e.type === 'mousemove' || e.type === 'touchmove') {
            e.preventDefault();
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const rect = gameArea.getBoundingClientRect();
            const relativeX = clientX - rect.left;
            // Center the basket on the touch/mouse position
            targetBasketPosition = Math.max(basketWidth/2, Math.min(relativeX, gameAreaRect.width - basketWidth/2)) - basketWidth/2;
        } else if (e.type === 'keydown') {
            if (e.key === 'ArrowLeft') {
                targetBasketPosition = Math.max(targetBasketPosition - speed, 0);
            } else if (e.key === 'ArrowRight') {
                targetBasketPosition = Math.min(targetBasketPosition + speed, gameAreaRect.width - basketWidth);
            }
        }
    }

    function smoothBasketMovement() {
        const easing = 0.2; // Increased easing for more responsive movement
        const distance = targetBasketPosition - basketPosition;
        basketVelocity = basketVelocity * 0.7 + distance * easing; // Slightly less dampening
        basketPosition += basketVelocity;
        basket.style.left = basketPosition + 'px';
        
        if (!isGameOver) {
            requestAnimationFrame(smoothBasketMovement);
        }
    }

    let lastHeartSpawnTime = 0;
    const heartSpawnRate = 15000; // Spawn heart every 15 seconds
    
    let lastDebrisSpawnTime = 0;
    const debrisSpawnRate = 3000; // Spawn debris every 3 seconds
    
    let lastDangerousDebrisSpawnTime = 0;
    const dangerousDebrisSpawnRate = 5000; // Spawn dangerous debris every 5 seconds

    function createDebris() {
        const debris = document.createElement('div');
        debris.className = 'debris';
        const gameAreaRect = gameArea.getBoundingClientRect();
        const debrisWidth = window.innerWidth <= 480 ? 24 : (window.innerWidth <= 768 ? 28 : 30);
        const randomX = Math.random() * (gameAreaRect.width - debrisWidth - 10) + 5;
        debris.style.left = randomX + 'px';
        debris.style.top = '0px';
        gameArea.appendChild(debris);

        stars.push({
            element: debris,
            x: randomX,
            y: 0,
            speed: gameSpeed * 1.1,
            points: -2,
            isDebris: true
        });
    }
    
    function createDangerousDebris() {
        const dangerousDebris = document.createElement('div');
        dangerousDebris.className = 'dangerous-debris';
        const gameAreaRect = gameArea.getBoundingClientRect();
        const debrisWidth = window.innerWidth <= 480 ? 24 : (window.innerWidth <= 768 ? 28 : 30);
        const randomX = Math.random() * (gameAreaRect.width - debrisWidth - 10) + 5;
        dangerousDebris.style.left = randomX + 'px';
        dangerousDebris.style.top = '0px';
        gameArea.appendChild(dangerousDebris);

        stars.push({
            element: dangerousDebris,
            x: randomX,
            y: 0,
            speed: gameSpeed * 1.3,
            points: -4,
            isDebris: true,
            isDangerous: true
        });
    }

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        const gameAreaRect = gameArea.getBoundingClientRect();
        const heartWidth = window.innerWidth <= 480 ? 24 : (window.innerWidth <= 768 ? 28 : 30);
        const randomX = Math.random() * (gameAreaRect.width - heartWidth - 10) + 5;
        heart.style.left = randomX + 'px';
        heart.style.top = '0px';
        gameArea.appendChild(heart);

        stars.push({
            element: heart,
            x: randomX,
            y: 0,
            speed: gameSpeed * 0.8,
            points: 0,
            isHeart: true
        });
    }

    function createStar() {
        const star = document.createElement('div');
        const starTypes = ['gold', 'blue', 'red', 'purple'];
        const starType = starTypes[Math.floor(Math.random() * starTypes.length)];
        star.className = `star star-${starType}`;
        const gameAreaRect = gameArea.getBoundingClientRect();
        const starWidth = window.innerWidth <= 480 ? 24 : (window.innerWidth <= 768 ? 28 : 30);
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

        if (currentTime - lastHeartSpawnTime > heartSpawnRate) {
            createHeart();
            lastHeartSpawnTime = currentTime;
        }

        if (currentTime - lastDebrisSpawnTime > debrisSpawnRate) {
            createDebris();
            lastDebrisSpawnTime = currentTime;
        }
        
        if (currentTime - lastDangerousDebrisSpawnTime > dangerousDebrisSpawnRate) {
            createDangerousDebris();
            lastDangerousDebrisSpawnTime = currentTime;
        }

        stars = stars.filter(star => {
            const isFallen = moveStar(star);
            if (isFallen) {
                gameArea.removeChild(star.element);
                if (!star.isDebris) {
                    lives--;
                    livesElement.textContent = lives;
                    if (lives <= 0) endGame();
                }
                return false;
            }

            if (checkCollision(star)) {
                gameArea.removeChild(star.element);
                if (star.isHeart) {
                    lives++;
                    livesElement.textContent = lives;
                    catchHeartSound.play().catch(() => {});
                } else if (star.isDebris) {
                    score = Math.max(0, score + star.points);
                    scoreElement.textContent = score;
                    catchDebrisSound.play().catch(() => {});
                } else {
                    score += star.points;
                    scoreElement.textContent = score;
                    increaseDifficulty();
                    catchSound.play().catch(() => {});
                }
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
        bgMusic.pause();
        bgMusic.currentTime = 0;
        gameOverSound.play().catch(() => {});
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
        // Show settings button when game ends
        settingsButton.classList.remove('hidden');
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
        // Hide settings button when game starts
        settingsButton.classList.add('hidden');
        lastSpawnTime = Date.now();
        lastHeartSpawnTime = Date.now();
        lastDebrisSpawnTime = Date.now();
        lastDangerousDebrisSpawnTime = Date.now();
        bgMusic.play().catch(() => {});
        requestAnimationFrame(updateGame);
        requestAnimationFrame(smoothBasketMovement);
    }

    const homeButton = document.getElementById('homeButton');
    homeButton.addEventListener('click', () => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        gameOverScreen.classList.add('hidden');
        gameContent.classList.add('hidden');
        startScreen.classList.remove('hidden');
        // Show settings button when returning to home screen
        settingsButton.classList.remove('hidden');
    });

    document.addEventListener('keydown', updateBasketPosition);
    gameArea.addEventListener('mousemove', updateBasketPosition);
    gameArea.addEventListener('touchmove', updateBasketPosition, { passive: false });
    gameArea.addEventListener('touchstart', updateBasketPosition, { passive: false });
    gameArea.addEventListener('touchend', e => e.preventDefault(), { passive: false });
    
    // Prevent context menu on long touch
    gameArea.addEventListener('contextmenu', e => e.preventDefault());
    
    // Handle window resize for responsive gameplay
    window.addEventListener('resize', () => {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const basketWidth = basket.offsetWidth;
        if (basketPosition > gameAreaRect.width - basketWidth) {
            basketPosition = gameAreaRect.width - basketWidth;
            targetBasketPosition = basketPosition;
        }
    });
    
    restartButton.addEventListener('click', startGame);
    startButton.addEventListener('click', startGame);
    
    // Handle settings button click to force fresh page load
    if (settingsButton) {
        settingsButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Add timestamp to force fresh page load and prevent scroll restoration
            window.location.href = 'settings.html?t=' + Date.now() + '#top';
        });
    }
});