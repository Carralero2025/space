// === JOGO DE NAVE ESTILO 1942 ===
// Código completo com comentários detalhados em cada seção

let warImages = []; // Imagens de fundo variáveis por fase
let currentWarImage;

let shipImage, shotImage, shot2Image, explosionImage;
let gameOverImage, boxImage, menuImage, faseImage, pontosImage;
let obstacleImages = [];

let musicaFundo, somTiroNave, somTiroInimigo, somExplode, somSecret, somGameOver, somMenu, somFaseCompleta; // variáveis dos sons do jogo

// Arrays para tiros e inimigos
let tiros = [];
let tirosInimigos = [];

// Variável para controle de tempo dos tiros inimigos
let ultimoTiroInimigo = 0;
let intervaloTiroInimigo = 500; // em milissegundos

let backgroundX = 0;
let isMoving = true;
let shipX, shipY;
let speed = 5;
let shots = [];
let obstacles = [];
let enemyShots = [];
let boss = null;
let secretItem = null;

let score = 0;
let lives = 3;
const maxLives = 20;
let gameOver = false;

let specialShot = false;
let specialTimer = 0;
const specialDuration = 10 * 60;

let gameStarted = false;
let particles = [];

let showFaseScreen = false;
let faseScreenTimer = 0;
const faseScreenDuration = 180;

function preload() {
  // música de fundo ao iniciar o jogo
  //soundFormats('mp3', 'wav', 'ogg', 'flac');
  musicaFundo = loadSound('sounds/musica_fundo.m4a');
  somTiroNave = loadSound('sounds/tironave.mp3');
  somTiroInimigo = loadSound('sounds/tiroinimigo.wav');
  somExplode = loadSound('sounds/explode.wav');
  somSecret = loadSound('sounds/bonus.wav');

  // Carrega imagens do fundo para diferentes fases
  for (let i = 0; i <= 7; i++) {
    warImages.push(loadImage(`assets/war${i}.jpg`));
  }
  currentWarImage = warImages[0];
  
  // Carrega sprites da nave, tiros, explosão, HUDs e inimigos
  shipImage = loadImage("assets/nave.png");
  shotImage = loadImage("assets/tiro.png");
  shot2Image = loadImage("assets/tirop.png");
  explosionImage = loadImage("assets/explode.png");
  gameOverImage = loadImage("assets/gameover.png");
  boxImage = loadImage("assets/secret.png");
  menuImage = loadImage("assets/menu.png");
  faseImage = loadImage("assets/fase.png");
  pontosImage = loadImage("assets/pontovida.png");

  // Obstáculos aleatórios
  for (let i = 1; i <= 10; i++) {
    obstacleImages.push(loadImage(`assets/m${i}.png`));
  }
}

function setup() {
  createCanvas(1280, 720);
  shipX = 100;
  shipY = height / 2 - 50;
  textFont('Georgia');

  // Toca a música em loop
    musicaFundo.setLoop(true);
    musicaFundo.setVolume(0.1); // Ajuste o volume como quiser
    somTiroNave.setVolume(0.3)
    somTiroInimigo.setVolume(0.3)
    somExplode.setVolume(0.3)
    somSecret.setVolume(0.3)
}

function draw() {
  background(0);

  // Tela de menu inicial
  if (!gameStarted) {
    image(menuImage, 0, 0, width, height);
    fill(255);
    textSize(28);
    textAlign(CENTER);
    return;

    // Toca a música em loop
  if (musicaFundo && !musicaFundo.isPlaying()) {
    musicaFundo.setVolume(0.1); // Volume de 0.0 a 1.0
    musicaFundo.loop(); // Reproduz em loop infinito
  }

  }

  // Tela de fim de jogo
  if (gameOver) {

    imageMode(CENTER);
    image(gameOverImage, width / 2, height / 2);
    imageMode(CORNER);
    return;
  }

  // Tela intermediária de transição entre fases
  if (showFaseScreen) {
    image(faseImage, 0, 0, width, height);
    faseScreenTimer--;
    if (faseScreenTimer <= 0) showFaseScreen = false;
    return;
  }

  // Fundo com rolagem contínua lateral
  image(currentWarImage, backgroundX, height / 2 - currentWarImage.height / 2);
  image(currentWarImage, backgroundX + currentWarImage.width, height / 2 - currentWarImage.height / 2);
  if (isMoving) {
    backgroundX -= 2;
    if (backgroundX <= -currentWarImage.width) backgroundX = 0;
  }

  let topLimit = 80;
  let bottomLimit = height - (currentWarImage.height / 2) + 2 * 150;

  // Controle do tiro especial por tempo
  if (specialShot && specialTimer > 0) {
    specialTimer--;
    if (specialTimer === 0) specialShot = false;
  }

  // Desenha a nave do jogador
  image(shipImage, shipX, shipY);
  if (keyIsDown(LEFT_ARROW)) shipX = max(80, shipX - speed);
  if (keyIsDown(RIGHT_ARROW)) shipX += speed;
  if (keyIsDown(UP_ARROW)) shipY = max(topLimit, shipY - speed);
  if (keyIsDown(DOWN_ARROW)) shipY = min(bottomLimit - shipImage.height, shipY + speed);

  // Tiros do jogador
  for (let i = shots.length - 1; i >= 0; i--) {
    shots[i].x += 10;
    image(shotImage, shots[i].x, shots[i].y);
    if (shots[i].x > width) shots.splice(i, 1);
  }

  // Criação de novos obstáculos
  if (frameCount % 60 === 0 && isMoving) {
    let idx = floor(random(obstacleImages.length));
    let y = random(topLimit, bottomLimit - 40);
    obstacles.push({ x: width, y, direction: random([1, -1]), speedY: 2, img: obstacleImages[idx], scale: 1.6, hit: false, explosionTimer: 0 });
  }

  // Tiros inimigos
  if (isMoving) {
    for (let i = 0; i < obstacles.length; i++) {
      if (frameCount % 90 === 0) {
        enemyShots.push({ x: obstacles[i].x, y: obstacles[i].y + 20 });
      }
    }
  }

  // Atualização dos tiros inimigos
  for (let i = enemyShots.length - 1; i >= 0; i--) {
    let hit = false;
    for (let j = shots.length - 1; j >= 0; j--) {
      if (collideRectRect(shots[j].x, shots[j].y, 20, 20, enemyShots[i].x, enemyShots[i].y, shot2Image.width, shot2Image.height)) {
        createExplosion(enemyShots[i].x + 10, enemyShots[i].y + 10);
        enemyShots.splice(i, 1);
        shots.splice(j, 1);
        hit = true;
        break;
      }
    }

    // Controla disparo automático dos inimigos
  if (millis() - ultimoTiroInimigo > intervaloTiroInimigo) {
    dispararTiroInimigo();
    ultimoTiroInimigo = millis();
  }

    if (hit) continue;

    if (isMoving) enemyShots[i].x -= 6;
    image(shot2Image, enemyShots[i].x, enemyShots[i].y);

 if (enemyShots[i].x < 0) {
  enemyShots.splice(i, 1);
} else if (collideRectRect(enemyShots[i].x, enemyShots[i].y, shot2Image.width, shot2Image.height, shipX, shipY, shipImage.width, shipImage.height)) {
  lives = max(0, lives - 1);
  enemyShots.splice(i, 1);
  if (lives === 0) gameOver = true;
}

  }

  // Atualização dos obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    if (isMoving && !obs.hit) {
      obs.y += obs.speedY * obs.direction;
      if (obs.y < topLimit || obs.y > bottomLimit - 40) obs.direction *= -1;
    }

    if (!obs.hit) {
      obs.x -= isMoving ? 4 : 0;
      push();
      translate(obs.x + (obs.img.width * obs.scale) / 2, obs.y + (obs.img.height * obs.scale) / 2);
      scale(obs.scale);
      imageMode(CENTER);
      image(obs.img, 0, 0);
      imageMode(CORNER);
      pop();
    } else {
      image(explosionImage, obs.x, obs.y);
      obs.explosionTimer++;
      if (obs.explosionTimer > 15) obstacles.splice(i, 1);
      continue;
    }

if (!obs.hit && collideRectRect(shipX, shipY, shipImage.width, shipImage.height, obs.x, obs.y, obs.img.width * obs.scale, obs.img.height * obs.scale)) {
  obstacles.splice(i, 1);
  lives = max(0, lives - 1);
  if (lives === 0) gameOver = true;
  continue;
}

  for (let j = shots.length - 1; j >= 0; j--) {
      if (collideRectRect(shots[j].x, shots[j].y, 20, 20, obs.x, obs.y, obs.img.width * obs.scale, obs.img.height * obs.scale)) {
        obs.hit = true;
        createExplosion(obs.x + 20, obs.y + 20);
        shots.splice(j, 1);
        score += 50;
        if (score % 1500 === 0 && lives < maxLives) lives++;
        if (score % 2000 === 0) {
          shuffle(obstacleImages, true);
          currentWarImage = random(warImages);
          speed *= 1.1;
          showFaseScreen = true;
          faseScreenTimer = faseScreenDuration;
        }
        break;
      }
    }
  }

  // Boss (libera tiro especial)
  if (!boss && frameCount % (60 * 60 * 2) === 0) {
    boss = { x: width, y: random(topLimit, bottomLimit - 100), active: true };
  }
  if (boss && boss.active) {
    boss.x -= isMoving ? 2 : 0;
    image(boxImage, boss.x, boss.y);
    if (collideRectRect(shipX, shipY, shipImage.width, shipImage.height, boss.x, boss.y, boxImage.width, boxImage.height)) {
      specialShot = true;
      specialTimer = specialDuration;
      boss.active = false;
    }
    if (boss.x + boxImage.width < 0) boss = null;
  }

  // Item secreto oscilante (aumenta score)
  if (score > 0 && score % 1000 === 0 && secretItem === null) {
    secretItem = {
      x: width,
      yBase: random(topLimit + 50, bottomLimit - 50),
      angle: 0,
      amplitude: 30,
      speedX: 4,
      speedAngle: 0.1,
      active: true
    };
  }

  if (secretItem && secretItem.active) {
    if (isMoving) {
      secretItem.x -= secretItem.speedX;
      secretItem.angle += secretItem.speedAngle;
    }
    let secretY = secretItem.yBase + sin(secretItem.angle) * secretItem.amplitude;
    image(boxImage, secretItem.x, secretY);

    if (collideRectRect(shipX, shipY, shipImage.width, shipImage.height, secretItem.x, secretY, boxImage.width, boxImage.height)) {

      if (somSecret && somSecret.isLoaded()) {
    somSecret.play();
  }

      score += 200;
      createExplosion(secretItem.x + 20, secretY + 20);
      secretItem.active = false;
      secretItem = null;
    } else if (secretItem.x + boxImage.width < 0) {
      secretItem.active = false;
      secretItem = null;
    }
  }

  // Desenha partículas de explosão
  drawParticles();

  // HUD: Pontuação e vidas
  image(pontosImage, 10, 10);
  textSize(24);
  textFont('Georgia')
  fill('#0F0F0F');
  text(score, 90, 63);
  text(lives, 233, 63);
}

// Entrada de teclas
function keyPressed() {
  if (!gameStarted && keyCode === ENTER) {
    gameStarted = true;

    if (!musicaFundo.isPlaying()) {
  musicaFundo.play();
}

  } else if (key === ' ' && lives > 0 && !gameOver) {
    shots.push({
      x: shipX + shipImage.width,
      y: shipY + shipImage.height / 2 - shotImage.height / 2
    });

     if (somTiroNave.isPlaying()) {
      somTiroNave.stop(); // Garante que o som reinicie
    }
    somTiroNave.play();
  
  } else if (key === 'p' || key === 'P') {
    isMoving = false;
  } else if (key === 'c' || key === 'C') {
    isMoving = true;
  } else if (keyCode === ENTER && gameOver) {
    // Reinicia o jogo completamente
    gameOver = false;
    lives = 3;
    score = 0;
    shipX = 100;
    shipY = height / 2 - 50;
    shots = [];
    obstacles = [];
    enemyShots = [];
    boss = null;
    specialShot = false;
    specialTimer = 0;
    speed = 5;
    secretItem = null;
    currentWarImage = warImages[0];
    particles = [];

    if (!musicaFundo.isPlaying()) {
  musicaFundo.play();
}

  }
}

// Colisão de retângulos
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Criar partículas de explosão
function createExplosion(x, y) {
  if (somExplode && somExplode.isLoaded()) {
    somExplode.play();
  }
  for (let i = 0; i < 10; i++) {
    particles.push({
      x, y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      life: 30
    });
  }
}

// Desenhar partículas de explosão
function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(255, 100, 0, map(p.life, 0, 30, 0, 255));
    ellipse(p.x, p.y, 8);
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// Função para disparar um tiro inimigo
function dispararTiroInimigo() {
  let x = random(50, width - 50); // posição aleatória no topo
  tirosInimigos.push({ x: x, y: 0 });

  // Reproduz som do tiro inimigo
  if (somTiroInimigo.isPlaying()) {
    somTiroInimigo.stop();
  }
  somTiroInimigo.play();
}
