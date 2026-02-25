import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =============================================================================
// PITCH CONFIGURATION
// =============================================================================
const PITCH_CONFIG = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationY: 0,
  scale: 1,
  length: 105,
  width: 68,
  goalWidth: 7.32,
  goalHeight: 2.44,
  goalDepth: 2,
  grassColor1: '#2d7a2d',
  grassColor2: '#3d8a3d',
  lineColor: '#ffffff',
  get halfLength() { return this.length / 2; },
  get halfWidth() { return this.width / 2; },
  get penaltyAreaLength() { return 16.5; },
  get penaltyAreaWidth() { return 40.3; },
  get goalAreaLength() { return 5.5; },
  get goalAreaWidth() { return 18.32; },
  get centerCircleRadius() { return 9.15; },
  get penaltySpotDistance() { return 11; },
  get penaltyArcRadius() { return 9.15; },
};

// =============================================================================
// PLAYER CONFIGURATION
// =============================================================================
const PLAYER_CONFIG = {
  useCustomModel: false,
  customModelPath: '/player.glb',
  customModelScale: 1,
  customModelRotationY: 0,
  height: 1.8,
  radius: 0.3,
  walkSpeed: 5,
  runSpeed: 10,
  sprintSpeed: 14,
  controlRadius: 1.5,
  kickPower: 25,
  passAccuracy: 0.9,
  shotAccuracy: 0.8,
  aiReactionTime: 0.2,
  aiAggressiveness: 0.7,
};

// =============================================================================
// STADIUM CONFIGURATION
// =============================================================================
const STADIUM_CONFIG = {
  useCustomStadium: false,
  customStadiumPath: '/stadium.glb',
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationY: 0,
  scale: 1,
  hideGeneratedPitch: false,
  ambientIntensity: 0.4,
  directionalIntensity: 1,
  floodlights: [
    { x: -60, y: 40, z: -45, intensity: 0.45 },
    { x: 60, y: 40, z: -45, intensity: 0.45 },
    { x: -60, y: 40, z: 45, intensity: 0.45 },
    { x: 60, y: 40, z: 45, intensity: 0.45 },
  ],
};

// =============================================================================
// GAME SETTINGS
// =============================================================================
const GAME_CONFIG = {
  matchDuration: 6 * 60,
  halfDuration: 3 * 60,
  ballRadius: 0.22,
  ballMass: 0.45,
  ballFriction: 0.98,
  ballBounce: 0.6,
  gravity: 20,
  cameraHeight: 25,
  cameraDistance: 35,
  cameraAngle: 45,
  cameraSmoothness: 0.05,
  difficulty: 'normal',
  maxShotCharge: 1.4,
};

// =============================================================================
// TEAM DATA
// =============================================================================
const FORM_433_HOME = {
  GK: { x: 0, z: -50 },
  LB: { x: -25, z: -35 },
  CB1: { x: -8, z: -38 },
  CB2: { x: 8, z: -38 },
  RB: { x: 25, z: -35 },
  CM1: { x: -15, z: -15 },
  CM2: { x: 0, z: -20 },
  CM3: { x: 15, z: -15 },
  LW: { x: -30, z: 10 },
  ST: { x: 0, z: 20 },
  RW: { x: 30, z: 10 },
};
const FORM_433_AWAY = {
  GK: { x: 0, z: 50 },
  LB: { x: 25, z: 35 },
  CB1: { x: 8, z: 38 },
  CB2: { x: -8, z: 38 },
  RB: { x: -25, z: 35 },
  CM1: { x: 15, z: 15 },
  CM2: { x: 0, z: 20 },
  CM3: { x: -15, z: 15 },
  LW: { x: 30, z: -10 },
  ST: { x: 0, z: -20 },
  RW: { x: -30, z: -10 },
};

const ALL_TEAMS = {
  barcelona: { name: 'FC Barcelona', shortName: 'BAR', primaryColor: '#a50044', secondaryColor: '#004d98', goalkeeperColor: '#ffff00' },
  madrid: { name: 'Real Madrid', shortName: 'RMA', primaryColor: '#ffffff', secondaryColor: '#d6d6d6', goalkeeperColor: '#00ff00' },
  liverpool: { name: 'Liverpool', shortName: 'LIV', primaryColor: '#c8102e', secondaryColor: '#eeeeee', goalkeeperColor: '#00d4ff' },
  bayern: { name: 'Bayern', shortName: 'BAY', primaryColor: '#dc052d', secondaryColor: '#ffffff', goalkeeperColor: '#76ff03' },
  juventus: { name: 'Juventus', shortName: 'JUV', primaryColor: '#111111', secondaryColor: '#f0f0f0', goalkeeperColor: '#ffcc00' },
  psg: { name: 'PSG', shortName: 'PSG', primaryColor: '#004170', secondaryColor: '#e30613', goalkeeperColor: '#f8ff00' },
};

const TEAMS = {
  homeTeam: { ...ALL_TEAMS.barcelona, formation: FORM_433_HOME },
  awayTeam: { ...ALL_TEAMS.madrid, formation: FORM_433_AWAY },
};

const GAME_STATE = {
  LOADING: 'loading',
  MENU: 'menu',
  TEAM_SELECT: 'team_select',
  KICKOFF: 'kickoff',
  PLAYING: 'playing',
  GOAL_SCORED: 'goal_scored',
  HALFTIME: 'halftime',
  FULLTIME: 'fulltime',
  PAUSED: 'paused',
  FREEKICK: 'freekick',
  CORNER: 'corner',
  GOALKICK: 'goalkick',
  THROWIN: 'throwin',
};

const ui = {
  loading: document.getElementById('loading-screen'),
  menu: document.getElementById('main-menu'),
  teamSelect: document.getElementById('team-select'),
  teamStep: document.getElementById('team-select-step'),
  teamGrid: document.getElementById('team-grid'),
  hud: document.getElementById('hud'),
  pause: document.getElementById('pause-menu'),
  progress: document.getElementById('progress-fill'),
  homeName: document.getElementById('home-name'),
  awayName: document.getElementById('away-name'),
  homeScore: document.getElementById('home-score'),
  awayScore: document.getElementById('away-score'),
  matchTime: document.getElementById('match-time'),
  half: document.getElementById('half-indicator'),
  stamina: document.getElementById('stamina-fill'),
  shot: document.getElementById('shot-fill'),
  announce: document.getElementById('announce'),
  indicator: document.getElementById('player-indicator'),
  goalOverlay: document.getElementById('goal-overlay'),
  goalScorer: document.getElementById('goal-scorer'),
  halftime: document.getElementById('halftime-overlay'),
  fulltime: document.getElementById('fulltime-overlay'),
  fulltimeText: document.getElementById('fulltime-text'),
  radar: document.getElementById('radar'),
};

const canvas = document.getElementById('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 500);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const loader = new GLTFLoader();
const clock = new THREE.Clock();
const keys = {};

let gameState = GAME_STATE.LOADING;
let homePlayers = [];
let awayPlayers = [];
let controlledPlayer = null;
let gameBall = null;
let ballShadow = null;
let selectionRing = null;
let homeScore = 0;
let awayScore = 0;
let matchTime = 0;
let isFirstHalf = true;
let shotCharge = 0;
let chargingShot = false;
let teamPickStep = 'home';
let basePlayerModel = null;

const tmpV = new THREE.Vector3();
const camPos = new THREE.Vector3();
const camTarget = new THREE.Vector3();

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function flashMessage(msg, ms = 1000) {
  ui.announce.textContent = msg;
  ui.announce.classList.add('visible');
  clearTimeout(flashMessage.tid);
  flashMessage.tid = setTimeout(() => ui.announce.classList.remove('visible'), ms);
}

function setState(next) {
  gameState = next;
  ui.menu.classList.toggle('visible', next === GAME_STATE.MENU);
  ui.teamSelect.classList.toggle('visible', next === GAME_STATE.TEAM_SELECT);
  ui.hud.classList.toggle('visible', [GAME_STATE.PLAYING, GAME_STATE.PAUSED, GAME_STATE.GOAL_SCORED].includes(next));
  ui.pause.classList.toggle('visible', next === GAME_STATE.PAUSED);
}

function updateLoadingProgress(value) {
  ui.progress.style.width = `${clamp(value, 0, 100)}%`;
}

function updateScoreboard() {
  ui.homeName.textContent = TEAMS.homeTeam.shortName;
  ui.awayName.textContent = TEAMS.awayTeam.shortName;
  ui.homeScore.textContent = String(homeScore);
  ui.awayScore.textContent = String(awayScore);
  document.documentElement.style.setProperty('--home-color', TEAMS.homeTeam.primaryColor);
  document.documentElement.style.setProperty('--away-color', TEAMS.awayTeam.primaryColor);
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, STADIUM_CONFIG.ambientIntensity);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffffff, STADIUM_CONFIG.directionalIntensity);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 400;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  scene.add(sunLight);

  STADIUM_CONFIG.floodlights.forEach((light) => {
    const floodlight = new THREE.PointLight(0xffffee, light.intensity, 220);
    floodlight.position.set(light.x, light.y, light.z);
    scene.add(floodlight);
  });
}

function createPitchTexture() {
  const pCanvas = document.createElement('canvas');
  const ctx = pCanvas.getContext('2d');
  pCanvas.width = 2048;
  pCanvas.height = 1400;

  const width = pCanvas.width;
  const height = pCanvas.height;
  const scaleX = width / PITCH_CONFIG.length;
  const scaleZ = height / PITCH_CONFIG.width;

  const stripeWidth = 5 * scaleX;
  for (let x = 0; x < width; x += stripeWidth * 2) {
    ctx.fillStyle = PITCH_CONFIG.grassColor1;
    ctx.fillRect(x, 0, stripeWidth, height);
    ctx.fillStyle = PITCH_CONFIG.grassColor2;
    ctx.fillRect(x + stripeWidth, 0, stripeWidth, height);
  }

  ctx.strokeStyle = PITCH_CONFIG.lineColor;
  ctx.lineWidth = 3;
  ctx.fillStyle = PITCH_CONFIG.lineColor;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.beginPath();
  ctx.moveTo(width / 2, 10);
  ctx.lineTo(width / 2, height - 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width / 2, height / 2, PITCH_CONFIG.centerCircleRadius * scaleX, 0, Math.PI * 2);
  ctx.stroke();

  const penaltyLength = PITCH_CONFIG.penaltyAreaLength * scaleX;
  const penaltyWidth = PITCH_CONFIG.penaltyAreaWidth * scaleZ;
  const penaltyTop = (height - penaltyWidth) / 2;
  ctx.strokeRect(10, penaltyTop, penaltyLength, penaltyWidth);
  ctx.strokeRect(width - 10 - penaltyLength, penaltyTop, penaltyLength, penaltyWidth);

  return new THREE.CanvasTexture(pCanvas);
}

function createPitch() {
  if (STADIUM_CONFIG.useCustomStadium && STADIUM_CONFIG.hideGeneratedPitch) return null;

  const texture = createPitchTexture();
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const geometry = new THREE.PlaneGeometry(PITCH_CONFIG.length * PITCH_CONFIG.scale, PITCH_CONFIG.width * PITCH_CONFIG.scale);
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.1 });

  const pitch = new THREE.Mesh(geometry, material);
  pitch.rotation.x = -Math.PI / 2;
  pitch.rotation.z = THREE.MathUtils.degToRad(PITCH_CONFIG.rotationY);
  pitch.position.set(PITCH_CONFIG.positionX, PITCH_CONFIG.positionY, PITCH_CONFIG.positionZ);
  pitch.receiveShadow = true;
  scene.add(pitch);
  return pitch;
}

function createGoal(side) {
  const group = new THREE.Group();
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
  const netMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });

  const goalWidth = PITCH_CONFIG.goalWidth * PITCH_CONFIG.scale;
  const goalHeight = PITCH_CONFIG.goalHeight * PITCH_CONFIG.scale;
  const goalDepth = PITCH_CONFIG.goalDepth * PITCH_CONFIG.scale;
  const postRadius = 0.06;

  const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 16), postMaterial);
  leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
  group.add(leftPost);

  const rightPost = leftPost.clone();
  rightPost.position.set(goalWidth / 2, goalHeight / 2, 0);
  group.add(rightPost);

  const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 16), postMaterial);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, goalHeight, 0);
  group.add(crossbar);

  const backNet = new THREE.Mesh(new THREE.PlaneGeometry(goalWidth, goalHeight), netMaterial);
  backNet.position.set(0, goalHeight / 2, -goalDepth * side);
  group.add(backNet);

  const zPos = PITCH_CONFIG.positionZ + side * (PITCH_CONFIG.halfLength * PITCH_CONFIG.scale);
  group.position.set(PITCH_CONFIG.positionX, PITCH_CONFIG.positionY, zPos);
  if (side === 1) group.rotation.y = Math.PI;

  scene.add(group);
  return group;
}

function createBall() {
  const bCanvas = document.createElement('canvas');
  bCanvas.width = 256;
  bCanvas.height = 256;
  const ctx = bCanvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#000';
  [[128, 64], [64, 128], [192, 128], [80, 200], [176, 200]].forEach(([cx, cy]) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = (i * 72 - 90) * Math.PI / 180;
      const x = cx + 25 * Math.cos(angle);
      const y = cy + 25 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });

  const geometry = new THREE.SphereGeometry(GAME_CONFIG.ballRadius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(bCanvas), roughness: 0.4, metalness: 0.1 });
  const ball = new THREE.Mesh(geometry, material);
  ball.castShadow = true;
  ball.position.set(0, GAME_CONFIG.ballRadius, 0);
  ball.userData = {
    velocity: new THREE.Vector3(0, 0, 0),
    angularVelocity: new THREE.Vector3(0, 0, 0),
    isInPlay: true,
    lastTouchedBy: null,
  };
  scene.add(ball);
  return ball;
}

function createBallShadow() {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  return shadow;
}

function createSelectionIndicator() {
  selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.55, 28),
    new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
  );
  selectionRing.rotation.x = -Math.PI / 2;
  scene.add(selectionRing);
}

async function loadCustomStadium() {
  if (!STADIUM_CONFIG.useCustomStadium) return null;
  return new Promise((resolve) => {
    loader.load(
      STADIUM_CONFIG.customStadiumPath,
      (gltf) => {
        const stadium = gltf.scene;
        stadium.scale.setScalar(STADIUM_CONFIG.scale);
        stadium.position.set(STADIUM_CONFIG.positionX, STADIUM_CONFIG.positionY, STADIUM_CONFIG.positionZ);
        stadium.rotation.y = THREE.MathUtils.degToRad(STADIUM_CONFIG.rotationY);
        stadium.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(stadium);
        resolve(stadium);
      },
      (progress) => {
        if (progress.total) {
          updateLoadingProgress((progress.loaded / progress.total) * 40);
        }
      },
      () => resolve(null),
    );
  });
}

async function loadCustomPlayerModel() {
  if (!PLAYER_CONFIG.useCustomModel) return null;
  return new Promise((resolve) => {
    loader.load(
      PLAYER_CONFIG.customModelPath,
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(PLAYER_CONFIG.customModelScale);
        model.rotation.y = THREE.MathUtils.degToRad(PLAYER_CONFIG.customModelRotationY);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve(model);
      },
      undefined,
      () => resolve(null),
    );
  });
}

function createGeneratedPlayer(team, position, positionName, isGoalkeeper = false) {
  const group = new THREE.Group();
  const jerseyColor = isGoalkeeper ? new THREE.Color(team.goalkeeperColor) : new THREE.Color(team.primaryColor);
  const shortsColor = new THREE.Color(team.secondaryColor);
  const height = PLAYER_CONFIG.height;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.2, height * 0.4, 8),
    new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.7 }),
  );
  body.position.y = height * 0.5;
  body.castShadow = true;
  group.add(body);

  const shorts = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, height * 0.15, 8),
    new THREE.MeshStandardMaterial({ color: shortsColor }),
  );
  shorts.position.y = height * 0.25;
  shorts.castShadow = true;
  group.add(shorts);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffdbac }),
  );
  head.position.y = height * 0.85;
  head.castShadow = true;
  group.add(head);

  const legGeometry = new THREE.CylinderGeometry(0.08, 0.06, height * 0.35, 8);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.1, height * 0.1, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.set(0.1, height * 0.1, 0);
  group.add(rightLeg);

  group.position.set(
    PITCH_CONFIG.positionX + position.x * PITCH_CONFIG.scale,
    PITCH_CONFIG.positionY,
    PITCH_CONFIG.positionZ + position.z * PITCH_CONFIG.scale,
  );

  group.userData = {
    positionName,
    team,
    isGoalkeeper,
    homePosition: { ...position },
    velocity: new THREE.Vector3(),
    stamina: 100,
    hasBall: false,
    isControlled: false,
    speed: isGoalkeeper ? PLAYER_CONFIG.runSpeed * 0.8 : PLAYER_CONFIG.runSpeed,
    animationPhase: 0,
  };

  scene.add(group);
  return group;
}

function createPlayerFromModel(baseModel, team, position, positionName, isGoalkeeper) {
  const player = baseModel.clone();
  player.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      const lowered = child.name.toLowerCase();
      if (lowered.includes('jersey') || lowered.includes('shirt')) {
        child.material.color.set(isGoalkeeper ? team.goalkeeperColor : team.primaryColor);
      }
      if (lowered.includes('shorts')) {
        child.material.color.set(team.secondaryColor);
      }
    }
  });

  player.position.set(
    PITCH_CONFIG.positionX + position.x * PITCH_CONFIG.scale,
    PITCH_CONFIG.positionY,
    PITCH_CONFIG.positionZ + position.z * PITCH_CONFIG.scale,
  );

  player.userData = {
    positionName,
    team,
    isGoalkeeper,
    homePosition: { ...position },
    velocity: new THREE.Vector3(),
    stamina: 100,
    hasBall: false,
    isControlled: false,
    speed: isGoalkeeper ? PLAYER_CONFIG.runSpeed * 0.8 : PLAYER_CONFIG.runSpeed,
    animationPhase: 0,
  };

  scene.add(player);
  return player;
}

async function setupTeams() {
  homePlayers.forEach((p) => scene.remove(p));
  awayPlayers.forEach((p) => scene.remove(p));
  homePlayers = [];
  awayPlayers = [];

  if (!basePlayerModel && PLAYER_CONFIG.useCustomModel) {
    basePlayerModel = await loadCustomPlayerModel();
  }

  for (const [name, pos] of Object.entries(TEAMS.homeTeam.formation)) {
    const isGK = name === 'GK';
    homePlayers.push(basePlayerModel
      ? createPlayerFromModel(basePlayerModel, TEAMS.homeTeam, pos, name, isGK)
      : createGeneratedPlayer(TEAMS.homeTeam, pos, name, isGK));
  }

  for (const [name, pos] of Object.entries(TEAMS.awayTeam.formation)) {
    const isGK = name === 'GK';
    const p = basePlayerModel
      ? createPlayerFromModel(basePlayerModel, TEAMS.awayTeam, pos, name, isGK)
      : createGeneratedPlayer(TEAMS.awayTeam, pos, name, isGK);
    p.rotation.y = Math.PI;
    awayPlayers.push(p);
  }

  switchToPlayer(homePlayers.find((p) => p.userData.positionName === 'CM2') || homePlayers[0]);
}

function getCurrentBallHolder() {
  return [...homePlayers, ...awayPlayers].find((p) => p.userData.hasBall);
}

function playerHasBall() {
  return controlledPlayer && controlledPlayer.userData.hasBall;
}

function switchToPlayer(player) {
  if (controlledPlayer) controlledPlayer.userData.isControlled = false;
  controlledPlayer = player;
  if (controlledPlayer) {
    controlledPlayer.userData.isControlled = true;
    ui.indicator.textContent = `Controlled: ${controlledPlayer.userData.positionName}`;
  }
}

function switchPlayer() {
  const candidates = homePlayers.filter((p) => !p.userData.isGoalkeeper && p !== controlledPlayer);
  if (!candidates.length) return;
  candidates.sort((a, b) => a.position.distanceTo(gameBall.position) - b.position.distanceTo(gameBall.position));
  switchToPlayer(candidates[0]);
}

function clampToPitchBounds(player) {
  player.position.x = clamp(player.position.x, -PITCH_CONFIG.halfWidth + 1, PITCH_CONFIG.halfWidth - 1);
  player.position.z = clamp(player.position.z, -PITCH_CONFIG.halfLength + 1, PITCH_CONFIG.halfLength - 1);
}

function updateSelectionIndicator() {
  if (!controlledPlayer) return;
  selectionRing.position.set(controlledPlayer.position.x, PITCH_CONFIG.positionY + 0.02, controlledPlayer.position.z);
}

function updatePlayerMovement(deltaTime) {
  if (!controlledPlayer || gameState !== GAME_STATE.PLAYING) return;
  const player = controlledPlayer;
  const velocity = new THREE.Vector3();

  if (keys.KeyW) velocity.z -= 1;
  if (keys.KeyS) velocity.z += 1;
  if (keys.KeyA) velocity.x -= 1;
  if (keys.KeyD) velocity.x += 1;

  if (velocity.length() > 0) {
    velocity.normalize();
    let speed = PLAYER_CONFIG.walkSpeed;

    if (keys.ShiftLeft || keys.ShiftRight) {
      if (player.userData.stamina > 0) {
        speed = PLAYER_CONFIG.sprintSpeed;
        player.userData.stamina -= 20 * deltaTime;
      } else {
        speed = PLAYER_CONFIG.runSpeed;
      }
    } else {
      speed = PLAYER_CONFIG.runSpeed;
      player.userData.stamina = Math.min(100, player.userData.stamina + 10 * deltaTime);
    }

    velocity.multiplyScalar(speed * deltaTime);
    player.position.add(velocity);

    player.rotation.y = Math.atan2(velocity.x, velocity.z);
    player.userData.animationPhase += deltaTime * speed;
    player.position.y = PITCH_CONFIG.positionY + Math.abs(Math.sin(player.userData.animationPhase * 3) * 0.05);

    clampToPitchBounds(player);

    if (player.userData.hasBall) {
      const ballOffset = new THREE.Vector3(0, 0, -0.5);
      ballOffset.applyQuaternion(player.quaternion);
      gameBall.position.x = player.position.x + ballOffset.x;
      gameBall.position.z = player.position.z + ballOffset.z;
      gameBall.position.y = GAME_CONFIG.ballRadius + PITCH_CONFIG.positionY;
      gameBall.userData.velocity.set(0, 0, 0);
    }
  }

  ui.stamina.style.width = `${clamp(player.userData.stamina, 0, 100)}%`;
}

function checkBallControl() {
  if (gameBall.userData.velocity.length() > 5) return;
  const allPlayers = [...homePlayers, ...awayPlayers];

  let nearestPlayer = null;
  let nearestDistance = PLAYER_CONFIG.controlRadius;

  allPlayers.forEach((player) => {
    const distance = player.position.distanceTo(gameBall.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlayer = player;
    }
  });

  if (nearestPlayer && nearestPlayer !== getCurrentBallHolder()) {
    allPlayers.forEach((p) => { p.userData.hasBall = false; });
    nearestPlayer.userData.hasBall = true;
    gameBall.userData.lastTouchedBy = nearestPlayer;

    if (homePlayers.includes(nearestPlayer) && !nearestPlayer.userData.isGoalkeeper) {
      switchToPlayer(nearestPlayer);
    }
  }
}

function executePass(passer, target) {
  passer.userData.hasBall = false;

  const direction = new THREE.Vector3().subVectors(target.position, gameBall.position);
  const distance = direction.length();
  direction.normalize();

  const power = Math.min(PLAYER_CONFIG.kickPower * 0.7, distance * 1.5);
  direction.x += (Math.random() - 0.5) * (1 - PLAYER_CONFIG.passAccuracy) * 0.5;
  direction.z += (Math.random() - 0.5) * (1 - PLAYER_CONFIG.passAccuracy) * 0.5;

  gameBall.userData.velocity.copy(direction.multiplyScalar(power));
  gameBall.userData.velocity.y = 1;
}

function pass() {
  if (!playerHasBall()) return;

  const passer = controlledPlayer;
  const teammates = homePlayers.filter((p) => p !== passer && !p.userData.isGoalkeeper);

  let bestTarget = null;
  let bestScore = -Infinity;

  const facingDir = new THREE.Vector3(0, 0, -1);
  facingDir.applyQuaternion(passer.quaternion);

  teammates.forEach((teammate) => {
    const toTeammate = new THREE.Vector3().subVectors(teammate.position, passer.position).normalize();
    const distance = passer.position.distanceTo(teammate.position);
    const dot = facingDir.dot(toTeammate);

    const score = dot * 100 - distance;
    if (score > bestScore && distance < 40) {
      bestScore = score;
      bestTarget = teammate;
    }
  });

  if (bestTarget) executePass(passer, bestTarget);
}

function throughBall() {
  if (!playerHasBall()) return;
  const forwards = homePlayers.filter((p) => ['ST', 'LW', 'RW'].includes(p.userData.positionName));
  if (!forwards.length) return;

  const target = forwards.reduce((best, current) => (current.position.z < best.position.z ? current : best));
  controlledPlayer.userData.hasBall = false;

  const targetPos = target.position.clone();
  targetPos.z -= 10;
  const direction = new THREE.Vector3().subVectors(targetPos, gameBall.position).normalize();
  const power = PLAYER_CONFIG.kickPower * 0.8;

  gameBall.userData.velocity.copy(direction.multiplyScalar(power));
  gameBall.userData.velocity.y = 2;
}

function shoot(power = PLAYER_CONFIG.kickPower) {
  if (!playerHasBall()) return;

  const shooter = controlledPlayer;
  shooter.userData.hasBall = false;

  const goalZ = shooter.position.z < 0
    ? PITCH_CONFIG.halfLength * PITCH_CONFIG.scale
    : -PITCH_CONFIG.halfLength * PITCH_CONFIG.scale;

  const goalWidth = PITCH_CONFIG.goalWidth * PITCH_CONFIG.scale;
  const targetX = (Math.random() - 0.5) * goalWidth * 0.8;
  const targetY = Math.random() * PITCH_CONFIG.goalHeight * PITCH_CONFIG.scale * 0.7 + 0.5;

  const targetPos = new THREE.Vector3(
    PITCH_CONFIG.positionX + targetX,
    PITCH_CONFIG.positionY + targetY,
    PITCH_CONFIG.positionZ + goalZ,
  );

  const direction = new THREE.Vector3().subVectors(targetPos, gameBall.position);
  const distance = direction.length();
  direction.normalize();

  direction.x += (Math.random() - 0.5) * (1 - PLAYER_CONFIG.shotAccuracy) * (distance / 50);
  gameBall.userData.velocity.copy(direction.multiplyScalar(power));
  gameBall.userData.velocity.y += power * 0.3;
}

function tackle() {
  if (playerHasBall()) return;
  const tackler = controlledPlayer;
  const ballHolder = getCurrentBallHolder();
  if (!ballHolder) return;

  const distance = tackler.position.distanceTo(ballHolder.position);
  if (distance < 2) {
    const success = Math.random() < 0.6;
    if (success) {
      ballHolder.userData.hasBall = false;
      tackler.userData.hasBall = true;
      gameBall.userData.lastTouchedBy = tackler;
      flashMessage('Tackle won!');
    } else {
      gameBall.userData.velocity.set((Math.random() - 0.5) * 10, 2, (Math.random() - 0.5) * 10);
      ballHolder.userData.hasBall = false;
    }
  }
}

function getAttackingPosition(player) {
  const goalZ = player.userData.team === TEAMS.homeTeam
    ? PITCH_CONFIG.halfLength * PITCH_CONFIG.scale
    : -PITCH_CONFIG.halfLength * PITCH_CONFIG.scale;

  return new THREE.Vector3(
    player.position.x + (Math.random() - 0.5) * 5,
    PITCH_CONFIG.positionY,
    PITCH_CONFIG.positionZ + goalZ * 0.7,
  );
}

function getOffensivePosition(player) {
  const home = player.userData.homePosition;
  const push = home.z > 0 ? 4 : -4;
  return new THREE.Vector3(home.x, PITCH_CONFIG.positionY, home.z + push);
}

function getDefensivePosition(player) {
  const home = player.userData.homePosition;
  const toBall = new THREE.Vector3().subVectors(gameBall.position, player.position).multiplyScalar(0.3);

  return new THREE.Vector3(
    PITCH_CONFIG.positionX + home.x * PITCH_CONFIG.scale + toBall.x,
    PITCH_CONFIG.positionY,
    PITCH_CONFIG.positionZ + home.z * PITCH_CONFIG.scale + toBall.z * 0.5,
  );
}

function moveToward(player, target, deltaTime) {
  const direction = new THREE.Vector3().subVectors(target, player.position);
  const distance = direction.length();
  if (distance < 0.5) return;

  direction.normalize();
  const speed = player.userData.speed * 0.7;
  direction.multiplyScalar(speed * deltaTime);
  player.position.add(direction);

  player.rotation.y = Math.atan2(direction.x, direction.z);
  player.userData.animationPhase += deltaTime * speed;
  player.position.y = PITCH_CONFIG.positionY + Math.abs(Math.sin(player.userData.animationPhase * 3) * 0.03);
}

function updateGoalkeeperAI(keeper, deltaTime) {
  const goalZ = keeper.userData.team === TEAMS.homeTeam
    ? -PITCH_CONFIG.halfLength * PITCH_CONFIG.scale
    : PITCH_CONFIG.halfLength * PITCH_CONFIG.scale;

  const targetX = clamp(gameBall.position.x * 0.7, -3, 3);
  const targetZ = goalZ + (keeper.userData.team === TEAMS.homeTeam ? 2 : -2);

  const targetPos = new THREE.Vector3(
    PITCH_CONFIG.positionX + targetX,
    PITCH_CONFIG.positionY,
    PITCH_CONFIG.positionZ + targetZ,
  );

  moveToward(keeper, targetPos, deltaTime);
  keeper.lookAt(gameBall.position.x, keeper.position.y, gameBall.position.z);

  const distToBall = keeper.position.distanceTo(gameBall.position);
  const ballVel = gameBall.userData.velocity;
  const ballMovingTowardGoal = keeper.userData.team === TEAMS.homeTeam ? ballVel.z < -5 : ballVel.z > 5;

  if (distToBall < 3 && ballMovingTowardGoal && ballVel.length() > 10) {
    if (Math.random() < 0.55) {
      keeper.userData.hasBall = true;
      gameBall.userData.velocity.set(0, 0, 0);
      gameBall.userData.lastTouchedBy = keeper;
    }
  }
}

function updateOutfieldAI(player, deltaTime, isUserTeam) {
  const hasBall = player.userData.hasBall;
  const ballHolder = getCurrentBallHolder();
  const isTeamInPossession = isUserTeam ? homePlayers.includes(ballHolder) : awayPlayers.includes(ballHolder);

  let targetPos;
  if (hasBall && !isUserTeam) {
    targetPos = getAttackingPosition(player);
    const distToGoal = Math.abs(player.position.z - PITCH_CONFIG.halfLength * PITCH_CONFIG.scale);
    if (distToGoal < 25 && Math.random() < 0.02) {
      player.userData.hasBall = true;
      controlledPlayer = player;
      shoot(PLAYER_CONFIG.kickPower * 0.8);
      return;
    }
    if (Math.random() < 0.01) {
      const mates = awayPlayers.filter((p) => p !== player && !p.userData.isGoalkeeper);
      if (mates.length) executePass(player, mates[Math.floor(Math.random() * mates.length)]);
      return;
    }
  } else if (isTeamInPossession) {
    targetPos = getOffensivePosition(player);
  } else {
    targetPos = getDefensivePosition(player);
  }

  moveToward(player, targetPos, deltaTime);
}

function updateAI(deltaTime) {
  awayPlayers.forEach((player) => {
    if (player.userData.isGoalkeeper) updateGoalkeeperAI(player, deltaTime);
    else updateOutfieldAI(player, deltaTime, false);
  });

  homePlayers.forEach((player) => {
    if (player === controlledPlayer) return;
    if (player.userData.isGoalkeeper) updateGoalkeeperAI(player, deltaTime);
    else updateOutfieldAI(player, deltaTime, true);
  });
}

function checkGoal() {
  const halfLength = PITCH_CONFIG.halfLength * PITCH_CONFIG.scale;
  const goalWidth = PITCH_CONFIG.goalWidth * PITCH_CONFIG.scale;
  const goalHeight = PITCH_CONFIG.goalHeight * PITCH_CONFIG.scale;

  if (Math.abs(gameBall.position.z) > halfLength) {
    if (Math.abs(gameBall.position.x) < goalWidth / 2 && gameBall.position.y < goalHeight + PITCH_CONFIG.positionY) {
      const scoringTeam = gameBall.position.z < 0 ? 'away' : 'home';
      goalScored(scoringTeam);
    }
  }
}

function checkBallBounds() {
  const halfWidth = PITCH_CONFIG.halfWidth * PITCH_CONFIG.scale;
  const halfLength = PITCH_CONFIG.halfLength * PITCH_CONFIG.scale;

  if (Math.abs(gameBall.position.x) > halfWidth) {
    gameBall.position.x = clamp(gameBall.position.x, -halfWidth, halfWidth);
    gameBall.userData.velocity.x *= -0.8;
  }
  if (Math.abs(gameBall.position.z) > halfLength + 5) {
    resetForKickoff(gameBall.position.z > 0 ? 'away' : 'home');
  }
}

function updateBallPhysics(deltaTime) {
  const vel = gameBall.userData.velocity;

  if (gameBall.position.y > GAME_CONFIG.ballRadius + PITCH_CONFIG.positionY) {
    vel.y -= GAME_CONFIG.gravity * deltaTime;
  }

  gameBall.position.x += vel.x * deltaTime;
  gameBall.position.y += vel.y * deltaTime;
  gameBall.position.z += vel.z * deltaTime;

  const groundY = PITCH_CONFIG.positionY + GAME_CONFIG.ballRadius;
  if (gameBall.position.y < groundY) {
    gameBall.position.y = groundY;
    vel.y = -vel.y * GAME_CONFIG.ballBounce;
    vel.x *= GAME_CONFIG.ballFriction;
    vel.z *= GAME_CONFIG.ballFriction;
  }

  vel.x *= 0.995;
  vel.z *= 0.995;

  gameBall.rotation.x += vel.z * deltaTime * 3;
  gameBall.rotation.z -= vel.x * deltaTime * 3;

  if (ballShadow) {
    ballShadow.position.x = gameBall.position.x;
    ballShadow.position.z = gameBall.position.z;
    ballShadow.scale.setScalar(clamp(1 - (gameBall.position.y - groundY) * 0.02, 0.55, 1));
  }

  checkBallBounds();
  checkGoal();
}

function resetForKickoff(team = 'home') {
  gameBall.position.set(0, GAME_CONFIG.ballRadius, 0);
  gameBall.userData.velocity.set(0, 0, 0);

  [...homePlayers, ...awayPlayers].forEach((p) => {
    p.userData.hasBall = false;
    p.position.set(p.userData.homePosition.x, PITCH_CONFIG.positionY, p.userData.homePosition.z);
  });

  const kickPlayer = (team === 'home' ? homePlayers : awayPlayers).find((p) => p.userData.positionName === 'ST');
  if (kickPlayer) {
    kickPlayer.userData.hasBall = true;
    if (homePlayers.includes(kickPlayer)) switchToPlayer(kickPlayer);
  }
}

function goalScored(team) {
  if (gameState !== GAME_STATE.PLAYING) return;

  if (team === 'home') homeScore += 1;
  else awayScore += 1;

  updateScoreboard();
  ui.goalScorer.textContent = `${team === 'home' ? TEAMS.homeTeam.name : TEAMS.awayTeam.name} scored!`;
  ui.goalOverlay.classList.add('visible');
  flashMessage('GOAL!', 1200);

  gameState = GAME_STATE.GOAL_SCORED;
  setTimeout(() => {
    ui.goalOverlay.classList.remove('visible');
    resetForKickoff(team === 'home' ? 'away' : 'home');
    gameState = GAME_STATE.PLAYING;
  }, 2500);
}

function updateTimeDisplay() {
  const displayTime = Math.floor(matchTime);
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  ui.matchTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  ui.half.textContent = isFirstHalf ? '1ST HALF' : '2ND HALF';
}

function halfTime() {
  isFirstHalf = false;
  gameState = GAME_STATE.HALFTIME;
  ui.halftime.classList.add('visible');

  setTimeout(() => {
    ui.halftime.classList.remove('visible');
    resetForKickoff('away');
    gameState = GAME_STATE.PLAYING;
  }, 5000);
}

function fullTime() {
  gameState = GAME_STATE.FULLTIME;
  ui.fulltimeText.textContent = homeScore === awayScore
    ? 'FULL TIME - DRAW'
    : `FULL TIME - ${homeScore > awayScore ? TEAMS.homeTeam.shortName : TEAMS.awayTeam.shortName} WIN`;
  ui.fulltime.classList.add('visible');
}

function updateMatchTime(deltaTime) {
  if (gameState !== GAME_STATE.PLAYING) return;
  matchTime += deltaTime;

  if (isFirstHalf && matchTime >= GAME_CONFIG.halfDuration) {
    halfTime();
  }
  if (matchTime >= GAME_CONFIG.matchDuration) {
    fullTime();
  }

  updateTimeDisplay();
}

function updateRadar() {
  const canvas2d = ui.radar;
  const ctx = canvas2d.getContext('2d');
  canvas2d.width = 210;
  canvas2d.height = 130;

  const scaleX = canvas2d.width / (PITCH_CONFIG.length * PITCH_CONFIG.scale);
  const scaleZ = canvas2d.height / (PITCH_CONFIG.width * PITCH_CONFIG.scale);

  ctx.fillStyle = '#1a4d1a';
  ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.strokeRect(5, 5, canvas2d.width - 10, canvas2d.height - 10);
  ctx.beginPath();
  ctx.moveTo(canvas2d.width / 2, 5);
  ctx.lineTo(canvas2d.width / 2, canvas2d.height - 5);
  ctx.stroke();

  const worldToRadar = (pos) => ({
    x: canvas2d.width / 2 + (pos.x - PITCH_CONFIG.positionX) * scaleX,
    y: canvas2d.height / 2 + (pos.z - PITCH_CONFIG.positionZ) * scaleZ,
  });

  ctx.fillStyle = '#0066ff';
  homePlayers.forEach((p) => {
    const pos = worldToRadar(p.position);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, p.userData.isControlled ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#ff3333';
  awayPlayers.forEach((p) => {
    const pos = worldToRadar(p.position);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#ffffff';
  const ballPos = worldToRadar(gameBall.position);
  ctx.beginPath();
  ctx.arc(ballPos.x, ballPos.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function updateCamera() {
  const idealTarget = gameBall.position.clone();
  const idealPosition = new THREE.Vector3(
    gameBall.position.x * 0.3,
    GAME_CONFIG.cameraHeight,
    gameBall.position.z + GAME_CONFIG.cameraDistance,
  );

  camTarget.lerp(idealTarget, GAME_CONFIG.cameraSmoothness);
  camPos.lerp(idealPosition, GAME_CONFIG.cameraSmoothness);
  camera.position.copy(camPos);
  camera.lookAt(camTarget);
}

function releaseChargedShot() {
  if (!chargingShot) return;
  chargingShot = false;

  const chargedPower = PLAYER_CONFIG.kickPower + (shotCharge / GAME_CONFIG.maxShotCharge) * 12;
  ui.shot.style.width = '0%';
  shotCharge = 0;

  if (playerHasBall()) shoot(chargedPower);
}

function togglePause() {
  if (gameState === GAME_STATE.PLAYING) setState(GAME_STATE.PAUSED);
  else if (gameState === GAME_STATE.PAUSED) setState(GAME_STATE.PLAYING);
}

function setupInput() {
  document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    switch (e.code) {
      case 'Escape':
        togglePause();
        break;
      case 'Space':
        if (gameState === GAME_STATE.PLAYING) {
          if (playerHasBall()) pass();
          else switchPlayer();
        }
        break;
      case 'KeyE':
        if (gameState === GAME_STATE.PLAYING) {
          if (playerHasBall()) {
            if (!chargingShot) {
              chargingShot = true;
              shotCharge = 0;
            }
          } else {
            tackle();
          }
        }
        break;
      case 'KeyQ':
        if (gameState === GAME_STATE.PLAYING && playerHasBall()) throughBall();
        break;
      default:
    }
  });

  document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'KeyE') releaseChargedShot();
  });
}

function populateTeamSelect() {
  ui.teamGrid.innerHTML = '';
  Object.values(ALL_TEAMS).forEach((team) => {
    const btn = document.createElement('button');
    btn.className = 'team-choice';
    btn.innerHTML = `<strong>${team.name}</strong><div style="opacity:.8">${team.shortName}</div>`;

    btn.addEventListener('click', async () => {
      if (teamPickStep === 'home') {
        TEAMS.homeTeam = { ...team, formation: FORM_433_HOME };
        teamPickStep = 'away';
        ui.teamStep.textContent = 'Pick Away Team';
        flashMessage(`Home: ${team.shortName}`);
      } else {
        TEAMS.awayTeam = { ...team, formation: FORM_433_AWAY };
        teamPickStep = 'home';
        ui.teamStep.textContent = 'Pick Home Team';
        await setupTeams();
        updateScoreboard();
        setState(GAME_STATE.MENU);
        flashMessage(`Away: ${team.shortName}`);
      }
    });

    ui.teamGrid.appendChild(btn);
  });
}

async function startMatch() {
  await setupTeams();
  homeScore = 0;
  awayScore = 0;
  matchTime = 0;
  isFirstHalf = true;
  updateScoreboard();
  updateTimeDisplay();
  resetForKickoff('home');
  setState(GAME_STATE.PLAYING);
  flashMessage('Kickoff!');
}

function setupUIListeners() {
  document.getElementById('quick-match-btn').addEventListener('click', startMatch);
  document.getElementById('team-select-btn').addEventListener('click', () => {
    teamPickStep = 'home';
    ui.teamStep.textContent = 'Pick Home Team';
    populateTeamSelect();
    setState(GAME_STATE.TEAM_SELECT);
  });
  document.getElementById('team-back-btn').addEventListener('click', () => setState(GAME_STATE.MENU));
  document.getElementById('help-btn').addEventListener('click', () => {
    alert('Local run: npm install -> npm run dev\nGitHub Pages: see README.md step-by-step guide.');
  });
  document.getElementById('resume-btn').addEventListener('click', () => setState(GAME_STATE.PLAYING));
  document.getElementById('restart-btn').addEventListener('click', startMatch);
  document.getElementById('quit-btn').addEventListener('click', () => setState(GAME_STATE.MENU));
  document.getElementById('play-again-btn').addEventListener('click', async () => {
    ui.fulltime.classList.remove('visible');
    await startMatch();
  });
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = Math.min(clock.getDelta(), 0.1);

  if (gameState === GAME_STATE.PLAYING) {
    if (chargingShot) {
      shotCharge = clamp(shotCharge + deltaTime, 0, GAME_CONFIG.maxShotCharge);
      ui.shot.style.width = `${(shotCharge / GAME_CONFIG.maxShotCharge) * 100}%`;
    }

    updatePlayerMovement(deltaTime);
    updateBallPhysics(deltaTime);
    checkBallControl();
    updateAI(deltaTime);
    updateMatchTime(deltaTime);
    updateCamera(deltaTime);
    updateRadar();
    updateSelectionIndicator();
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

async function initGame() {
  setupLighting();
  updateLoadingProgress(15);

  await loadCustomStadium();
  updateLoadingProgress(35);

  createPitch();
  createGoal(-1);
  createGoal(1);
  updateLoadingProgress(55);

  gameBall = createBall();
  ballShadow = createBallShadow();
  scene.add(ballShadow);
  createSelectionIndicator();
  updateLoadingProgress(70);

  await setupTeams();
  updateScoreboard();
  updateLoadingProgress(88);

  setupInput();
  setupUIListeners();

  updateLoadingProgress(100);
  setTimeout(() => {
    ui.loading.classList.remove('visible');
    setState(GAME_STATE.MENU);
  }, 450);

  animate();
}

initGame();
