export const STORAGE_KEYS = {
  settings: "pixelJumper_settings",
  highScores: "pixelJumper_highScores"
};

export const RESOLUTION = {
  WIDTH: 320,
  HEIGHT: 240,
  TILE: 16
};

export const PHYSICS = {
  gravity: 980,
  maxFallSpeed: 400,
  groundAccel: 900,
  airAccel: 540,
  groundFriction: 600,
  coyoteTime: 80,
  jumpBuffer: 100,
  doubleJumpVelocity: -220,
  wallSlideSpeed: 60,
  wallJumpVelocityX: 180,
  wallJumpVelocityY: -240,
  meleeDuration: 150,
  hitStun: 200,
  invincibleDuration: 500,
  knockbackX: 100,
  knockbackY: -80,
  comboWindow: 1500
};

export const DEFAULT_SETTINGS = {
  audio: {
    masterVolume: 80,
    sfxVolume: 75,
    musicVolume: 70,
    musicTrack: "default",
    stereoMode: "stereo"
  },
  video: {
    crtScanlines: true,
    crtVignette: true,
    phosphorBloom: true,
    chromaticAberration: true,
    screenShake: true,
    flashingEffects: true,
    scaleMode: "integer"
  },
  gameplay: {
    difficulty: "normal",
    startingLives: 3,
    timerMode: true,
    showComboCounter: true,
    showHitboxes: false,
    autoRun: false
  },
  controls: {
    remapKeys: "default",
    gamepadSupport: "xbox",
    vibration: true,
    deadzone: 0.2
  }
};

export const DIFFICULTY_MODIFIERS = {
  easy: { enemyHp: 0.5, enemySpeed: 0.75, playerMaxHpBonus: 1, bossPhaseThreshold: 0.33, timerDuration: 240, continueAllowed: true, scoreMultiplier: 0.5 },
  normal: { enemyHp: 1, enemySpeed: 1, playerMaxHpBonus: 0, bossPhaseThreshold: 0.5, timerDuration: 180, continueAllowed: true, scoreMultiplier: 1 },
  hard: { enemyHp: 1.5, enemySpeed: 1.25, playerMaxHpBonus: 0, bossPhaseThreshold: 0.6, timerDuration: 120, continueAllowed: true, scoreMultiplier: 1.5 },
  arcade: { enemyHp: 2, enemySpeed: 1.5, playerMaxHpBonus: 0, bossPhaseThreshold: 0.7, timerDuration: 90, continueAllowed: false, scoreMultiplier: 2 }
};

export const SCORE_VALUES = {
  GRUNBOT: 100,
  SHOOTER: 200,
  JUMPER: 150,
  TURRET: 300,
  coinSmall: 50,
  coinLarge: 200,
  gem: 500,
  boss1: 5000,
  boss2: 6000,
  boss3: 8000,
  boss4: 10000,
  boss5: 20000,
  noDeath: 2000,
  underTime: 1000
};

export const WORLD_SCALE_CONFIG = {
  1: {
    enemyHpMultiplier: 1,
    enemyMoveSpeed: 40,
    enemySpawnMultiplier: 1,
    bossHpMultiplier: 1,
    bossProjectileSpeedMultiplier: 1,
    bossPhaseThreshold: 0.5,
    timerDuration: 180,
    scoreMultiplier: 1
  },
  2: {
    enemyHpMultiplier: 1.5,
    enemyMoveSpeed: 55,
    enemySpawnMultiplier: 1.5,
    bossHpMultiplier: 1.5,
    bossProjectileSpeedMultiplier: 1.2,
    bossPhaseThreshold: 0.55,
    timerDuration: 150,
    scoreMultiplier: 1.5
  },
  3: {
    enemyHpMultiplier: 2,
    enemyMoveSpeed: 70,
    enemySpawnMultiplier: 2,
    bossHpMultiplier: 2,
    bossProjectileSpeedMultiplier: 1.5,
    bossPhaseThreshold: 0.65,
    timerDuration: 120,
    scoreMultiplier: 2
  }
};

export const SETTING_DEFINITIONS = [
  { path: "audio.masterVolume", type: "range", min: 0, max: 100, step: 5, label: "masterVolume" },
  { path: "audio.sfxVolume", type: "range", min: 0, max: 100, step: 5, label: "sfxVolume" },
  { path: "audio.musicVolume", type: "range", min: 0, max: 100, step: 5, label: "musicVolume" },
  { path: "audio.musicTrack", type: "list", options: ["default", "track1", "track2", "track3", "track4", "track5"], label: "musicTrack" },
  { path: "audio.stereoMode", type: "list", options: ["stereo", "mono"], label: "stereoMode" },
  { path: "video.crtScanlines", type: "toggle", label: "crtScanlines" },
  { path: "video.crtVignette", type: "toggle", label: "crtVignette" },
  { path: "video.phosphorBloom", type: "toggle", label: "phosphorBloom" },
  { path: "video.chromaticAberration", type: "toggle", label: "chromaticAberration" },
  { path: "video.screenShake", type: "toggle", label: "screenShake" },
  { path: "video.flashingEffects", type: "toggle", label: "flashingEffects" },
  { path: "video.scaleMode", type: "list", options: ["integer", "fit", "stretch"], label: "scaleMode" },
  { path: "gameplay.difficulty", type: "list", options: ["easy", "normal", "hard", "arcade"], label: "difficulty" },
  { path: "gameplay.startingLives", type: "list", options: [3, 5, 7, "Infinite"], label: "startingLives" },
  { path: "gameplay.timerMode", type: "toggle", label: "timerMode" },
  { path: "gameplay.showComboCounter", type: "toggle", label: "showComboCounter" },
  { path: "gameplay.showHitboxes", type: "toggle", label: "showHitboxes" },
  { path: "gameplay.autoRun", type: "toggle", label: "autoRun" },
  { path: "controls.remapKeys", type: "list", options: ["default"], label: "remapKeys" },
  { path: "controls.gamepadSupport", type: "list", options: ["xbox"], label: "gamepadSupport" },
  { path: "controls.vibration", type: "toggle", label: "vibration" },
  { path: "controls.deadzone", type: "range", min: 0, max: 0.5, step: 0.05, label: "deadzone" }
];

export const TEXT = {
  en: {
    title: "PIXEL JUMPER",
    subtitle: "ARCADE ODYSSEY",
    pressStart: "PRESS Z / ENTER",
    startGame: "START GAME",
    settings: "SETTINGS",
    highScores: "HIGH SCORES",
    language: "LANGUAGE",
    selectHero: "SELECT HERO",
    characterHint: "LEFT / RIGHT TO CHOOSE  Z TO CONFIRM",
    paused: "PAUSED",
    resume: "RESUME",
    quitToMenu: "QUIT TO MENU",
    gameOver: "GAME OVER",
    continuePrompt: "PRESS Z TO CONTINUE",
    initialsPrompt: "ENTER INITIALS",
    loadingWorld: "LOADING WORLD {world}",
    victory: "SYSTEM ESCAPE COMPLETE",
    victoryLine: "THE LOST CARTRIDGE IS FREE.",
    escapedArcade: "YOU ESCAPED THE ARCADE",
    score: "SCORE",
    lives: "LIVES",
    time: "TIME",
    combo: "COMBO",
    back: "BACK",
    world1Name: "GALACTIC GUNNER",
    world2Name: "DUNGEON DELVER",
    world3Name: "TURBO CIRCUIT",
    world4Name: "OCEAN ABYSS",
    world5Name: "BOSS FINALE",
    graxName: "GRAX THE WRECKER",
    zaraName: "ZARA VOLT",
    baronName: "BARON GRIMTHORN",
    nynxName: "NYNX THE SHADOW",
    graxDesc: "HEAVY BRAWLER WITH GROUND SMASH.",
    zaraDesc: "FAST RUNNER WITH CHAIN LIGHTNING.",
    baronDesc: "MAGE WITH BLINK AND ARCANE SHIELD.",
    nynxDesc: "STEALTH TRICKSTER WITH SHADOW STEP.",
    masterVolume: "MASTER VOLUME",
    sfxVolume: "SFX VOLUME",
    musicVolume: "MUSIC VOLUME",
    musicTrack: "MUSIC TRACK",
    stereoMode: "STEREO / MONO",
    crtScanlines: "CRT SCANLINES",
    crtVignette: "CRT VIGNETTE",
    phosphorBloom: "PHOSPHOR BLOOM",
    chromaticAberration: "CHROMATIC SHIFT",
    screenShake: "SCREEN SHAKE",
    flashingEffects: "FLASHING EFFECTS",
    scaleMode: "SCALE MODE",
    difficulty: "DIFFICULTY",
    startingLives: "STARTING LIVES",
    timerMode: "TIMER MODE",
    showComboCounter: "SHOW COMBO",
    showHitboxes: "SHOW HITBOXES",
    autoRun: "AUTO RUN",
    remapKeys: "REMAPPING",
    gamepadSupport: "GAMEPAD",
    vibration: "VIBRATION",
    deadzone: "DEADZONE",
    on: "ON",
    off: "OFF",
    stereo: "STEREO",
    mono: "MONO",
    integer: "INTEGER SCALE",
    fit: "FIT",
    stretch: "STRETCH",
    easy: "EASY",
    normal: "NORMAL",
    hard: "HARD",
    arcade: "ARCADE",
    Infinite: "INFINITE",
    default: "DEFAULT",
    track1: "TRACK 1",
    track2: "TRACK 2",
    track3: "TRACK 3",
    track4: "TRACK 4",
    track5: "TRACK 5",
    rank: "RANK",
    hero: "HERO",
    world: "WORLD",
    noData: "NO DATA"
  },
  nl: {
    title: "PIXEL JUMPER",
    subtitle: "ARCADE ODYSSEY",
    pressStart: "DRUK Z / ENTER",
    startGame: "START SPEL",
    settings: "INSTELLINGEN",
    highScores: "HOGE SCORES",
    language: "TAAL",
    selectHero: "KIES HELD",
    characterHint: "LINKS / RECHTS OM TE KIEZEN  Z OM TE BEVESTIGEN",
    paused: "GEPAUZEERD",
    resume: "VERDER",
    quitToMenu: "NAAR MENU",
    gameOver: "GAME OVER",
    continuePrompt: "DRUK Z OM VERDER TE GAAN",
    initialsPrompt: "VOER INITIALEN IN",
    loadingWorld: "LADEN WERELD {world}",
    victory: "SYSTEEMONTSNAPPING VOLTOOID",
    victoryLine: "DE VERLOREN CARTRIDGE IS VRIJ.",
    escapedArcade: "JE BENT UIT DE ARCADE ONTSNAPT",
    score: "SCORE",
    lives: "LEVENS",
    time: "TIJD",
    combo: "COMBO",
    back: "TERUG",
    world1Name: "GALACTIC GUNNER",
    world2Name: "DUNGEON DELVER",
    world3Name: "TURBO CIRCUIT",
    world4Name: "OCEAN ABYSS",
    world5Name: "BOSS FINALE",
    graxName: "GRAX THE WRECKER",
    zaraName: "ZARA VOLT",
    baronName: "BARON GRIMTHORN",
    nynxName: "NYNX THE SHADOW",
    graxDesc: "ZWARE VECHTER MET GRONDSLAG.",
    zaraDesc: "SNELLE RENNER MET KETTINGBLIKSEM.",
    baronDesc: "MAGIER MET BLINK EN ARCANE SHIELD.",
    nynxDesc: "SLUWE SCHADUWDIEF MET SHADOW STEP.",
    masterVolume: "MASTER VOLUME",
    sfxVolume: "SFX VOLUME",
    musicVolume: "MUZIEK VOLUME",
    musicTrack: "MUZIEKTRACK",
    stereoMode: "STEREO / MONO",
    crtScanlines: "CRT SCANLINES",
    crtVignette: "CRT VIGNET",
    phosphorBloom: "FOSFOR GLOED",
    chromaticAberration: "CHROMA SHIFT",
    screenShake: "SCHERMSCHOK",
    flashingEffects: "FLITS EFFECTEN",
    scaleMode: "SCHAALMODUS",
    difficulty: "MOEILIJKHEID",
    startingLives: "STARTLEVENS",
    timerMode: "TIMER MODUS",
    showComboCounter: "TOON COMBO",
    showHitboxes: "TOON HITBOXEN",
    autoRun: "AUTO RUN",
    remapKeys: "HERBINDEN",
    gamepadSupport: "GAMEPAD",
    vibration: "TRILLING",
    deadzone: "DEADZONE",
    on: "AAN",
    off: "UIT",
    stereo: "STEREO",
    mono: "MONO",
    integer: "INTEGER SCALE",
    fit: "PASSEN",
    stretch: "STRETCH",
    easy: "MAKKELIJK",
    normal: "NORMAAL",
    hard: "MOEILIJK",
    arcade: "ARCADE",
    Infinite: "ONEINDIG",
    default: "STANDAARD",
    track1: "TRACK 1",
    track2: "TRACK 2",
    track3: "TRACK 3",
    track4: "TRACK 4",
    track5: "TRACK 5",
    rank: "RANG",
    hero: "HELD",
    world: "WERELD",
    noData: "GEEN DATA"
  }
};

export const CHARACTERS = {
  GRAX: { id: "GRAX", name: "graxName", desc: "graxDesc", texture: "player_grax", width: 16, height: 24, maxHp: 5, moveSpeed: 100, jumpVelocity: -260, attack: { kind: "melee", damage: 2, width: 32, height: 20, cooldown: 400 }, dash: { kind: "charge", speed: 400, duration: 250, cooldown: 600 }, traits: { doubleJump: false, wallJump: false }, skill: { name: "groundSmash", cooldown: 2000, slamVelocity: 500, shockwaveWidth: 64, shockwaveHeight: 8 } },
  ZARA: { id: "ZARA", name: "zaraName", desc: "zaraDesc", texture: "player_zara", width: 16, height: 16, maxHp: 3, moveSpeed: 160, jumpVelocity: -300, attack: { kind: "ranged", damage: 1, speed: 280, range: 160, cooldown: 400, texture: "bolt_zara" }, dash: { kind: "dash", speed: 480, duration: 180, cooldown: 500 }, traits: { doubleJump: true, wallJump: false }, skill: { name: "chain" } },
  BARON: { id: "BARON", name: "baronName", desc: "baronDesc", texture: "player_baron", width: 16, height: 24, maxHp: 4, moveSpeed: 90, jumpVelocity: -270, attack: { kind: "ranged", damage: 1, speed: 240, range: 180, cooldown: 400, texture: "orb_baron" }, dash: { kind: "blink", distance: 80, cooldown: 800 }, traits: { doubleJump: false, wallJump: true }, skill: { name: "shield", cooldown: 4000 } },
  NYNX: { id: "NYNX", name: "nynxName", desc: "nynxDesc", texture: "player_nynx", width: 16, height: 16, maxHp: 3, moveSpeed: 140, jumpVelocity: -290, attack: { kind: "knife", damage: 1, speed: 220, range: 80, cooldown: 400, texture: "knife_nynx" }, dash: { kind: "dash", speed: 360, duration: 150, cooldown: 600 }, traits: { doubleJump: true, wallJump: true }, skill: { name: "shadowStep", duration: 2000, cooldown: 3000 } }
};

export const WORLDS = [
  {
    id: 1,
    name: "world1Name",
    sceneKey: "World1Scene",
    nextWorldScene: "World2Scene",
    bg: 0x060615,
    portalX: 608,
    worldWidth: 640,
    worldHeight: RESOLUTION.HEIGHT,
    playerSpawn: { x: 32, y: 180 },
    platforms: [
      { x: 160, y: 232, w: 320, h: 16 },
      { x: 480, y: 232, w: 320, h: 16 },
      { x: 200, y: 184, w: 96, h: 12 },
      { x: 364, y: 156, w: 82, h: 12 },
      { x: 536, y: 192, w: 112, h: 12 }
    ],
    collectables: [
      { kind: "coinSmall", x: 120, y: 196 }, { kind: "coinSmall", x: 216, y: 148 }, { kind: "coinLarge", x: 372, y: 120 }, { kind: "gem", x: 520, y: 156 }
    ],
    enemies: [
      { kind: "GRUNBOT", x: 180, y: 200, patrolMin: 150, patrolMax: 290 }, { kind: "SHOOTER", x: 312, y: 132 }, { kind: "TURRET", x: 430, y: 220, mount: "floor" }, { kind: "JUMPER", x: 548, y: 176 }
    ],
    boss: { name: "COMMODORE NOVA", texture: "boss_1", x: 576, y: 112, hp: 10, reward: "boss1" }
  },
  {
    id: 2,
    name: "world2Name",
    sceneKey: "World2Scene",
    nextWorldScene: "World3Scene",
    bg: 0x18140e,
    portalX: 640,
    worldWidth: 672,
    worldHeight: RESOLUTION.HEIGHT,
    playerSpawn: { x: 32, y: 180 },
    platforms: [
      { x: 168, y: 232, w: 336, h: 16 },
      { x: 504, y: 232, w: 336, h: 16 },
      { x: 132, y: 172, w: 80, h: 12 },
      { x: 304, y: 140, w: 96, h: 12 },
      { x: 488, y: 176, w: 96, h: 12 },
      { x: 612, y: 120, w: 80, h: 12 }
    ],
    collectables: [
      { kind: "coinSmall", x: 128, y: 148 }, { kind: "coinLarge", x: 304, y: 112 }, { kind: "coinSmall", x: 488, y: 148 }, { kind: "gem", x: 608, y: 92 }
    ],
    enemies: [
      { kind: "GRUNBOT", x: 220, y: 200, patrolMin: 160, patrolMax: 290 }, { kind: "JUMPER", x: 336, y: 108 }, { kind: "SHOOTER", x: 540, y: 152 }, { kind: "GRUNBOT", x: 620, y: 96, patrolMin: 588, patrolMax: 650 }
    ],
    boss: { name: "THE LICH KING MORDRAK", texture: "boss_2", x: 610, y: 74, hp: 8, reward: "boss2" }
  },
  {
    id: 3,
    name: "world3Name",
    sceneKey: "World3Scene",
    nextWorldScene: "EndingScene",
    bg: 0x111111,
    portalX: 672,
    worldWidth: 704,
    worldHeight: RESOLUTION.HEIGHT,
    playerSpawn: { x: 32, y: 180 },
    platforms: [
      { x: 176, y: 232, w: 352, h: 16 },
      { x: 528, y: 232, w: 352, h: 16 },
      { x: 200, y: 176, w: 120, h: 12 },
      { x: 408, y: 144, w: 104, h: 12 },
      { x: 612, y: 176, w: 88, h: 12 }
    ],
    collectables: [
      { kind: "coinSmall", x: 208, y: 148 }, { kind: "coinLarge", x: 404, y: 112 }, { kind: "coinSmall", x: 620, y: 148 }, { kind: "gem", x: 528, y: 200 }
    ],
    enemies: [
      { kind: "TURRET", x: 280, y: 220, mount: "floor" }, { kind: "GRUNBOT", x: 342, y: 200, patrolMin: 304, patrolMax: 472 }, { kind: "SHOOTER", x: 432, y: 116 }, { kind: "JUMPER", x: 622, y: 152 }
    ],
    boss: { name: "TURBO TYRANT X", texture: "boss_3", x: 620, y: 220, hp: 12, reward: "boss3" }
  },
  {
    id: 4,
    name: "world4Name",
    sceneKey: "World4Scene",
    bg: 0x041229,
    portalX: 672,
    worldWidth: 704,
    playerSpawn: { x: 32, y: 180 },
    platforms: [
      { x: 176, y: 232, w: 352, h: 16 },
      { x: 528, y: 232, w: 352, h: 16 },
      { x: 180, y: 176, w: 96, h: 12 },
      { x: 332, y: 132, w: 80, h: 12 },
      { x: 496, y: 176, w: 88, h: 12 },
      { x: 618, y: 124, w: 88, h: 12 }
    ],
    collectables: [
      { kind: "coinSmall", x: 180, y: 148 }, { kind: "coinLarge", x: 332, y: 104 }, { kind: "coinSmall", x: 618, y: 96 }, { kind: "gem", x: 526, y: 148 }
    ],
    enemies: [
      { kind: "SHOOTER", x: 178, y: 152 }, { kind: "JUMPER", x: 328, y: 100 }, { kind: "GRUNBOT", x: 520, y: 152, patrolMin: 480, patrolMax: 560 }, { kind: "GRUNBOT", x: 620, y: 100, patrolMin: 590, patrolMax: 650 }
    ],
    boss: { name: "THE ABYSSAL QUEEN", texture: "boss_4", x: 620, y: 96, hp: 14, reward: "boss4" }
  },
  {
    id: 5,
    name: "world5Name",
    sceneKey: "World5Scene",
    bg: 0x150515,
    portalX: 704,
    worldWidth: 736,
    playerSpawn: { x: 32, y: 180 },
    platforms: [
      { x: 184, y: 232, w: 368, h: 16 },
      { x: 552, y: 232, w: 368, h: 16 },
      { x: 176, y: 184, w: 80, h: 12 },
      { x: 320, y: 144, w: 80, h: 12 },
      { x: 468, y: 184, w: 80, h: 12 },
      { x: 620, y: 136, w: 96, h: 12 }
    ],
    collectables: [
      { kind: "coinSmall", x: 176, y: 156 }, { kind: "coinLarge", x: 320, y: 116 }, { kind: "coinSmall", x: 620, y: 108 }, { kind: "gem", x: 524, y: 200 }
    ],
    enemies: [
      { kind: "TURRET", x: 120, y: 220, mount: "floor" }, { kind: "SHOOTER", x: 320, y: 116 }, { kind: "JUMPER", x: 472, y: 152 }, { kind: "GRUNBOT", x: 622, y: 112, patrolMin: 590, patrolMax: 680 }
    ],
    boss: { name: "THE ARCHITECT", texture: "boss_5", x: 636, y: 84, hp: 20, reward: "boss5" }
  }
];

export function text(lang, key, vars = {}) {
  const source = TEXT[lang] || TEXT.en;
  let value = source[key] || TEXT.en[key] || key;
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, String(replacement));
  });
  return value;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatScore(score) {
  return String(Math.max(0, Math.floor(score))).padStart(8, "0");
}

export function approach(current, target, delta) {
  if (current < target) {
    return Math.min(target, current + delta);
  }
  if (current > target) {
    return Math.max(target, current - delta);
  }
  return target;
}

export function getDifficulty(settings) {
  return DIFFICULTY_MODIFIERS[settings.gameplay.difficulty] || DIFFICULTY_MODIFIERS.normal;
}

export function getTextStyle(size = 8, color = "#ffffff", align = "left") {
  return {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: `${Math.max(8, size)}px`,
    color,
    align,
    stroke: "#000000",
    strokeThickness: 2
  };
}

export function getSettingValue(settings, path) {
  return path.split(".").reduce((acc, key) => acc[key], settings);
}

export function setSettingValue(settings, path, value) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((acc, key) => acc[key], settings);
  target[last] = value;
}
