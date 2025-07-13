const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');

// Hide canvas initially
canvas.style.display = 'none';

// Only start game when Start button is clicked
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  canvas.style.display = '';
  difficultySelect.disabled = true;
  restartGame();
});

// When game ends, show Start screen and re-enable difficulty
function endGame() {
  gameOver = true;
  setTimeout(() => {
    startScreen.style.display = 'flex';
    canvas.style.display = 'none';
    difficultySelect.disabled = false;
  }, 1500);
}

// Load Lamar image
const lamarImg = new Image();
lamarImg.src = 'lamar_cartoon_v2-removebg-preview.png';

// Lamar properties
const lamar = {
  x: canvas.width / 2,
  y: 80,
  width: 80,
  height: 120,
  speed: 7,
  dx: 0
};

// Load Steeler image
const steelerImg = new Image();
steelerImg.src = 'steeler-removebg-preview.png';

// Steelers array
const steelers = [];
const steelerWidth = 60;
const steelerHeight = 90;
// Difficulty settings
const difficultySettings = {
  easy:   { steelerSpeed: 1, steelerSpawnInterval: 120 },
  medium: { steelerSpeed: 2, steelerSpawnInterval: 80 },
  hard:   { steelerSpeed: 3, steelerSpawnInterval: 50 }
};
let currentDifficulty = 'medium';
let steelerSpeed = difficultySettings[currentDifficulty].steelerSpeed;
let steelerSpawnInterval = difficultySettings[currentDifficulty].steelerSpawnInterval;
let steelerSpawnTimer = 0;

// Footballs array
const footballs = [];
const footballWidth = 25; // 20 * 1.25
const footballHeight = 50; // 40 * 1.25
const footballSpeed = 10;

// Load Football image
const footballImg = new Image();
footballImg.src = 'football-removebg-preview.png';

// Load Football Field image
const fieldImg = new Image();
fieldImg.src = 'football_field.jpg';

// Game state
let gameOver = false;
let gameWon = false;

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ' && canThrow && !gameOver) {
    // Throw football from Lamar's center
    footballs.push({
      x: lamar.x + lamar.width / 2 - footballWidth / 2,
      y: lamar.y + lamar.height / 2 - footballHeight / 2
    });
    canThrow = false;
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (e.key === ' ') canThrow = true;
});

// Handle football throwing
let canThrow = true;

function restartGame() {
  // Reset all game state
  steelers.length = 0;
  footballs.length = 0;
  lamar.x = canvas.width / 2;
  steelerSpawnTimer = 0;
  gameOver = false;
  gameWon = false;
  // Start game loop
  gameLoop();
}

function spawnSteeler() {
  // Random x position at bottom
  const x = Math.random() * (canvas.width - steelerWidth);
  steelers.push({ x, y: canvas.height - steelerHeight });
}

function update() {
  if (gameOver) return;
  // Move Lamar left/right
  if (keys['ArrowLeft']) {
    lamar.dx = -lamar.speed;
  } else if (keys['ArrowRight']) {
    lamar.dx = lamar.speed;
  } else {
    lamar.dx = 0;
  }
  lamar.x += lamar.dx;
  // Keep Lamar within canvas
  lamar.x = Math.max(0, Math.min(canvas.width - lamar.width, lamar.x));

  // Spawn Steelers
  steelerSpawnTimer++;
  if (steelerSpawnTimer >= steelerSpawnInterval) {
    spawnSteeler();
    steelerSpawnTimer = 0;
  }
  // Move Steelers up
  for (let i = steelers.length - 1; i >= 0; i--) {
    steelers[i].y -= steelerSpeed;
    // Check lose condition
    if (steelers[i].y <= lamar.y + lamar.height / 2) {
      endGame();
      gameWon = false;
    }
  }
  // Move footballs down
  for (let i = footballs.length - 1; i >= 0; i--) {
    footballs[i].y += footballSpeed;
    // Remove football if off screen (bottom)
    if (footballs[i].y > canvas.height) {
      footballs.splice(i, 1);
    }
  }
  // Collision detection
  for (let i = steelers.length - 1; i >= 0; i--) {
    for (let j = footballs.length - 1; j >= 0; j--) {
      if (
        footballs[j].x < steelers[i].x + steelerWidth &&
        footballs[j].x + footballWidth > steelers[i].x &&
        footballs[j].y < steelers[i].y + steelerHeight &&
        footballs[j].y + footballHeight > steelers[i].y
      ) {
        // Collision! Remove both
        steelers.splice(i, 1);
        footballs.splice(j, 1);
        break;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw rotated football field background
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2); // 90 degrees
  ctx.drawImage(fieldImg, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
  ctx.restore();
  // Draw Lamar
  ctx.drawImage(lamarImg, lamar.x, lamar.y, lamar.width, lamar.height);
  // Draw Steelers
  for (const s of steelers) {
    ctx.drawImage(steelerImg, s.x, s.y, steelerWidth, steelerHeight);
  }
  // Draw footballs
  for (const f of footballs) {
    ctx.drawImage(footballImg, f.x, f.y, footballWidth, footballHeight);
  }
  // Game over message
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, canvas.height/2 - 60, canvas.width, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gameWon ? 'You Win!' : 'Game Over!', canvas.width/2, canvas.height/2);
  }
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

lamarImg.onload = () => {
  steelerImg.onload = () => {
    footballImg.onload = () => {
      fieldImg.onload = () => {
        gameLoop();
      };
    };
  };
}; 