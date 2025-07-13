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
  showMobileControls(true);
  restartGame();
});

// When game ends, show Start screen and re-enable difficulty
function endGame() {
  gameOver = true;
  setTimeout(() => {
    startScreen.style.display = 'flex';
    canvas.style.display = 'none';
    difficultySelect.disabled = false;
    showMobileControls(false);
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
  hard:   { steelerSpeed: 5, steelerSpawnInterval: 30 } // much harder
};
let currentDifficulty = 'medium';
let steelerSpeed = difficultySettings[currentDifficulty].steelerSpeed;
let steelerSpawnInterval = difficultySettings[currentDifficulty].steelerSpawnInterval;
let steelerSpawnTimer = 0;
let steelerKillCount = 0;

// DHs array (formerly footballs)
const DHs = [];
const DHWidth = 75 * 1.2; // 168.75
const DHHeight = 150 * 1.2; // 337.5
const DHSpeed = 3; // 10 / 2

// Load DH image (formerly football image)
const DHImg = new Image();
DHImg.src = 'DH-removebg-preview.png';

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
  if (e.key === ' ' && canThrow && !gameOver && canvas.style.display !== 'none') {
    // Throw football from Lamar's center
    DHs.push({
      x: lamar.x + lamar.width / 2 - DHWidth / 2,
      y: lamar.y + lamar.height / 2 - DHHeight / 2
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
  DHs.length = 0;
  lamar.x = canvas.width / 2;
  steelerSpawnTimer = 0;
  gameOver = false;
  gameWon = false;
  steelerKillCount = 0;
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
  // Move DHs down
  for (let i = DHs.length - 1; i >= 0; i--) {
    DHs[i].y += DHSpeed;
    // Remove DH if off screen (bottom)
    if (DHs[i].y > canvas.height) {
      DHs.splice(i, 1);
    }
  }
  // Collision detection
  for (let i = steelers.length - 1; i >= 0; i--) {
    for (let j = DHs.length - 1; j >= 0; j--) {
      if (
        DHs[j].x < steelers[i].x + steelerWidth &&
        DHs[j].x + DHWidth > steelers[i].x &&
        DHs[j].y < steelers[i].y + steelerHeight &&
        DHs[j].y + DHHeight > steelers[i].y
      ) {
        // Collision! Remove both
        steelers.splice(i, 1);
        DHs.splice(j, 1);
        steelerKillCount++;
        break;
      }
    }
  }
}

// Responsive canvas scaling
function resizeCanvas() {
  // Maintain 600:800 aspect ratio
  const aspect = 600 / 800;
  let width = window.innerWidth;
  let height = window.innerHeight;
  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(canvas.width / 600, canvas.height / 800);
  // Draw rotated football field background
  ctx.save();
  ctx.translate(600 / 2, 800 / 2);
  ctx.rotate(Math.PI / 2); // 90 degrees
  ctx.drawImage(fieldImg, -800 / 2, -600 / 2, 800, 600);
  ctx.restore();
  // Draw Lamar
  ctx.drawImage(lamarImg, lamar.x, lamar.y, lamar.width, lamar.height);
  // Draw Steelers
  for (const s of steelers) {
    ctx.drawImage(steelerImg, s.x, s.y, steelerWidth, steelerHeight);
  }
  // Draw DHs
  for (const d of DHs) {
    ctx.drawImage(DHImg, d.x, d.y, DHWidth, DHHeight);
  }
  // Game over message
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 800/2 - 60, 600, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gameWon ? 'You Win!' : 'Game Over!', 600/2, 800/2);
  }
  // In draw(), display the kill count
  ctx.save();
  ctx.scale(canvas.width / 600, canvas.height / 800);
  ctx.font = '32px Impact, sans-serif';
  ctx.fillStyle = '#fff700';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'left';
  ctx.strokeText('Steelers Knocked Down: ' + steelerKillCount, 20, 50);
  ctx.fillText('Steelers Knocked Down: ' + steelerKillCount, 20, 50);
  ctx.restore();
  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(gameLoop);
}

lamarImg.onload = () => {
  steelerImg.onload = () => {
    DHImg.onload = () => {
      fieldImg.onload = () => {
        gameLoop();
      };
    };
  };
};

// Show mobile controls if on mobile device
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
const mobileControls = document.getElementById('mobileControls');

// Show/hide mobile controls based on game state
function showMobileControls(show) {
  if (!isMobile()) return;
  mobileControls.style.display = show ? '' : 'none';
}

// Hide mobile controls on home screen
showMobileControls(false);

// Touch controls for mobile
if (isMobile()) {
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const throwBtn = document.getElementById('throwBtn');

  function vibrate(ms) {
    if (window.navigator.vibrate) window.navigator.vibrate(ms);
  }

  leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; vibrate(30); });
  leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
  rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; vibrate(30); });
  rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
  throwBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (canThrow && !gameOver) {
      DHs.push({
        x: lamar.x + lamar.width / 2 - DHWidth / 2,
        y: lamar.y + lamar.height / 2 - DHHeight / 2
      });
      canThrow = false;
      vibrate(50);
    }
  });
  throwBtn.addEventListener('touchend', (e) => { e.preventDefault(); canThrow = true; });
}

// Prevent scrolling when touching the canvas
canvas.addEventListener('touchstart', function(e) { e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', function(e) { e.preventDefault(); }, { passive: false }); 