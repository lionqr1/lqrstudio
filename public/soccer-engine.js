const canvas = document.getElementById("soccer-canvas");
const ctx = canvas.getContext("2d");

const scoreLeftEl = document.getElementById("score-left");
const scoreRightEl = document.getElementById("score-right");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");

const keys = new Set();
const MATCH_SECONDS = 90;

const field = {
  width: canvas.width,
  height: canvas.height,
  goalWidth: 170,
  goalDepth: 30,
};

const state = {
  matchTimeLeft: MATCH_SECONDS,
  scoreLeft: 0,
  scoreRight: 0,
  gameOver: false,
  flashMessage: "Kickoff!",
  flashUntil: 0,
};

const createPlayer = (x, color, controls) => ({
  x,
  y: field.height / 2,
  radius: 24,
  color,
  vx: 0,
  vy: 0,
  speed: 0.7,
  maxSpeed: 5.8,
  kickPower: 10,
  controls,
  kickCooldown: 0,
});

const leftPlayer = createPlayer(210, "#34a0ff", {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
  kick: "KeyF",
});

const rightPlayer = createPlayer(field.width - 210, "#ff9c30", {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  kick: "Slash",
});

const ball = {
  x: field.width / 2,
  y: field.height / 2,
  radius: 12,
  vx: 0,
  vy: 0,
  drag: 0.992,
  restitution: 0.9,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const resetPositions = (direction = 1) => {
  leftPlayer.x = 210;
  leftPlayer.y = field.height / 2;
  leftPlayer.vx = 0;
  leftPlayer.vy = 0;

  rightPlayer.x = field.width - 210;
  rightPlayer.y = field.height / 2;
  rightPlayer.vx = 0;
  rightPlayer.vy = 0;

  ball.x = field.width / 2;
  ball.y = field.height / 2;
  ball.vx = 4 * direction;
  ball.vy = (Math.random() - 0.5) * 3;
};

const resetMatch = () => {
  state.matchTimeLeft = MATCH_SECONDS;
  state.scoreLeft = 0;
  state.scoreRight = 0;
  state.gameOver = false;
  state.flashMessage = "Kickoff!";
  state.flashUntil = performance.now() + 1400;
  resetPositions(Math.random() > 0.5 ? 1 : -1);
};

const applyControls = (player) => {
  const { controls } = player;

  if (keys.has(controls.up)) player.vy -= player.speed;
  if (keys.has(controls.down)) player.vy += player.speed;
  if (keys.has(controls.left)) player.vx -= player.speed;
  if (keys.has(controls.right)) player.vx += player.speed;

  player.vx = clamp(player.vx, -player.maxSpeed, player.maxSpeed);
  player.vy = clamp(player.vy, -player.maxSpeed, player.maxSpeed);

  player.x += player.vx;
  player.y += player.vy;

  player.vx *= 0.88;
  player.vy *= 0.88;

  player.x = clamp(player.x, player.radius, field.width - player.radius);
  player.y = clamp(player.y, player.radius, field.height - player.radius);

  if (player.kickCooldown > 0) {
    player.kickCooldown -= 1;
  } else if (keys.has(controls.kick)) {
    kickBall(player);
    player.kickCooldown = 16;
  }
};

const kickBall = (player) => {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const distance = Math.hypot(dx, dy);

  if (distance < player.radius + ball.radius + 14) {
    const nx = dx / (distance || 1);
    const ny = dy / (distance || 1);
    ball.vx += nx * player.kickPower;
    ball.vy += ny * player.kickPower;
  }
};

const resolvePlayerBallCollision = (player) => {
  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = player.radius + ball.radius;

  if (distance < minDistance && distance > 0) {
    const overlap = minDistance - distance;
    const nx = dx / distance;
    const ny = dy / distance;

    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const relVelX = ball.vx - player.vx;
    const relVelY = ball.vy - player.vy;
    const speed = relVelX * nx + relVelY * ny;

    if (speed < 0) {
      const impulse = -(1.2 + ball.restitution) * speed;
      ball.vx += impulse * nx;
      ball.vy += impulse * ny;
    }
  }
};

const updateBall = () => {
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= ball.drag;
  ball.vy *= ball.drag;

  const topGoalY = field.height / 2 - field.goalWidth / 2;
  const bottomGoalY = field.height / 2 + field.goalWidth / 2;
  const insideGoalMouth = ball.y > topGoalY && ball.y < bottomGoalY;

  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= field.height) {
    ball.vy *= -ball.restitution;
    ball.y = clamp(ball.y, ball.radius, field.height - ball.radius);
  }

  if (!insideGoalMouth) {
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= field.width) {
      ball.vx *= -ball.restitution;
      ball.x = clamp(ball.x, ball.radius, field.width - ball.radius);
    }
  }
};

const detectGoal = (now) => {
  const topGoalY = field.height / 2 - field.goalWidth / 2;
  const bottomGoalY = field.height / 2 + field.goalWidth / 2;

  const inVerticalRange = ball.y > topGoalY && ball.y < bottomGoalY;
  if (!inVerticalRange) return;

  if (ball.x < -field.goalDepth) {
    state.scoreRight += 1;
    state.flashMessage = "GOAL! Orange scores";
    state.flashUntil = now + 1600;
    resetPositions(-1);
  } else if (ball.x > field.width + field.goalDepth) {
    state.scoreLeft += 1;
    state.flashMessage = "GOAL! Blue scores";
    state.flashUntil = now + 1600;
    resetPositions(1);
  }
};

const drawField = () => {
  ctx.fillStyle = "#1f7a32";
  ctx.fillRect(0, 0, field.width, field.height);

  ctx.strokeStyle = "#d8f9ff";
  ctx.lineWidth = 4;

  ctx.strokeRect(8, 8, field.width - 16, field.height - 16);

  ctx.beginPath();
  ctx.moveTo(field.width / 2, 8);
  ctx.lineTo(field.width / 2, field.height - 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(field.width / 2, field.height / 2, 80, 0, Math.PI * 2);
  ctx.stroke();

  const goalY = field.height / 2 - field.goalWidth / 2;
  ctx.fillStyle = "#1f3f6f";
  ctx.fillRect(-field.goalDepth, goalY, field.goalDepth, field.goalWidth);
  ctx.fillRect(field.width, goalY, field.goalDepth, field.goalWidth);
};

const drawDisc = (entity) => {
  const gradient = ctx.createRadialGradient(
    entity.x - 8,
    entity.y - 8,
    4,
    entity.x,
    entity.y,
    entity.radius
  );
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, entity.color);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
  ctx.fill();
};

const drawBall = () => {
  ctx.fillStyle = "#f7f7f7";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#242424";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius - 2, 0, Math.PI * 2);
  ctx.stroke();
};

const drawOverlay = (now) => {
  if (now < state.flashUntil) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.fillRect(0, 0, field.width, field.height);

    ctx.fillStyle = "#fff";
    ctx.font = "700 44px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(state.flashMessage, field.width / 2, field.height / 2);
  }

  if (state.gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, field.width, field.height);

    let winner = "Draw";
    if (state.scoreLeft > state.scoreRight) winner = "Blue Wins";
    if (state.scoreRight > state.scoreLeft) winner = "Orange Wins";

    ctx.fillStyle = "#fff";
    ctx.font = "700 56px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Full Time", field.width / 2, field.height / 2 - 35);
    ctx.font = "600 44px Inter, sans-serif";
    ctx.fillText(winner, field.width / 2, field.height / 2 + 30);
  }
};

let previousTimestamp = performance.now();

const tick = (now) => {
  const deltaSeconds = (now - previousTimestamp) / 1000;
  previousTimestamp = now;

  if (!state.gameOver) {
    state.matchTimeLeft = Math.max(0, state.matchTimeLeft - deltaSeconds);
    if (state.matchTimeLeft === 0) {
      state.gameOver = true;
      state.flashUntil = 0;
    }

    applyControls(leftPlayer);
    applyControls(rightPlayer);
    resolvePlayerBallCollision(leftPlayer);
    resolvePlayerBallCollision(rightPlayer);
    updateBall();
    detectGoal(now);
  }

  drawField();
  drawDisc(leftPlayer);
  drawDisc(rightPlayer);
  drawBall();
  drawOverlay(now);

  scoreLeftEl.textContent = String(state.scoreLeft);
  scoreRightEl.textContent = String(state.scoreRight);
  timerEl.textContent = String(Math.ceil(state.matchTimeLeft));

  requestAnimationFrame(tick);
};

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Slash", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
});

document.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

restartBtn.addEventListener("click", () => {
  resetMatch();
});

resetMatch();
requestAnimationFrame(tick);
