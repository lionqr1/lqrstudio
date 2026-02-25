import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const PITCH_CONFIG = {
  positionX: 0, positionY: 0, positionZ: 0, rotationY: 0, scale: 1, length: 105, width: 68,
  goalWidth: 7.32, goalHeight: 2.44, goalDepth: 2,
  grassColor1: '#2d7a2d', grassColor2: '#3d8a3d', lineColor: '#ffffff',
  get halfLength() { return this.length / 2; }, get halfWidth() { return this.width / 2; },
  get penaltyAreaLength() { return 16.5; }, get penaltyAreaWidth() { return 40.3; },
  get goalAreaLength() { return 5.5; }, get goalAreaWidth() { return 18.32; },
  get centerCircleRadius() { return 9.15; }, get penaltySpotDistance() { return 11; }, get penaltyArcRadius() { return 9.15; },
};

const PLAYER_CONFIG = {
  useCustomModel: false, customModelPath: '/player.glb', customModelScale: 1, customModelRotationY: 0,
  height: 1.8, radius: 0.35, walkSpeed: 5, runSpeed: 9, sprintSpeed: 13,
  controlRadius: 1.5, kickPower: 26, passAccuracy: 0.9, shotAccuracy: 0.8,
};

const STADIUM_CONFIG = {
  useCustomStadium: false, customStadiumPath: '/stadium.glb', positionX: 0, positionY: 0, positionZ: 0, rotationY: 0, scale: 1,
  hideGeneratedPitch: false, ambientIntensity: 0.45, directionalIntensity: 1,
  floodlights: [
    { x: -60, y: 40, z: -45, intensity: 0.35 }, { x: 60, y: 40, z: -45, intensity: 0.35 },
    { x: -60, y: 40, z: 45, intensity: 0.35 }, { x: 60, y: 40, z: 45, intensity: 0.35 },
  ],
};

const GAME_CONFIG = {
  matchDuration: 6 * 60, halfDuration: 3 * 60, ballRadius: 0.22,
  ballFriction: 0.985, ballBounce: 0.6, gravity: 20,
  cameraHeight: 26, cameraDistance: 34, cameraSmoothness: 0.07,
};

const TEAMS = {
  homeTeam: {
    name: 'FC Barcelona', shortName: 'BAR', primaryColor: '#a50044', secondaryColor: '#004d98', goalkeeperColor: '#ffff00',
    formation: { GK: { x: 0, z: -50 }, LB: { x: -25, z: -35 }, CB1: { x: -8, z: -38 }, CB2: { x: 8, z: -38 }, RB: { x: 25, z: -35 }, CM1: { x: -15, z: -15 }, CM2: { x: 0, z: -20 }, CM3: { x: 15, z: -15 }, LW: { x: -30, z: 10 }, ST: { x: 0, z: 20 }, RW: { x: 30, z: 10 } },
  },
  awayTeam: {
    name: 'Real Madrid', shortName: 'RMA', primaryColor: '#ffffff', secondaryColor: '#d6d6d6', goalkeeperColor: '#00ff00',
    formation: { GK: { x: 0, z: 50 }, LB: { x: 25, z: 35 }, CB1: { x: 8, z: 38 }, CB2: { x: -8, z: 38 }, RB: { x: -25, z: 35 }, CM1: { x: 15, z: 15 }, CM2: { x: 0, z: 20 }, CM3: { x: -15, z: 15 }, LW: { x: 30, z: -10 }, ST: { x: 0, z: -20 }, RW: { x: -30, z: -10 } },
  },
};

const GAME_STATE = { LOADING: 'loading', MENU: 'menu', PLAYING: 'playing', GOAL_SCORED: 'goal', HALFTIME: 'halftime', FULLTIME: 'fulltime', PAUSED: 'paused' };

const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 350);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const loader = new GLTFLoader();
const clock = new THREE.Clock();
const keys = {};
const tmpVec = new THREE.Vector3();
let gameState = GAME_STATE.LOADING;
let isFirstHalf = true;
let matchTime = 0;
let homeScore = 0;
let awayScore = 0;
let homePlayers = [];
let awayPlayers = [];
let controlledPlayer;
let gameBall;
let ballShadow;
let controlledTeam = 'home';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function setState(state) {
  gameState = state;
  document.getElementById('main-menu').classList.toggle('visible', state === GAME_STATE.MENU);
  document.getElementById('hud').classList.toggle('visible', [GAME_STATE.PLAYING, GAME_STATE.PAUSED, GAME_STATE.GOAL_SCORED].includes(state));
  document.getElementById('pause-menu').classList.toggle('visible', state === GAME_STATE.PAUSED);
}

function updateLoadingProgress(percent) {
  document.getElementById('progress-fill').style.width = `${percent}%`;
}

function setupLighting() {
  scene.add(new THREE.AmbientLight(0xffffff, STADIUM_CONFIG.ambientIntensity));
  const sun = new THREE.DirectionalLight(0xffffff, STADIUM_CONFIG.directionalIntensity);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -120; sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120; sun.shadow.camera.bottom = -120;
  scene.add(sun);
  STADIUM_CONFIG.floodlights.forEach((l) => {
    const p = new THREE.PointLight(0xffffee, l.intensity, 220);
    p.position.set(l.x, l.y, l.z);
    scene.add(p);
  });
}

async function loadCustomStadium() {
  if (!STADIUM_CONFIG.useCustomStadium) return null;
  return new Promise((resolve) => {
    loader.load(STADIUM_CONFIG.customStadiumPath, (gltf) => {
      const stadium = gltf.scene;
      stadium.scale.setScalar(STADIUM_CONFIG.scale);
      stadium.position.set(STADIUM_CONFIG.positionX, STADIUM_CONFIG.positionY, STADIUM_CONFIG.positionZ);
      stadium.rotation.y = THREE.MathUtils.degToRad(STADIUM_CONFIG.rotationY);
      stadium.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
      scene.add(stadium);
      resolve(stadium);
    }, undefined, () => resolve(null));
  });
}

function createPitchTexture() {
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1400; const ctx = cv.getContext('2d');
  const sx = cv.width / PITCH_CONFIG.length; const sz = cv.height / PITCH_CONFIG.width;
  const stripeWidth = 5 * sx;
  for (let x = 0; x < cv.width; x += stripeWidth * 2) {
    ctx.fillStyle = PITCH_CONFIG.grassColor1; ctx.fillRect(x, 0, stripeWidth, cv.height);
    ctx.fillStyle = PITCH_CONFIG.grassColor2; ctx.fillRect(x + stripeWidth, 0, stripeWidth, cv.height);
  }
  ctx.strokeStyle = PITCH_CONFIG.lineColor; ctx.fillStyle = PITCH_CONFIG.lineColor; ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, cv.width - 20, cv.height - 20);
  ctx.beginPath(); ctx.moveTo(cv.width / 2, 10); ctx.lineTo(cv.width / 2, cv.height - 10); ctx.stroke();
  ctx.beginPath(); ctx.arc(cv.width / 2, cv.height / 2, PITCH_CONFIG.centerCircleRadius * sx, 0, Math.PI * 2); ctx.stroke();
  const paLen = PITCH_CONFIG.penaltyAreaLength * sx; const paW = PITCH_CONFIG.penaltyAreaWidth * sz; const paTop = (cv.height - paW) / 2;
  ctx.strokeRect(10, paTop, paLen, paW); ctx.strokeRect(cv.width - 10 - paLen, paTop, paLen, paW);
  return new THREE.CanvasTexture(cv);
}

function createPitch() {
  if (STADIUM_CONFIG.useCustomStadium && STADIUM_CONFIG.hideGeneratedPitch) return;
  const geo = new THREE.PlaneGeometry(PITCH_CONFIG.length * PITCH_CONFIG.scale, PITCH_CONFIG.width * PITCH_CONFIG.scale);
  const mat = new THREE.MeshStandardMaterial({ map: createPitchTexture(), roughness: 0.85, metalness: 0.08 });
  const pitch = new THREE.Mesh(geo, mat);
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.set(PITCH_CONFIG.positionX, PITCH_CONFIG.positionY, PITCH_CONFIG.positionZ);
  pitch.receiveShadow = true;
  scene.add(pitch);
}

function createGoal(side) {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
  const netMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
  const w = PITCH_CONFIG.goalWidth; const h = PITCH_CONFIG.goalHeight; const d = PITCH_CONFIG.goalDepth; const r = 0.06;
  const mkPost = () => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), postMat);
  const lp = mkPost(); lp.position.set(-w / 2, h / 2, 0); group.add(lp);
  const rp = mkPost(); rp.position.set(w / 2, h / 2, 0); group.add(rp);
  const cb = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 12), postMat); cb.rotation.z = Math.PI / 2; cb.position.set(0, h, 0); group.add(cb);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), netMat); back.position.set(0, h / 2, -d * side); group.add(back);
  const zPos = side * PITCH_CONFIG.halfLength;
  group.position.set(PITCH_CONFIG.positionX, PITCH_CONFIG.positionY, PITCH_CONFIG.positionZ + zPos);
  if (side > 0) group.rotation.y = Math.PI;
  scene.add(group);
}

function createBall() {
  const g = new THREE.SphereGeometry(GAME_CONFIG.ballRadius, 24, 24);
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 });
  const ball = new THREE.Mesh(g, m);
  ball.castShadow = true;
  ball.position.set(0, GAME_CONFIG.ballRadius, 0);
  ball.userData = { velocity: new THREE.Vector3(), lastTouchedBy: null };
  scene.add(ball);
  return ball;
}

function createBallShadow() {
  const s = new THREE.Mesh(new THREE.CircleGeometry(0.25, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }));
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.01;
  return s;
}

function createGeneratedPlayer(team, position, positionName, isGoalkeeper = false) {
  const group = new THREE.Group();
  const jersey = new THREE.MeshStandardMaterial({ color: isGoalkeeper ? team.goalkeeperColor : team.primaryColor, roughness: 0.7 });
  const shorts = new THREE.MeshStandardMaterial({ color: team.secondaryColor, roughness: 0.8 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.72, 8), jersey); body.position.y = 0.9; body.castShadow = true;
  const short = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.3, 8), shorts); short.position.y = 0.53; short.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), skin); head.position.y = 1.35; head.castShadow = true;
  const legGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.65, 8);
  const ll = new THREE.Mesh(legGeo, skin); ll.position.set(-0.1, 0.2, 0); ll.castShadow = true;
  const rl = ll.clone(); rl.position.x = 0.1;
  group.add(body, short, head, ll, rl);
  group.position.set(position.x, 0, position.z);
  group.userData = { positionName, team, isGoalkeeper, homePosition: { ...position }, hasBall: false, isControlled: false, stamina: 100, speed: isGoalkeeper ? 7 : PLAYER_CONFIG.runSpeed, animationPhase: Math.random() * Math.PI };
  scene.add(group);
  return group;
}

function createPlayers() {
  homePlayers.forEach((p) => scene.remove(p)); awayPlayers.forEach((p) => scene.remove(p));
  homePlayers = []; awayPlayers = [];
  for (const [name, pos] of Object.entries(TEAMS.homeTeam.formation)) homePlayers.push(createGeneratedPlayer(TEAMS.homeTeam, pos, name, name === 'GK'));
  for (const [name, pos] of Object.entries(TEAMS.awayTeam.formation)) {
    const p = createGeneratedPlayer(TEAMS.awayTeam, pos, name, name === 'GK');
    p.rotation.y = Math.PI; awayPlayers.push(p);
  }
  switchToPlayer(homePlayers.find((p) => p.userData.positionName === 'CM2') || homePlayers[0]);
}

function switchToPlayer(player) {
  if (controlledPlayer) controlledPlayer.userData.isControlled = false;
  controlledPlayer = player;
  if (player) {
    player.userData.isControlled = true;
    document.getElementById('player-indicator').textContent = `Controlled: ${player.userData.positionName}`;
  }
}

function switchPlayer() {
  const candidates = homePlayers.filter((p) => !p.userData.isGoalkeeper && p !== controlledPlayer);
  if (!candidates.length) return;
  candidates.sort((a, b) => a.position.distanceTo(gameBall.position) - b.position.distanceTo(gameBall.position));
  switchToPlayer(candidates[0]);
}

function getCurrentBallHolder() { return [...homePlayers, ...awayPlayers].find((p) => p.userData.hasBall); }
function playerHasBall() { return controlledPlayer?.userData.hasBall; }

function moveToward(player, target, dt, factor = 0.72) {
  tmpVec.subVectors(target, player.position);
  const d = tmpVec.length(); if (d < 0.3) return;
  tmpVec.normalize().multiplyScalar(player.userData.speed * factor * dt);
  player.position.add(tmpVec);
  player.rotation.y = Math.atan2(tmpVec.x, tmpVec.z);
  player.userData.animationPhase += dt * player.userData.speed;
  player.position.y = Math.abs(Math.sin(player.userData.animationPhase * 3)) * 0.04;
}

function clampToPitchBounds(player) {
  player.position.x = clamp(player.position.x, -PITCH_CONFIG.halfWidth + 1, PITCH_CONFIG.halfWidth - 1);
  player.position.z = clamp(player.position.z, -PITCH_CONFIG.halfLength + 1, PITCH_CONFIG.halfLength - 1);
}

function updatePlayerMovement(dt) {
  if (!controlledPlayer || gameState !== GAME_STATE.PLAYING) return;
  const v = new THREE.Vector3();
  if (keys.KeyW) v.z -= 1; if (keys.KeyS) v.z += 1; if (keys.KeyA) v.x -= 1; if (keys.KeyD) v.x += 1;
  let speed = PLAYER_CONFIG.runSpeed;
  if (keys.ShiftLeft || keys.ShiftRight) {
    speed = controlledPlayer.userData.stamina > 0 ? PLAYER_CONFIG.sprintSpeed : PLAYER_CONFIG.runSpeed;
    controlledPlayer.userData.stamina = Math.max(0, controlledPlayer.userData.stamina - 24 * dt);
  } else controlledPlayer.userData.stamina = Math.min(100, controlledPlayer.userData.stamina + 14 * dt);
  if (v.lengthSq() > 0) {
    v.normalize().multiplyScalar(speed * dt);
    controlledPlayer.position.add(v);
    controlledPlayer.rotation.y = Math.atan2(v.x, v.z);
    controlledPlayer.userData.animationPhase += dt * speed;
    controlledPlayer.position.y = Math.abs(Math.sin(controlledPlayer.userData.animationPhase * 3)) * 0.05;
  }
  clampToPitchBounds(controlledPlayer);
  if (controlledPlayer.userData.hasBall) {
    const offset = new THREE.Vector3(0, GAME_CONFIG.ballRadius, -0.55).applyQuaternion(controlledPlayer.quaternion);
    gameBall.position.set(controlledPlayer.position.x + offset.x, offset.y, controlledPlayer.position.z + offset.z);
    gameBall.userData.velocity.set(0, 0, 0);
  }
  document.getElementById('stamina-fill').style.width = `${controlledPlayer.userData.stamina}%`;
}

function executePass(passer, target, lift = 1) {
  passer.userData.hasBall = false;
  const dir = target.clone().sub(gameBall.position);
  const dist = dir.length(); dir.normalize();
  const spread = (1 - PLAYER_CONFIG.passAccuracy) * 0.45;
  dir.x += (Math.random() - 0.5) * spread; dir.z += (Math.random() - 0.5) * spread;
  gameBall.userData.velocity.copy(dir.normalize().multiplyScalar(Math.min(PLAYER_CONFIG.kickPower * 0.7, dist * 1.4)));
  gameBall.userData.velocity.y = lift;
}

function pass() {
  if (!playerHasBall()) return;
  const passer = controlledPlayer;
  const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(passer.quaternion);
  let best; let bestScore = -Infinity;
  homePlayers.filter((p) => p !== passer && !p.userData.isGoalkeeper).forEach((mate) => {
    const to = mate.position.clone().sub(passer.position);
    const d = to.length(); const score = facing.dot(to.normalize()) * 100 - d;
    if (d < 40 && score > bestScore) { best = mate; bestScore = score; }
  });
  if (best) executePass(passer, best.position, 1.1);
}

function throughBall() {
  if (!playerHasBall()) return;
  const target = homePlayers.filter((p) => ['ST', 'LW', 'RW'].includes(p.userData.positionName)).sort((a, b) => a.position.z - b.position.z)[0];
  if (!target) return;
  controlledPlayer.userData.hasBall = false;
  const lead = target.position.clone(); lead.z -= 8;
  executePass(controlledPlayer, lead, 2);
}

function shoot(shooter = controlledPlayer) {
  if (!shooter?.userData.hasBall) return;
  shooter.userData.hasBall = false;
  const towardPositive = shooter.userData.team === TEAMS.homeTeam;
  const goalZ = towardPositive ? PITCH_CONFIG.halfLength : -PITCH_CONFIG.halfLength;
  const target = new THREE.Vector3((Math.random() - 0.5) * PITCH_CONFIG.goalWidth * 0.85, Math.random() * PITCH_CONFIG.goalHeight * 0.7 + 0.5, goalZ);
  const dir = target.sub(gameBall.position).normalize();
  dir.x += (Math.random() - 0.5) * (1 - PLAYER_CONFIG.shotAccuracy) * 0.6;
  gameBall.userData.velocity.copy(dir.normalize().multiplyScalar(PLAYER_CONFIG.kickPower));
  gameBall.userData.velocity.y += 4;
}

function tackle() {
  if (playerHasBall()) return;
  const holder = getCurrentBallHolder(); if (!holder) return;
  if (controlledPlayer.position.distanceTo(holder.position) < 2) {
    if (Math.random() < 0.6) {
      holder.userData.hasBall = false; controlledPlayer.userData.hasBall = true; gameBall.userData.lastTouchedBy = controlledPlayer;
    } else {
      holder.userData.hasBall = false; gameBall.userData.velocity.set((Math.random() - 0.5) * 10, 2, (Math.random() - 0.5) * 10);
    }
  }
}

function checkBallControl() {
  if (gameBall.userData.velocity.length() > 7) return;
  const all = [...homePlayers, ...awayPlayers];
  let nearest; let best = PLAYER_CONFIG.controlRadius;
  all.forEach((p) => {
    const d = p.position.distanceTo(gameBall.position);
    if (d < best) { nearest = p; best = d; }
  });
  if (nearest) {
    all.forEach((p) => { p.userData.hasBall = false; });
    nearest.userData.hasBall = true;
    gameBall.userData.lastTouchedBy = nearest;
    if (homePlayers.includes(nearest) && !nearest.userData.isGoalkeeper) switchToPlayer(nearest);
  }
}

function updateGoalkeeperAI(keeper, dt) {
  const goalZ = keeper.userData.team === TEAMS.homeTeam ? -PITCH_CONFIG.halfLength : PITCH_CONFIG.halfLength;
  const target = new THREE.Vector3(clamp(gameBall.position.x * 0.7, -3, 3), 0, goalZ + (keeper.userData.team === TEAMS.homeTeam ? 2 : -2));
  moveToward(keeper, target, dt, 0.8);
  keeper.lookAt(gameBall.position.x, keeper.position.y, gameBall.position.z);
  if (keeper.position.distanceTo(gameBall.position) < 2.4 && gameBall.userData.velocity.length() > 10) {
    if (Math.random() < 0.55) {
      [...homePlayers, ...awayPlayers].forEach((p) => { p.userData.hasBall = false; });
      keeper.userData.hasBall = true; gameBall.userData.velocity.set(0, 0, 0);
    }
  }
}

function updateOutfieldAI(player, dt, userTeam) {
  const holder = getCurrentBallHolder();
  const teamPlayers = userTeam ? homePlayers : awayPlayers;
  const teamHasBall = holder && teamPlayers.includes(holder);
  if (player.userData.hasBall && !userTeam) {
    if (Math.random() < 0.016) return shoot(player);
    if (Math.random() < 0.018) {
      const mate = awayPlayers.filter((p) => p !== player && !p.userData.isGoalkeeper).sort((a, b) => a.position.distanceTo(player.position) - b.position.distanceTo(player.position))[0];
      if (mate) executePass(player, mate.position, 1);
      return;
    }
  }
  const home = player.userData.homePosition;
  const target = new THREE.Vector3(home.x, 0, home.z);
  if (!teamHasBall) target.add(gameBall.position.clone().sub(player.position).multiplyScalar(0.25));
  else target.add(new THREE.Vector3(0, 0, userTeam ? -4 : 4));
  moveToward(player, target, dt);
}

function updateAI(dt) {
  awayPlayers.forEach((p) => p.userData.isGoalkeeper ? updateGoalkeeperAI(p, dt) : updateOutfieldAI(p, dt, false));
  homePlayers.forEach((p) => { if (p !== controlledPlayer) p.userData.isGoalkeeper ? updateGoalkeeperAI(p, dt) : updateOutfieldAI(p, dt, true); });
}

function updateBallPhysics(dt) {
  const vel = gameBall.userData.velocity;
  if (gameBall.position.y > GAME_CONFIG.ballRadius) vel.y -= GAME_CONFIG.gravity * dt;
  gameBall.position.addScaledVector(vel, dt);
  if (gameBall.position.y < GAME_CONFIG.ballRadius) {
    gameBall.position.y = GAME_CONFIG.ballRadius;
    vel.y = -vel.y * GAME_CONFIG.ballBounce;
    vel.x *= GAME_CONFIG.ballFriction; vel.z *= GAME_CONFIG.ballFriction;
  }
  vel.x *= 0.995; vel.z *= 0.995;
  gameBall.rotation.x += vel.z * dt * 3; gameBall.rotation.z -= vel.x * dt * 3;
  const halfW = PITCH_CONFIG.halfWidth; const halfL = PITCH_CONFIG.halfLength;
  if (Math.abs(gameBall.position.x) > halfW && Math.abs(gameBall.position.z) < halfL) {
    gameBall.position.x = clamp(gameBall.position.x, -halfW, halfW); vel.x *= -0.7;
  }
  if (Math.abs(gameBall.position.z) > halfL + 3) {
    const concedeTeam = gameBall.position.z > 0 ? 'away' : 'home';
    resetForKickoff(concedeTeam);
  }
  ballShadow.position.x = gameBall.position.x; ballShadow.position.z = gameBall.position.z;
  ballShadow.scale.setScalar(clamp(1 - (gameBall.position.y - GAME_CONFIG.ballRadius) * 0.2, 0.5, 1));
  checkGoal();
}

function checkGoal() {
  const inX = Math.abs(gameBall.position.x) <= PITCH_CONFIG.goalWidth / 2;
  const inY = gameBall.position.y < PITCH_CONFIG.goalHeight;
  if (!inX || !inY) return;
  if (gameBall.position.z < -PITCH_CONFIG.halfLength) return goalScored('away');
  if (gameBall.position.z > PITCH_CONFIG.halfLength) return goalScored('home');
}

function showGoalOverlay(team) {
  const overlay = document.getElementById('goal-overlay');
  overlay.classList.add('visible');
  document.getElementById('goal-scorer').textContent = `${team === 'home' ? TEAMS.homeTeam.name : TEAMS.awayTeam.name} scored!`;
}

function hideGoalOverlay() { document.getElementById('goal-overlay').classList.remove('visible'); }
function showHalftime() { document.getElementById('halftime-overlay').classList.add('visible'); }
function hideHalftime() { document.getElementById('halftime-overlay').classList.remove('visible'); }

function goalScored(team) {
  if (gameState !== GAME_STATE.PLAYING) return;
  gameState = GAME_STATE.GOAL_SCORED;
  if (team === 'home') homeScore += 1; else awayScore += 1;
  updateScoreboard();
  showGoalOverlay(team);
  setTimeout(() => { hideGoalOverlay(); resetForKickoff(team === 'home' ? 'away' : 'home'); gameState = GAME_STATE.PLAYING; }, 1800);
}

function resetForKickoff(possession = 'home') {
  gameBall.position.set(0, GAME_CONFIG.ballRadius, 0);
  gameBall.userData.velocity.set(0, 0, 0);
  [...homePlayers, ...awayPlayers].forEach((p) => {
    p.userData.hasBall = false;
    p.position.set(p.userData.homePosition.x, 0, p.userData.homePosition.z);
  });
  const kickoffPlayer = (possession === 'home' ? homePlayers : awayPlayers).find((p) => p.userData.positionName === 'ST');
  kickoffPlayer.userData.hasBall = true;
  if (possession === 'home') switchToPlayer(kickoffPlayer);
}

function updateMatchTime(dt) {
  if (gameState !== GAME_STATE.PLAYING) return;
  matchTime += dt;
  if (isFirstHalf && matchTime >= GAME_CONFIG.halfDuration) {
    isFirstHalf = false; gameState = GAME_STATE.HALFTIME; showHalftime();
    setTimeout(() => { hideHalftime(); resetForKickoff('away'); gameState = GAME_STATE.PLAYING; }, 2000);
  }
  if (matchTime >= GAME_CONFIG.matchDuration) {
    gameState = GAME_STATE.FULLTIME;
    const msg = homeScore === awayScore ? 'FULL TIME - DRAW' : `FULL TIME - ${homeScore > awayScore ? TEAMS.homeTeam.shortName : TEAMS.awayTeam.shortName} WIN`;
    document.getElementById('fulltime-text').textContent = msg;
    document.getElementById('fulltime-overlay').classList.add('visible');
  }
  const t = Math.floor(matchTime);
  document.getElementById('match-time').textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  document.getElementById('half-indicator').textContent = isFirstHalf ? '1ST HALF' : '2ND HALF';
}

function updateScoreboard() {
  document.getElementById('home-name').textContent = TEAMS.homeTeam.shortName;
  document.getElementById('away-name').textContent = TEAMS.awayTeam.shortName;
  document.getElementById('home-score').textContent = String(homeScore);
  document.getElementById('away-score').textContent = String(awayScore);
  document.documentElement.style.setProperty('--home-color', TEAMS.homeTeam.primaryColor);
  document.documentElement.style.setProperty('--away-color', TEAMS.awayTeam.primaryColor);
}

function updateRadar() {
  const radarCanvas = document.getElementById('radar-canvas');
  const ctx = radarCanvas.getContext('2d');
  radarCanvas.width = 200; radarCanvas.height = 130;
  const sx = radarCanvas.width / PITCH_CONFIG.length; const sz = radarCanvas.height / PITCH_CONFIG.width;
  ctx.fillStyle = '#1a4d1a'; ctx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(5, 5, 190, 120);
  ctx.beginPath(); ctx.moveTo(100, 5); ctx.lineTo(100, 125); ctx.stroke();
  const toRadar = (p) => ({ x: 100 + p.x * sx, y: 65 + p.z * sz });
  ctx.fillStyle = '#2563eb'; homePlayers.forEach((p) => { const rp = toRadar(p.position); ctx.beginPath(); ctx.arc(rp.x, rp.y, p.userData.isControlled ? 4 : 3, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#ef4444'; awayPlayers.forEach((p) => { const rp = toRadar(p.position); ctx.beginPath(); ctx.arc(rp.x, rp.y, 3, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = '#fff'; const bp = toRadar(gameBall.position); ctx.beginPath(); ctx.arc(bp.x, bp.y, 3, 0, Math.PI * 2); ctx.fill();
}

function updateCamera() {
  const idealTarget = gameBall.position.clone();
  const idealPos = new THREE.Vector3(gameBall.position.x * 0.35, GAME_CONFIG.cameraHeight, gameBall.position.z + GAME_CONFIG.cameraDistance);
  camera.position.lerp(idealPos, GAME_CONFIG.cameraSmoothness);
  camera.lookAt(camera.getWorldDirection(new THREE.Vector3()).lerp(idealTarget, GAME_CONFIG.cameraSmoothness));
  camera.lookAt(idealTarget);
}

function setupInput() {
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Escape') {
      if (gameState === GAME_STATE.PLAYING) setState(GAME_STATE.PAUSED);
      else if (gameState === GAME_STATE.PAUSED) setState(GAME_STATE.PLAYING);
    }
    if (gameState !== GAME_STATE.PLAYING) return;
    if (e.code === 'Space') playerHasBall() ? pass() : switchPlayer();
    if (e.code === 'KeyE') playerHasBall() ? shoot() : tackle();
    if (e.code === 'KeyQ' && playerHasBall()) throughBall();
  });
  document.addEventListener('keyup', (e) => { keys[e.code] = false; });
}

function setupUI() {
  document.getElementById('quick-match-btn').onclick = () => { setState(GAME_STATE.PLAYING); resetForKickoff('home'); };
  document.getElementById('exhibition-btn').onclick = () => { setState(GAME_STATE.PLAYING); resetForKickoff('home'); };
  document.getElementById('settings-btn').onclick = () => alert('Settings placeholder: tweak constants in src/main.js');
  document.getElementById('resume-btn').onclick = () => setState(GAME_STATE.PLAYING);
  document.getElementById('restart-btn').onclick = () => restartMatch();
  document.getElementById('quit-btn').onclick = () => { restartMatch(); setState(GAME_STATE.MENU); };
  document.getElementById('play-again-btn').onclick = () => { document.getElementById('fulltime-overlay').classList.remove('visible'); restartMatch(); setState(GAME_STATE.PLAYING); };
}

function restartMatch() {
  homeScore = 0; awayScore = 0; matchTime = 0; isFirstHalf = true;
  updateScoreboard();
  resetForKickoff('home');
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  if (gameState === GAME_STATE.PLAYING) {
    updatePlayerMovement(dt);
    updateBallPhysics(dt);
    checkBallControl();
    updateAI(dt);
    updateMatchTime(dt);
    updateCamera();
    updateRadar();
  }
  renderer.render(scene, camera);
}

async function initGame() {
  setupLighting();
  updateLoadingProgress(20);
  await loadCustomStadium();
  createPitch(); createGoal(-1); createGoal(1);
  updateLoadingProgress(55);
  gameBall = createBall(); ballShadow = createBallShadow(); scene.add(ballShadow);
  createPlayers(); updateScoreboard();
  updateLoadingProgress(85);
  setupInput(); setupUI();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
  });
  updateLoadingProgress(100);
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
    setState(GAME_STATE.MENU);
  }, 400);
  animate();
}

document.addEventListener('DOMContentLoaded', initGame);
