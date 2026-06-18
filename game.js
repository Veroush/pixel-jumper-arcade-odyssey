import CRTShaderPipeline from "./plugins/CRTShaderPipeline.js";
import {
  CHARACTERS,
  DEFAULT_SETTINGS,
  DIFFICULTY_MODIFIERS,
  PHYSICS,
  RESOLUTION,
  SCORE_VALUES,
  SETTING_DEFINITIONS,
  STORAGE_KEYS,
  TEXT,
  WORLD_SCALE_CONFIG,
  WORLDS,
  approach,
  clone,
  formatScore,
  getDifficulty,
  getSettingValue,
  getTextStyle,
  setSettingValue,
  text
} from "./utils/Constants.js";

function ensurePressStartFont() {
  if (document.querySelector('link[data-font="press-start-2p"]')) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
  link.dataset.font = "press-start-2p";
  document.head.appendChild(link);
}

class InputManager {
  constructor(scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    this.keys = {
      left: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)],
      right: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)],
      up: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)],
      down: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)],
      jump: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)],
      attack: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)],
      dash: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)],
      pause: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)],
      confirm: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)],
      back: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)],
      interact: [keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)]
    };
    this.padButtons = [];
    this.prevPadButtons = [];
  }

  pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = Array.from(pads || []).find(Boolean);
    this.pad = pad || null;
    this.padButtons = pad ? pad.buttons.map((button) => button.pressed) : [];
  }

  update() {
    this.prevPadButtons = [...this.padButtons];
    this.pollPad();
  }

  isDown(action) {
    if ((this.keys[action] || []).some((key) => key.isDown)) {
      return true;
    }
    this.pollPad();
    if (!this.pad) {
      return false;
    }
    switch (action) {
      case "left":
        return this.pad.axes[0] < -0.2 || this.padButtons[14];
      case "right":
        return this.pad.axes[0] > 0.2 || this.padButtons[15];
      case "up":
      case "interact":
        return this.pad.axes[1] < -0.2 || this.padButtons[12];
      case "down":
        return this.pad.axes[1] > 0.2 || this.padButtons[13];
      case "jump":
      case "confirm":
        return this.padButtons[0];
      case "attack":
      case "back":
        return this.padButtons[1] || this.padButtons[2];
      case "dash":
        return this.padButtons[5];
      case "pause":
        return this.padButtons[8] || this.padButtons[9];
      default:
        return false;
    }
  }

  justPressed(action) {
    if ((this.keys[action] || []).some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      return true;
    }
    this.pollPad();
    const justButton = (index) => Boolean(this.padButtons[index] && !this.prevPadButtons[index]);
    switch (action) {
      case "jump":
      case "confirm":
        return justButton(0);
      case "attack":
      case "back":
        return justButton(1) || justButton(2);
      case "dash":
        return justButton(5);
      case "pause":
        return justButton(8) || justButton(9);
      case "left":
        return justButton(14);
      case "right":
        return justButton(15);
      case "up":
      case "interact":
        return justButton(12);
      case "down":
        return justButton(13);
      default:
        return false;
    }
  }

  horizontal(settings) {
    let value = 0;
    if (this.isDown("left")) {
      value -= 1;
    }
    if (this.isDown("right")) {
      value += 1;
    }
    if (value === 0 && settings?.gameplay?.autoRun) {
      value = 1;
    }
    return Phaser.Math.Clamp(value, -1, 1);
  }

  vertical() {
    let value = 0;
    if (this.isDown("up")) {
      value -= 1;
    }
    if (this.isDown("down")) {
      value += 1;
    }
    return Phaser.Math.Clamp(value, -1, 1);
  }
}

class ScoreManager {
  constructor(game) {
    this.game = game;
    this.highScores = this.loadHighScores();
    this.resetRun(DEFAULT_SETTINGS, "GRAX");
  }

  resetRun(settings, characterId) {
    const difficulty = DIFFICULTY_MODIFIERS[settings.gameplay.difficulty] || DIFFICULTY_MODIFIERS.normal;
    this.score = 0;
    this.combo = 1;
    this.comboCount = 0;
    this.lastKillAt = -9999;
    this.scoreMultiplier = difficulty.scoreMultiplier;
    this.characterId = characterId;
    this.currentWorld = 1;
    this.noDeathWorld = true;
    this.deaths = 0;
    this.lives = settings.gameplay.startingLives === "Infinite" ? Number.POSITIVE_INFINITY : Number(settings.gameplay.startingLives || 3);
    this.sync();
  }

  sync() {
    this.game.registry.set("score", this.score);
    this.game.registry.set("combo", this.combo);
    this.game.registry.set("comboCount", this.comboCount);
    this.game.registry.set("lives", this.lives);
    this.game.registry.set("currentWorld", this.currentWorld);
    this.game.registry.set("characterId", this.characterId);
  }

  setWorld(worldId) {
    this.currentWorld = worldId;
    this.noDeathWorld = true;
    this.scoreMultiplier = WORLD_SCALE_CONFIG[worldId]?.scoreMultiplier || 1;
    this.sync();
  }

  addScore(points, multiplier = 1) {
    this.score += Math.round(points * this.scoreMultiplier * multiplier);
    this.sync();
  }

  addCollect(kind, scene, x, y) {
    this.addScore(SCORE_VALUES[kind] || 0);
    scene.spawnFloatingText(`+${SCORE_VALUES[kind] || 0}`, x, y, "#FFFF55");
  }

  addKill(kind, scene, x, y) {
    const now = scene.time.now;
    if (now - this.lastKillAt <= PHYSICS.comboWindow) {
      this.comboCount += 1;
    } else {
      this.comboCount = 1;
    }
    this.lastKillAt = now;
    this.combo = Phaser.Math.Clamp(1 + Math.max(0, this.comboCount - 1) * 0.5, 1, 4);
    const score = Math.round((SCORE_VALUES[kind] || 0) * this.combo * this.scoreMultiplier);
    this.score += score;
    this.sync();
    scene.spawnFloatingText(`+${score}${this.comboCount > 1 ? ` x${this.combo.toFixed(1)}` : ""}`, x, y, "#55FFFF");
  }

  bossDefeated(worldId, scene, x, y) {
    this.addScore(SCORE_VALUES[`boss${worldId}`] || 0);
    scene.spawnFloatingText(`BOSS +${SCORE_VALUES[`boss${worldId}`] || 0}`, x, y, "#FF55FF");
  }

  completeWorld(remaining) {
    this.addScore(remaining * 10, 1);
    if (this.noDeathWorld) {
      this.addScore(SCORE_VALUES.noDeath, 1);
    }
    this.addScore(SCORE_VALUES.underTime, 1);
  }

  loseLife() {
    this.deaths += 1;
    this.noDeathWorld = false;
    if (Number.isFinite(this.lives)) {
      this.lives = Math.max(0, this.lives - 1);
    }
    this.sync();
    return this.lives;
  }

  qualifies() {
    if (this.highScores.length < 10) {
      return true;
    }
    return this.score > this.highScores[this.highScores.length - 1].score;
  }

  loadHighScores() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.highScores) || "[]");
    } catch (error) {
      return [];
    }
  }

  saveHighScores() {
    window.localStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(this.highScores));
  }

  submit(initials, world, character) {
    const entry = {
      initials,
      score: this.score,
      world,
      character,
      timestamp: new Date().toISOString()
    };
    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    this.saveHighScores();
  }
}

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, config.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.owner = config.owner;
    this.damage = config.damage;
    this.spawnX = config.x;
    this.spawnY = config.y;
    this.range = config.range || 160;
    this.speed = config.speed || 0;
    this.homingTarget = config.homingTarget || null;
    this.homingSpeed = config.homingSpeed || 120;
    this.lifespan = config.lifespan || 3000;
    this.spawnTime = scene.time.now;
    this.body.setVelocity(config.vx || 0, config.vy || 0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.homingTarget?.active) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homingTarget.x, this.homingTarget.y);
      this.body.setVelocity(Math.cos(angle) * this.homingSpeed, Math.sin(angle) * this.homingSpeed);
    }
    if (Phaser.Math.Distance.Between(this.spawnX, this.spawnY, this.x, this.y) >= this.range || time - this.spawnTime > this.lifespan) {
      this.destroy();
    }
  }
}

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, characterId) {
    const config = CHARACTERS[characterId];
    super(scene, x, y, config.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.characterId = characterId;
    this.definition = config;
    this.maxHp = config.maxHp + scene.difficulty.playerMaxHpBonus;
    this.hp = this.maxHp;
    this.facing = 1;
    this.jumpCount = 0;
    this.wasGrounded = false;
    this.coyoteUntil = 0;
    this.jumpBufferedUntil = 0;
    this.attackReadyAt = 0;
    this.dashReadyAt = 0;
    this.skillReadyAt = 0;
    this.invincibleUntil = 0;
    this.lockedUntil = 0;
    this.dashingUntil = 0;
    this.isGroundSmashing = false;
    this.isInvisible = false;
    this.invisibleUntil = 0;
    this.shieldActive = false;
    this.setOrigin(0.5, 1);
    this.body.setCollideWorldBounds(true);
    this.body.setSize(config.width - 2, config.height - 2);
    this.body.setOffset(1, 1);
  }

  update(time, delta) {
    const input = this.scene.inputManager;
    const settings = this.scene.settings;
    const dt = delta / 1000;
    const onGround = this.body.blocked.down || this.body.touching.down;

    if (this.isInvisible && time >= this.invisibleUntil) {
      this.endInvisibility();
    }

    if (onGround) {
      if (!this.wasGrounded && this.isGroundSmashing) {
        this.isGroundSmashing = false;
        this.scene.spawnShockwave(this.x, this.y - 2, this.definition.skill.shockwaveWidth, this.definition.skill.shockwaveHeight);
      }
      this.jumpCount = 0;
      this.coyoteUntil = time + PHYSICS.coyoteTime;
    } else if (this.wasGrounded) {
      this.coyoteUntil = time + PHYSICS.coyoteTime;
    }

    if (input.justPressed("jump")) {
      this.jumpBufferedUntil = time + PHYSICS.jumpBuffer;
    }
    if (time <= this.jumpBufferedUntil && this.canJump(time, onGround, input)) {
      this.performJump(time, onGround, input);
      this.jumpBufferedUntil = 0;
    }

    if (time >= this.lockedUntil && time >= this.dashingUntil) {
      const horizontal = input.horizontal(settings);
      const target = horizontal * this.definition.moveSpeed;
      if (horizontal !== 0) {
        this.facing = horizontal > 0 ? 1 : -1;
        this.body.setVelocityX(approach(this.body.velocity.x, target, (onGround ? PHYSICS.groundAccel : PHYSICS.airAccel) * dt));
      } else if (onGround) {
        this.body.setVelocityX(approach(this.body.velocity.x, 0, PHYSICS.groundFriction * dt));
      }

      const pressingIntoWall = this.definition.traits.wallJump && !onGround && ((horizontal < 0 && this.body.blocked.left) || (horizontal > 0 && this.body.blocked.right));
      this.isWallSliding = pressingIntoWall;
      if (pressingIntoWall && this.body.velocity.y > PHYSICS.wallSlideSpeed) {
        this.body.setVelocityY(PHYSICS.wallSlideSpeed);
      }
    }

    if (input.justPressed("attack")) {
      this.attack(time, input, onGround);
    }
    if (input.justPressed("dash")) {
      this.dashOrSkill(time, input);
    }

    if (this.body.velocity.y > PHYSICS.maxFallSpeed) {
      this.body.setVelocityY(PHYSICS.maxFallSpeed);
    }

    this.setFlipX(this.facing < 0);
    const flashing = time < this.invincibleUntil && Math.floor(time / 60) % 2 === 0;
    this.setAlpha(this.isInvisible ? 0.15 : flashing ? 0.45 : 1);
    this.wasGrounded = onGround;
  }

  canJump(time, onGround) {
    if (onGround || time <= this.coyoteUntil) {
      return true;
    }
    if (this.isWallSliding) {
      return true;
    }
    return this.definition.traits.doubleJump && this.jumpCount < 1;
  }

  performJump(time, onGround) {
    if (this.isWallSliding) {
      const direction = this.body.blocked.left ? 1 : -1;
      this.body.setVelocityX(direction * PHYSICS.wallJumpVelocityX);
      this.body.setVelocityY(PHYSICS.wallJumpVelocityY);
      this.facing = direction;
      this.isWallSliding = false;
      return;
    }
    if (!onGround && time > this.coyoteUntil) {
      this.jumpCount += 1;
      this.body.setVelocityY(PHYSICS.doubleJumpVelocity);
      return;
    }
    this.body.setVelocityY(this.definition.jumpVelocity);
  }

  attack(time, input, onGround) {
    if (time < this.attackReadyAt) {
      return;
    }
    if (this.characterId === "GRAX" && input.vertical() > 0 && !onGround && time >= this.skillReadyAt) {
      this.isGroundSmashing = true;
      this.skillReadyAt = time + this.definition.skill.cooldown;
      this.body.setVelocityY(this.definition.skill.slamVelocity);
      return;
    }
    if (this.characterId === "ZARA" && time < this.dashingUntil) {
      [-0.25, 0, 0.25].forEach((offset) => this.fireProjectile(offset, 1));
      this.attackReadyAt = time + this.definition.attack.cooldown;
      return;
    }
    if (this.definition.attack.kind === "melee") {
      this.scene.spawnHitbox(this, this.definition.attack.width, this.definition.attack.height, this.isInvisible ? 2 : this.definition.attack.damage);
    } else {
      this.fireProjectile(0, this.isInvisible ? 2 : this.definition.attack.damage);
    }
    if (this.isInvisible) {
      this.endInvisibility();
    }
    this.attackReadyAt = time + this.definition.attack.cooldown;
  }

  fireProjectile(offsetAngle, damage) {
    const angle = offsetAngle;
    const speed = this.definition.attack.speed;
    this.scene.spawnProjectile({
      x: this.x + this.facing * 12,
      y: this.y - this.definition.height * 0.55,
      texture: this.definition.attack.texture,
      vx: Math.cos(angle) * speed * this.facing,
      vy: Math.sin(angle) * speed,
      range: this.definition.attack.range,
      damage,
      owner: "player"
    });
  }

  dashOrSkill(time, input) {
    if (this.characterId === "BARON") {
      if (input.horizontal(this.scene.settings) === 0) {
        if (this.shieldActive) {
          this.shieldActive = false;
          this.scene.hideShield();
          return;
        }
        if (time >= this.skillReadyAt) {
          this.shieldActive = true;
          this.scene.showShield(this);
        }
      } else if (time >= this.dashReadyAt) {
        const direction = input.horizontal(this.scene.settings) || this.facing;
        this.x = Phaser.Math.Clamp(this.x + direction * this.definition.dash.distance, 16, this.scene.worldWidth - 16);
        this.dashReadyAt = time + this.definition.dash.cooldown;
        this.invincibleUntil = time + 120;
      }
      return;
    }

    if (this.characterId === "NYNX" && input.vertical() > 0 && time >= this.skillReadyAt) {
      this.isInvisible = true;
      this.invisibleUntil = time + this.definition.skill.duration;
      this.skillReadyAt = this.invisibleUntil + this.definition.skill.cooldown;
      return;
    }

    if (time < this.dashReadyAt) {
      return;
    }
    const direction = input.horizontal(this.scene.settings) || this.facing;
    this.facing = direction > 0 ? 1 : -1;
    this.dashingUntil = time + this.definition.dash.duration;
    this.dashReadyAt = time + this.definition.dash.cooldown;
    this.invincibleUntil = this.dashingUntil;
    this.body.setVelocity(direction * this.definition.dash.speed, 0);
    if (this.characterId === "NYNX") {
      this.scene.spawnDecoy(this.x, this.y - 8);
    }
  }

  endInvisibility() {
    this.isInvisible = false;
    this.invisibleUntil = 0;
  }

  takeDamage(amount, sourceX) {
    const now = this.scene.time.now;
    if (now < this.invincibleUntil) {
      return;
    }
    if (this.shieldActive) {
      this.shieldActive = false;
      this.skillReadyAt = now + this.definition.skill.cooldown;
      this.scene.hideShield();
      return;
    }
    this.hp -= amount;
    this.invincibleUntil = now + PHYSICS.invincibleDuration;
    this.lockedUntil = now + PHYSICS.hitStun;
    const direction = this.x < sourceX ? -1 : 1;
    this.body.setVelocity(direction * PHYSICS.knockbackX, PHYSICS.knockbackY);
    if (this.hp <= 0) {
      this.scene.handlePlayerDeath();
    }
  }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    const texture = {
      GRUNBOT: "enemy_grunbot",
      SHOOTER: "enemy_shooter",
      JUMPER: "enemy_jumper",
      TURRET: "enemy_turret"
    }[config.kind];
    super(scene, config.x, config.y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.kind = config.kind;
    this.enemyConfig = config;
    this.direction = -1;
    this.hp = Math.max(1, Math.ceil((config.kind === "SHOOTER" ? 2 : config.kind === "TURRET" ? 3 : 1) * scene.difficulty.enemyHp));
    this.body.setAllowGravity(config.kind !== "SHOOTER" && config.kind !== "TURRET");
    this.body.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);
    this.nextActionAt = 0;
  }

  update(time) {
    const player = this.scene.player;
    if (!player || !player.active) {
      return;
    }
    switch (this.kind) {
      case "GRUNBOT": {
        if (this.x <= this.enemyConfig.patrolMin) {
          this.direction = 1;
        }
        if (this.x >= this.enemyConfig.patrolMax) {
          this.direction = -1;
        }
        this.body.setVelocityX(this.direction * 40 * this.scene.difficulty.enemySpeed);
        this.setFlipX(this.direction > 0);
        break;
      }
      case "SHOOTER": {
        this.body.setVelocityX(0);
        if (!player.isInvisible && Math.abs(player.x - this.x) <= 160 && Math.abs(player.y - this.y) <= 16 && time >= this.nextActionAt) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y - 8, player.x, player.y - 8);
          this.scene.spawnProjectile({
            x: this.x,
            y: this.y - 8,
            texture: "bullet_enemy",
            vx: Math.cos(angle) * 200,
            vy: Math.sin(angle) * 200,
            range: 160,
            damage: 1,
            owner: "enemy"
          });
          this.nextActionAt = time + 2000;
        }
        break;
      }
      case "JUMPER": {
        const onGround = this.body.blocked.down || this.body.touching.down;
        if (onGround && !player.isInvisible && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) <= 96 && time >= this.nextActionAt) {
          const direction = player.x > this.x ? 1 : -1;
          this.body.setVelocity(direction * 120, -300);
          this.nextActionAt = time + 900;
        }
        break;
      }
      case "TURRET": {
        this.body.setVelocity(0, 0);
        if (time >= this.nextActionAt) {
          const vy = this.enemyConfig.mount === "ceiling" ? 160 : -160;
          this.scene.spawnProjectile({
            x: this.x,
            y: this.y - 8,
            texture: "bullet_enemy",
            vx: 0,
            vy,
            range: 160,
            damage: 1,
            owner: "enemy"
          });
          this.nextActionAt = time + 1500;
        }
        break;
      }
      default:
        break;
    }
  }

  hit(damage, source) {
    if (this.kind === "TURRET") {
      const verticalHit = Math.abs(source.y - this.y) > Math.abs(source.x - this.x);
      if (!verticalHit) {
        this.scene.spawnFloatingText("BLOCK", this.x, this.y - 12, "#FF5555");
        return false;
      }
    }
    this.hp -= damage;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => this.active && this.clearTint());
    if (this.hp > 0) {
      return false;
    }
    this.scene.scoreManager.addKill(this.kind, this.scene, this.x, this.y - 12);
    this.destroy();
    return true;
  }
}

class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, config.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scene = scene;
    this.definition = config;
    this.worldId = scene.world.id;
    this.maxHp = Math.ceil(config.hp * scene.difficulty.enemyHp);
    this.hp = this.maxHp;
    this.phase = 1;
    this.isDefeated = false;
    this.direction = -1;
    this.baseY = config.y;
    this.nextAttackAt = 0;
    this.nextSummonAt = 0;
    this.body.setAllowGravity(false);
    this.body.setCollideWorldBounds(true);
    this.setOrigin(0.5, 1);
  }

  update(time) {
    if (this.hp <= Math.ceil(this.maxHp * this.scene.difficulty.bossPhaseThreshold)) {
      this.phase = 2;
    }
    const player = this.scene.player;
    switch (this.worldId) {
      case 1:
        this.updateNova(time);
        break;
      case 2:
        this.updateLich(time, player);
        break;
      case 3:
        this.updateTyrant(time);
        break;
      case 4:
        this.updateQueen(time);
        break;
      case 5:
        this.updateArchitect(time, player);
        break;
      default:
        break;
    }
  }

  updateNova(time) {
    const targetY = this.phase === 1 ? 118 + Math.sin(time / 450) * 12 : 140 + Math.sin(time / 380) * 10;
    this.y = Phaser.Math.Linear(this.y, targetY, 0.1);
    this.body.setVelocityX(this.direction * (this.phase === 1 ? 80 : 120));
    if (this.x <= this.scene.worldWidth - 180) {
      this.direction = 1;
    }
    if (this.x >= this.scene.worldWidth - 36) {
      this.direction = -1;
    }
    if (time >= this.nextAttackAt) {
      const offsets = this.phase === 1 ? [-0.3, 0, 0.3] : [-0.5, -0.25, 0, 0.25, 0.5];
      offsets.forEach((offset) => {
        this.scene.spawnProjectile({
          x: this.x,
          y: this.y - 10,
          texture: "bullet_enemy",
          vx: Math.cos(Math.PI / 2 + offset) * 160,
          vy: Math.sin(Math.PI / 2 + offset) * 160,
          range: 220,
          damage: 1,
          owner: "enemy"
        });
      });
      this.nextAttackAt = time + (this.phase === 1 ? 2500 : 1800);
    }
    if (this.phase === 2 && time >= this.nextSummonAt) {
      this.scene.spawnEnemy({ kind: "GRUNBOT", x: this.scene.worldWidth - 180, y: 216, patrolMin: this.scene.worldWidth - 220, patrolMax: this.scene.worldWidth - 120 });
      this.scene.spawnEnemy({ kind: "GRUNBOT", x: this.scene.worldWidth - 40, y: 216, patrolMin: this.scene.worldWidth - 80, patrolMax: this.scene.worldWidth - 10 });
      this.nextSummonAt = time + 5000;
    }
  }

  updateLich(time, player) {
    if (time >= this.nextAttackAt) {
      const spots = [{ x: this.scene.worldWidth - 180, y: 140 }, { x: this.scene.worldWidth - 96, y: 92 }, { x: this.scene.worldWidth - 40, y: 164 }];
      const spot = Phaser.Utils.Array.GetRandom(spots);
      this.setPosition(spot.x, spot.y);
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      [angle - 0.15, angle + 0.15].forEach((shotAngle) => {
        this.scene.spawnProjectile({
          x: this.x,
          y: this.y - 12,
          texture: "orb_enemy",
          vx: Math.cos(shotAngle) * 180,
          vy: Math.sin(shotAngle) * 180,
          range: 220,
          damage: 1,
          owner: "enemy"
        });
      });
      this.nextAttackAt = time + 3000;
    }
    if (this.phase === 2 && time >= this.nextSummonAt) {
      this.scene.spawnEnemy({ kind: "JUMPER", x: this.scene.worldWidth - 160, y: 216 });
      this.scene.spawnEnemy({ kind: "JUMPER", x: this.scene.worldWidth - 80, y: 216 });
      this.nextSummonAt = time + 4000;
    }
  }

  updateTyrant(time) {
    this.body.setAllowGravity(true);
    this.body.setVelocityX(this.direction * (this.phase === 1 ? 200 : 280));
    if (this.x <= this.scene.worldWidth - 360) {
      this.direction = 1;
    }
    if (this.x >= this.scene.worldWidth - 20) {
      this.direction = -1;
    }
    if (time >= this.nextAttackAt) {
      this.scene.spawnProjectile({
        x: this.x - this.direction * 18,
        y: this.y - 10,
        texture: "flame_enemy",
        vx: -this.direction * 160,
        vy: 0,
        range: 96,
        damage: 1,
        owner: "enemy"
      });
      this.nextAttackAt = time + 500;
    }
    if (this.phase === 2 && time >= this.nextSummonAt) {
      this.scene.spawnProjectile({ x: this.scene.worldWidth - 330, y: 212, texture: "tire_enemy", vx: 120, vy: 0, range: 320, damage: 1, owner: "enemy" });
      this.scene.spawnProjectile({ x: this.scene.worldWidth - 20, y: 212, texture: "tire_enemy", vx: -120, vy: 0, range: 320, damage: 1, owner: "enemy" });
      this.nextSummonAt = time + 2000;
    }
  }

  updateQueen(time) {
    this.body.setVelocity(0, 0);
    this.y = this.baseY + Math.sin((time / 3000) * Math.PI * 2) * 40;
    if (time >= this.nextAttackAt) {
      const angles = this.phase === 1 ? [0, Math.PI / 2, Math.PI, Math.PI * 1.5] : [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75];
      angles.forEach((angle) => {
        this.scene.spawnProjectile({
          x: this.x,
          y: this.y - 12,
          texture: "tentacle_enemy",
          vx: Math.cos(angle) * 170,
          vy: Math.sin(angle) * 170,
          range: 220,
          damage: 1,
          owner: "enemy"
        });
      });
      if (this.phase === 2) {
        this.scene.spawnInkClouds();
      }
      this.nextAttackAt = time + 2000;
    }
  }

  updateArchitect(time, player) {
    this.body.setVelocityX(this.phase === 1 ? Math.sin(time / 600) * 80 : Math.cos(time / 450) * 110);
    if (time >= this.nextAttackAt) {
      this.scene.spawnProjectile({ x: this.x, y: this.y - 12, texture: "homing_enemy", vx: 0, vy: 0, range: 320, damage: 1, owner: "enemy", homingTarget: player, homingSpeed: 120, lifespan: 3000 });
      this.scene.spawnProjectile({ x: this.x + 10, y: this.y - 12, texture: "homing_enemy", vx: 0, vy: 0, range: 320, damage: 1, owner: "enemy", homingTarget: player, homingSpeed: 120, lifespan: 3000 });
      this.scene.toggleArchitectPlatforms();
      this.nextAttackAt = time + 1500;
    }
    if (this.phase === 2 && time >= this.nextSummonAt) {
      this.scene.breakArenaTiles();
      this.nextSummonAt = time + 1800;
    }
  }

  hit(damage) {
    if (!this.active || this.isDefeated) {
      return false;
    }
    this.hp -= damage;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => this.active && this.clearTint());
    if (this.hp > 0) {
      return false;
    }
    this.isDefeated = true;
    this.body.enable = false;
    this.scene.scoreManager.bossDefeated(this.worldId, this.scene, this.x, this.y - 12);
    this.scene.onBossDefeated();
    this.destroy();
    return true;
  }
}

function applyCrt(scene) {
  const settings = scene.registry.get("settings") || DEFAULT_SETTINGS;
  if (scene.game.renderer?.gl && settings.video.chromaticAberration) {
    scene.cameras.main.setPostPipeline("CRTShader");
  }
}

function makeRectTexture(scene, key, width, height, fillColor, strokeColor) {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(fillColor, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.lineStyle(1, strokeColor, 1);
  graphics.strokeRect(0.5, 0.5, width - 1, height - 1);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    ensurePressStartFont();
    const storedSettings = (() => {
      try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.settings) || "null");
      } catch (error) {
        return null;
      }
    })();
    this.registry.set("settings", Phaser.Utils.Objects.Merge(clone(DEFAULT_SETTINGS), storedSettings || {}));
    this.registry.set("lang", this.registry.get("lang") || "en");
    this.registry.set("selectedCharacter", "GRAX");
    this.game.scoreManager = new ScoreManager(this.game);
    if (this.game.renderer?.gl && !this.game.renderer.pipelines.getPostPipeline("CRTShader")) {
      this.game.renderer.pipelines.addPostPipeline("CRTShader", CRTShaderPipeline);
    }
    this.createTextures();
    this.scene.start("MainMenuScene");
  }

  createTextures() {
    makeRectTexture(this, "platform", 16, 16, 0x5555ff, 0x000000);
    makeRectTexture(this, "platform_break", 16, 16, 0xaa00aa, 0x000000);
    makeRectTexture(this, "player_grax", 16, 24, 0xff5555, 0x000000);
    makeRectTexture(this, "player_zara", 16, 16, 0xffff55, 0x000000);
    makeRectTexture(this, "player_baron", 16, 24, 0xff55ff, 0x000000);
    makeRectTexture(this, "player_nynx", 16, 16, 0x555555, 0x000000);
    makeRectTexture(this, "enemy_grunbot", 16, 16, 0x55ff55, 0x000000);
    makeRectTexture(this, "enemy_shooter", 16, 16, 0x55ffff, 0x000000);
    makeRectTexture(this, "enemy_jumper", 16, 16, 0xffaa55, 0x000000);
    makeRectTexture(this, "enemy_turret", 16, 16, 0xaaaaaa, 0x000000);
    makeRectTexture(this, "boss_1", 32, 32, 0x55ffff, 0x000000);
    makeRectTexture(this, "boss_2", 32, 32, 0xaa55ff, 0x000000);
    makeRectTexture(this, "boss_3", 32, 32, 0xff5555, 0x000000);
    makeRectTexture(this, "boss_4", 32, 32, 0xffff55, 0x000000);
    makeRectTexture(this, "boss_5", 48, 48, 0xff55ff, 0x000000);
    makeRectTexture(this, "coinSmall", 8, 8, 0xffff55, 0x000000);
    makeRectTexture(this, "coinLarge", 10, 10, 0xffaa55, 0x000000);
    makeRectTexture(this, "gem", 10, 10, 0x55ffff, 0x000000);
    makeRectTexture(this, "portal", 32, 32, 0x55ffff, 0x000000);
    makeRectTexture(this, "shield", 32, 32, 0x55ffff, 0x000000);
    makeRectTexture(this, "decoy", 16, 16, 0xaaaaaa, 0x000000);
    makeRectTexture(this, "bolt_zara", 6, 6, 0xffff55, 0x000000);
    makeRectTexture(this, "orb_baron", 8, 8, 0xff55ff, 0x000000);
    makeRectTexture(this, "knife_nynx", 4, 4, 0xffffff, 0x000000);
    makeRectTexture(this, "bullet_enemy", 6, 6, 0xff5555, 0x000000);
    makeRectTexture(this, "orb_enemy", 8, 8, 0xaa00aa, 0x000000);
    makeRectTexture(this, "tentacle_enemy", 6, 6, 0x55ffff, 0x000000);
    makeRectTexture(this, "flame_enemy", 16, 8, 0xffaa55, 0x000000);
    makeRectTexture(this, "homing_enemy", 8, 8, 0xffffff, 0x000000);
    makeRectTexture(this, "tire_enemy", 8, 8, 0xaaaaaa, 0x000000);
    makeRectTexture(this, "star", 2, 2, 0xffffff, 0xffffff);
    makeRectTexture(this, "bubble", 4, 4, 0x55ffff, 0x000000);
  }
}

class MenuScene extends Phaser.Scene {
  createBackground() {
    applyCrt(this);
    this.add.rectangle(160, 120, 320, 240, 0x04040a);
    for (let i = 0; i < 40; i += 1) {
      this.add.image(Phaser.Math.Between(0, 320), Phaser.Math.Between(0, 240), "star").setAlpha(Phaser.Math.FloatBetween(0.4, 1));
    }
    this.add.text(160, 56, text(this.registry.get("lang"), "title"), { ...getTextStyle(20, "#FFFFFF", "center"), fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(160, 78, text(this.registry.get("lang"), "subtitle"), getTextStyle(8, "#FFFFFF", "center")).setOrigin(0.5);
  }
}

class MainMenuScene extends MenuScene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    this.inputManager = new InputManager(this);
    this.createBackground();
    this.selection = 0;
    this.buildMenu();
  }

  buildMenu() {
    const lang = this.registry.get("lang");
    this.items = [
      { label: text(lang, "startGame"), action: () => this.scene.start("CharacterSelectScene") },
      { label: text(lang, "highScores"), action: () => this.scene.start("HighScoreScene", { entryMode: false }) },
      { label: text(lang, "settings"), action: () => this.scene.start("SettingsScene", { returnScene: "MainMenuScene" }) },
      { label: `${text(lang, "language")}: ${lang.toUpperCase()}`, action: () => { this.registry.set("lang", lang === "en" ? "nl" : "en"); this.scene.restart(); } }
    ];
    if (this.optionTexts) {
      this.optionTexts.forEach((item) => item.destroy());
    }
    this.optionTexts = this.items.map((item, index) => this.add.text(160, 126 + index * 18, item.label, getTextStyle(8, index === this.selection ? "#55FFFF" : "#AAAAAA", "center")).setOrigin(0.5));
    this.add.text(160, 210, text(lang, "pressStart"), getTextStyle(8, "#AAAAAA", "center")).setOrigin(0.5);
  }

  update() {
    if (this.inputManager.justPressed("down")) {
      this.selection = (this.selection + 1) % this.items.length;
      this.buildMenu();
    }
    if (this.inputManager.justPressed("up")) {
      this.selection = (this.selection - 1 + this.items.length) % this.items.length;
      this.buildMenu();
    }
    if (this.inputManager.justPressed("confirm")) {
      this.items[this.selection].action();
    }
    this.inputManager.update();
  }
}

class CharacterSelectScene extends MenuScene {
  constructor() {
    super("CharacterSelectScene");
  }

  create() {
    this.inputManager = new InputManager(this);
    this.createBackground();
    this.characterIds = Object.keys(CHARACTERS);
    this.index = this.characterIds.indexOf(this.registry.get("selectedCharacter")) || 0;
    this.renderCharacter();
  }

  renderCharacter() {
    const lang = this.registry.get("lang");
    const id = this.characterIds[this.index];
    const definition = CHARACTERS[id];
    this.registry.set("selectedCharacter", id);
    this.children.list.filter((child) => child.getData && child.getData("heroCard")).forEach((child) => child.destroy());
    this.add.text(160, 108, text(lang, "selectHero"), getTextStyle(10, "#FFFFFF", "center")).setOrigin(0.5).setData("heroCard", true);
    this.add.image(160, 150, definition.texture).setScale(3).setData("heroCard", true);
    this.add.text(160, 184, text(lang, definition.name), getTextStyle(10, "#FFFF55", "center")).setOrigin(0.5).setData("heroCard", true);
    this.add.text(160, 198, text(lang, definition.desc), getTextStyle(7, "#FFFFFF", "center")).setOrigin(0.5).setData("heroCard", true);
    this.add.text(160, 214, text(lang, "characterHint"), getTextStyle(7, "#AAAAAA", "center")).setOrigin(0.5).setData("heroCard", true);
  }

  update() {
    if (this.inputManager.justPressed("left")) {
      this.index = (this.index - 1 + this.characterIds.length) % this.characterIds.length;
      this.renderCharacter();
    }
    if (this.inputManager.justPressed("right")) {
      this.index = (this.index + 1) % this.characterIds.length;
      this.renderCharacter();
    }
    if (this.inputManager.justPressed("back")) {
      this.scene.start("MainMenuScene");
    }
    if (this.inputManager.justPressed("confirm")) {
      const settings = this.registry.get("settings") || DEFAULT_SETTINGS;
      this.game.scoreManager.resetRun(settings, this.characterIds[this.index]);
      this.scene.start("WorldTransitionScene", { nextWorld: "World1Scene", worldIndex: 1 });
    }
    this.inputManager.update();
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super("SettingsScene");
  }

  create(data) {
    this.returnScene = data.returnScene || "MainMenuScene";
    this.inputManager = new InputManager(this);
    this.lang = this.registry.get("lang");
    this.settings = clone(this.registry.get("settings") || DEFAULT_SETTINGS);
    this.selection = 0;
    this.add.rectangle(160, 120, 320, 240, 0x000000, 0.85);
    this.titleText = this.add.text(160, 20, text(this.lang, "settings"), getTextStyle(14, "#FFFFFF", "center")).setOrigin(0.5);
    this.optionTexts = [];
    this.renderOptions();
  }

  saveAndExit() {
    this.registry.set("settings", this.settings);
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
    this.scene.start(this.returnScene);
  }

  changeValue(direction) {
    const definition = SETTING_DEFINITIONS[this.selection];
    const current = getSettingValue(this.settings, definition.path);
    let next = current;
    if (definition.type === "toggle") {
      next = !current;
    } else if (definition.type === "range") {
      next = Number((current + direction * definition.step).toFixed(2));
      next = Phaser.Math.Clamp(next, definition.min, definition.max);
    } else if (definition.type === "list") {
      const index = definition.options.indexOf(current);
      next = definition.options[(index + direction + definition.options.length) % definition.options.length];
    }
    setSettingValue(this.settings, definition.path, next);
    this.renderOptions();
  }

  renderOptions() {
    const lang = this.registry.get("lang");
    this.optionTexts.forEach((item) => item.destroy());
    this.optionTexts = SETTING_DEFINITIONS.slice(0, 12).map((definition, index) => {
      const value = getSettingValue(this.settings, definition.path);
      return this.add.text(18, 48 + index * 14, `${text(lang, definition.label)}: ${text(lang, String(value)) || String(value).toUpperCase()}`, getTextStyle(8, index === this.selection ? "#55FFFF" : "#AAAAAA"));
    });
    this.helpText?.destroy();
    this.helpText = this.add.text(160, 224, "LEFT / RIGHT CHANGE   Z SAVE   X BACK", getTextStyle(7, "#AAAAAA", "center")).setOrigin(0.5);
  }

  update() {
    if (this.inputManager.justPressed("down")) {
      this.selection = (this.selection + 1) % Math.min(12, SETTING_DEFINITIONS.length);
      this.renderOptions();
    }
    if (this.inputManager.justPressed("up")) {
      this.selection = (this.selection - 1 + Math.min(12, SETTING_DEFINITIONS.length)) % Math.min(12, SETTING_DEFINITIONS.length);
      this.renderOptions();
    }
    if (this.inputManager.justPressed("left")) {
      this.changeValue(-1);
    }
    if (this.inputManager.justPressed("right")) {
      this.changeValue(1);
    }
    if (this.inputManager.justPressed("confirm")) {
      this.saveAndExit();
    }
    if (this.inputManager.justPressed("back")) {
      this.scene.start(this.returnScene);
    }
    this.inputManager.update();
  }
}

class HighScoreScene extends Phaser.Scene {
  constructor() {
    super("HighScoreScene");
  }

  create(data) {
    this.entryMode = data.entryMode || false;
    this.worldReached = data.world || this.game.scoreManager.currentWorld;
    this.characterId = data.character || this.game.scoreManager.characterId;
    this.inputManager = new InputManager(this);
    this.lang = this.registry.get("lang");
    this.add.rectangle(160, 120, 320, 240, 0x04040a);
    this.add.text(160, 20, text(this.lang, "highScores"), getTextStyle(14, "#FFFFFF", "center")).setOrigin(0.5);

    if (this.entryMode) {
      this.letters = ["A", "A", "A"];
      this.entryIndex = 0;
      this.prompt = this.add.text(160, 56, text(this.lang, "initialsPrompt"), getTextStyle(8, "#AAAAAA", "center")).setOrigin(0.5);
      this.entryText = this.add.text(160, 84, this.letters.join(" "), getTextStyle(18, "#FFFF55", "center")).setOrigin(0.5);
    }

    this.scoreTexts = [];
    this.renderBoard();
  }

  renderBoard() {
    this.scoreTexts.forEach((item) => item.destroy());
    const scores = this.game.scoreManager.highScores;
    this.scoreTexts = Array.from({ length: 10 }).map((_, index) => {
      const entry = scores[index];
      const line = entry ? `${index + 1}. ${entry.initials} ${formatScore(entry.score)} W${entry.world} ${entry.character}` : `${index + 1}. ${text(this.lang, "noData")}`;
      return this.add.text(20, 112 + index * 11, line, getTextStyle(8, "#AAAAAA"));
    });
  }

  update() {
    if (!this.entryMode) {
      if (this.inputManager.justPressed("confirm") || this.inputManager.justPressed("back")) {
        this.scene.start("MainMenuScene");
      }
      this.inputManager.update();
      return;
    }

    if (this.inputManager.justPressed("up")) {
      const code = this.letters[this.entryIndex].charCodeAt(0);
      this.letters[this.entryIndex] = String.fromCharCode(code === 90 ? 65 : code + 1);
    }
    if (this.inputManager.justPressed("down")) {
      const code = this.letters[this.entryIndex].charCodeAt(0);
      this.letters[this.entryIndex] = String.fromCharCode(code === 65 ? 90 : code - 1);
    }
    if (this.inputManager.justPressed("right") || this.inputManager.justPressed("confirm")) {
      this.entryIndex += 1;
      if (this.entryIndex > 2) {
        this.game.scoreManager.submit(this.letters.join(""), this.worldReached, this.characterId);
        this.entryMode = false;
        this.prompt.destroy();
        this.entryText.destroy();
        this.renderBoard();
      }
    }
    if (this.entryMode) {
      this.entryText.setText(this.letters.map((letter, index) => index === this.entryIndex ? `[${letter}]` : letter).join(" "));
    }
    this.inputManager.update();
  }
}

class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create(data) {
    this.worldKey = data.worldKey;
    this.inputManager = new InputManager(this);
    this.selection = 0;
    this.lang = this.registry.get("lang");
    this.items = [
      { label: text(this.lang, "resume"), action: () => { this.scene.resume(this.worldKey); this.scene.resume("HUDScene"); this.scene.stop(); } },
      { label: text(this.lang, "settings"), action: () => this.scene.start("SettingsScene", { returnScene: this.worldKey }) },
      { label: text(this.lang, "quitToMenu"), action: () => { this.scene.stop(this.worldKey); this.scene.stop("HUDScene"); this.scene.start("MainMenuScene"); } }
    ];
    this.add.rectangle(160, 120, 320, 240, 0x000000, 0.8);
    this.add.text(160, 60, text(this.lang, "paused"), getTextStyle(14, "#FFFFFF", "center")).setOrigin(0.5);
    this.optionTexts = this.items.map((item, index) => this.add.text(160, 110 + index * 20, item.label, getTextStyle(8, index === this.selection ? "#55FFFF" : "#AAAAAA", "center")).setOrigin(0.5));
  }

  refresh() {
    this.optionTexts.forEach((textObject, index) => textObject.setColor(index === this.selection ? "#55FFFF" : "#AAAAAA"));
  }

  update() {
    if (this.inputManager.justPressed("down")) {
      this.selection = (this.selection + 1) % this.items.length;
      this.refresh();
    }
    if (this.inputManager.justPressed("up")) {
      this.selection = (this.selection - 1 + this.items.length) % this.items.length;
      this.refresh();
    }
    if (this.inputManager.justPressed("confirm")) {
      this.items[this.selection].action();
    }
    if (this.inputManager.justPressed("pause") || this.inputManager.justPressed("back")) {
      this.scene.resume(this.worldKey);
      this.scene.resume("HUDScene");
      this.scene.stop();
    }
    this.inputManager.update();
  }
}

class WorldTransitionScene extends Phaser.Scene {
  constructor() {
    super("WorldTransitionScene");
  }

  create(data) {
    this.nextWorld = data.nextWorld;
    this.worldIndex = data.worldIndex || 1;
    this.lang = this.registry.get("lang");
    this.add.rectangle(160, 120, 320, 240, 0x000000);
    this.add.text(160, 90, text(this.lang, "loadingWorld", { world: this.worldIndex }), getTextStyle(14, "#FFFFFF", "center")).setOrigin(0.5);
    this.add.rectangle(160, 126, 132, 12, 0x000000).setStrokeStyle(1, 0xffffff);
    this.bar = this.add.rectangle(96, 126, 0, 8, 0x55ffff).setOrigin(0, 0.5);
    this.tweens.addCounter({
      from: 0,
      to: 120,
      duration: 2000,
      onUpdate: (tween) => this.bar.width = tween.getValue(),
      onComplete: () => this.scene.start(this.nextWorld, { worldIndex: this.worldIndex })
    });
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  create(data) {
    this.inputManager = new InputManager(this);
    this.worldReached = data.worldReached;
    this.lang = this.registry.get("lang");
    this.add.rectangle(160, 120, 320, 240, 0x000000);
    this.add.text(160, 88, text(this.lang, "gameOver"), getTextStyle(16, "#FF5555", "center")).setOrigin(0.5);
    this.add.text(160, 116, formatScore(this.game.scoreManager.score), getTextStyle(12, "#FFFFFF", "center")).setOrigin(0.5);
    this.add.text(160, 148, text(this.lang, "continuePrompt"), getTextStyle(8, "#AAAAAA", "center")).setOrigin(0.5);
  }

  update() {
    if (this.inputManager.justPressed("confirm")) {
      if (this.game.scoreManager.qualifies()) {
        this.scene.start("HighScoreScene", { entryMode: true, world: this.worldReached, character: this.game.scoreManager.characterId });
      } else {
        this.scene.start("MainMenuScene");
      }
    }
    this.inputManager.update();
  }
}

class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  create() {
    this.inputManager = new InputManager(this);
    this.lang = this.registry.get("lang");
    this.add.rectangle(160, 120, 320, 240, 0x04040a);
    this.add.text(160, 86, text(this.lang, "escapedArcade"), getTextStyle(14, "#FFFFFF", "center")).setOrigin(0.5);
    this.add.text(160, 144, formatScore(this.game.scoreManager.score), getTextStyle(12, "#FFFF55", "center")).setOrigin(0.5);
    this.time.delayedCall(4000, () => this.scene.start("MainMenuScene"));
  }
}

class HUDScene extends Phaser.Scene {
  constructor() {
    super("HUDScene");
  }

  create() {
    this.lang = this.registry.get("lang");
    this.topBar = this.add.rectangle(160, 8, 320, 16, 0x000000, 0.9).setScrollFactor(0);
    this.bottomBar = this.add.rectangle(160, 236, 320, 8, 0x000000, 0.9).setScrollFactor(0);
    this.scoreText = this.add.text(6, 2, "", getTextStyle(8, "#FFFF55")).setScrollFactor(0);
    this.livesText = this.add.text(118, 2, "", getTextStyle(8, "#FFFF55")).setScrollFactor(0);
    this.worldText = this.add.text(314, 2, "", getTextStyle(8, "#FFFF55", "right")).setOrigin(1, 0).setScrollFactor(0);
    this.worldNameText = this.add.text(4, 228, "", getTextStyle(8, "#FFFF55")).setScrollFactor(0);
    this.timerText = this.add.text(316, 228, "", getTextStyle(8, "#FFFF55", "right")).setOrigin(1, 0).setScrollFactor(0);
    this.comboText = this.add.text(160, 228, "", getTextStyle(7, "#FFFF55", "center")).setOrigin(0.5, 0).setScrollFactor(0);
    this.bossBarFrame = this.add.rectangle(160, 220, 256, 8, 0x000000).setStrokeStyle(1, 0xffffff).setVisible(false).setScrollFactor(0);
    this.bossBar = this.add.rectangle(34, 220, 0, 6, 0xff55ff).setOrigin(0, 0.5).setVisible(false).setScrollFactor(0);
  }

  update() {
    const worldSceneKey = this.registry.get("activeWorldScene");
    const worldScene = worldSceneKey ? this.scene.get(worldSceneKey) : null;
    if (!worldScene || !worldScene.scene.isActive()) {
      return;
    }
    this.lang = this.registry.get("lang");
    this.scoreText.setText(`${text(this.lang, "score")} ${formatScore(this.game.scoreManager.score)}`);
    this.livesText.setText(`${text(this.lang, "lives")} ${Number.isFinite(this.game.scoreManager.lives) ? this.game.scoreManager.lives : "INF"}`);
    this.worldText.setText(`W${worldScene.world.id} ${text(this.lang, worldScene.world.name)}`);
    this.worldNameText.setText(text(this.lang, worldScene.world.name));
    const timerValue = worldScene.remainingSeconds === Number.POSITIVE_INFINITY ? "--" : String(Math.max(0, Math.ceil(worldScene.remainingSeconds))).padStart(3, "0");
    this.timerText.setText(`${text(this.lang, "time")} ${timerValue}`);
    this.timerText.setColor(worldScene.remainingSeconds !== Number.POSITIVE_INFINITY && worldScene.remainingSeconds <= 30 && Math.floor(this.time.now / 250) % 2 === 0 ? "#FF5555" : "#FFFF55");
    const showCombo = (this.registry.get("settings") || DEFAULT_SETTINGS).gameplay.showComboCounter;
    this.comboText.setText(showCombo && this.game.scoreManager.comboCount > 1 ? `${text(this.lang, "combo")} x${this.game.scoreManager.combo.toFixed(1)}` : "");
    if (worldScene.boss?.active) {
      this.bossBarFrame.setVisible(true);
      this.bossBar.setVisible(true);
      this.bossBar.width = 252 * (worldScene.boss.hp / worldScene.boss.maxHp);
    } else {
      this.bossBarFrame.setVisible(false);
      this.bossBar.setVisible(false);
    }
  }
}

class BaseWorldScene extends Phaser.Scene {
  constructor(key, worldId) {
    super(key);
    this.world = WORLDS.find((item) => item.id === worldId);
  }

  create(data = {}) {
    this.worldWidth = this.world.worldWidth;
    this.worldHeight = this.world.worldHeight || RESOLUTION.HEIGHT;
    this.registry.set("activeWorldScene", this.scene.key);
    this.settings = this.registry.get("settings") || DEFAULT_SETTINGS;
    this.difficulty = getDifficulty(this.settings);
    this.worldIndex = Phaser.Math.Clamp(data.worldIndex || this.world.id, 1, 3);
    this.worldScale = WORLD_SCALE_CONFIG[this.worldIndex] || WORLD_SCALE_CONFIG[1];
    this.inputManager = new InputManager(this);
    this.scoreManager = this.game.scoreManager;
    this.scoreManager.setWorld(this.world.id);
    this.scoreManager.scoreMultiplier = this.worldScale.scoreMultiplier;
    this.remainingSeconds = this.settings.gameplay.timerMode ? this.worldScale.timerDuration : Number.POSITIVE_INFINITY;
    this.lastTimerTick = 0;
    this.portalActive = false;
    this.gemsRequired = this.world.collectables.filter((item) => item.kind === "gem").length;
    this.gemsCollected = 0;
    this.inkClouds = [];

    this.physics.world.gravity.y = PHYSICS.gravity;
    this.cameras.main.setBackgroundColor(this.world.bg);
    applyCrt(this);
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.createBackdrop();
    this.platforms = this.physics.add.staticGroup();
    this.breakablePlatforms = [];
    this.world.platforms.forEach((platform) => {
      const texture = platform.w < 100 && this.world.id === 5 ? "platform_break" : "platform";
      const block = this.platforms.create(platform.x, platform.y, texture).setDisplaySize(platform.w, platform.h).refreshBody();
      if (texture === "platform_break") {
        this.breakablePlatforms.push(block);
      }
    });

    this.collectables = this.physics.add.staticGroup();
    this.world.collectables.forEach((item) => {
      const sprite = this.collectables.create(item.x, item.y, item.kind);
      sprite.collectKind = item.kind;
    });

    this.portal = this.physics.add.staticImage(this.world.portalX, 184, "portal").setVisible(false);
    this.portal.body.enable = false;
    this.tweens.add({ targets: this.portal, alpha: { from: 0.7, to: 1 }, scale: { from: 0.95, to: 1.05 }, yoyo: true, repeat: -1, duration: 360 });

    this.enemies = this.physics.add.group();
    const spawnCount = Math.ceil(this.world.enemies.length * this.worldScale.enemySpawnMultiplier);
    for (let index = 0; index < spawnCount; index += 1) {
      this.spawnEnemy(clone(this.world.enemies[index % this.world.enemies.length]));
    }
    this.projectiles = this.add.group({ runChildUpdate: true });
    this.effects = this.add.group();

    this.player = new Player(this, this.world.playerSpawn.x, this.world.playerSpawn.y, this.registry.get("selectedCharacter") || "GRAX");
    this.playerShield = this.add.image(this.player.x, this.player.y - 12, "shield").setVisible(false);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.collectables, (_, item) => this.collectItem(item));
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => player.takeDamage(1, enemy.x));
    this.physics.add.overlap(this.player, this.portal, () => {
      if (this.portalActive) {
        this.completeWorld();
      }
    });
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.scene.stop("HUDScene");
    this.scene.launch("HUDScene");

    this.boss = new Boss(this, this.world.boss);
    this.physics.add.overlap(this.player, this.boss, (player, boss) => player.takeDamage(1, boss.x));
    this.physics.add.collider(this.boss, this.platforms);
  }

  createBackdrop() {
    for (let i = 0; i < 48; i += 1) {
      const key = this.world.id === 4 ? "bubble" : "star";
      const image = this.add.image(Phaser.Math.Between(0, this.worldWidth), Phaser.Math.Between(18, 224), key).setScrollFactor(0.25 + Math.random() * 0.3);
      image.setAlpha(0.3 + Math.random() * 0.7);
    }
  }

  spawnEnemy(config) {
    const enemy = new Enemy(this, config);
    this.enemies.add(enemy);
    return enemy;
  }

  spawnProjectile(config) {
    const projectile = new Projectile(this, config);
    this.projectiles.add(projectile);
    this.physics.add.collider(projectile, this.platforms, (shot) => shot.destroy());
    if (config.owner === "player") {
      this.physics.add.overlap(projectile, this.enemies, (shot, enemy) => {
        enemy.hit(shot.damage, shot);
        shot.destroy();
      });
      if (this.boss?.active) {
        this.physics.add.overlap(projectile, this.boss, (shot, boss) => {
          if (boss.hit(shot.damage)) {
            shot.destroy();
            return;
          }
          shot.destroy();
        });
      }
    } else {
      this.physics.add.overlap(projectile, this.player, (shot, player) => {
        player.takeDamage(shot.damage, shot.x);
        shot.destroy();
      });
    }
    return projectile;
  }

  spawnHitbox(player, width, height, damage) {
    const hitbox = this.add.zone(player.x + player.facing * (width * 0.35), player.y - player.definition.height * 0.5, width, height);
    this.physics.add.existing(hitbox);
    hitbox.body.setAllowGravity(false);
    hitbox.body.moves = false;
    this.physics.add.overlap(hitbox, this.enemies, (_, enemy) => enemy.hit(damage, hitbox));
    if (this.boss?.active) {
      this.physics.add.overlap(hitbox, this.boss, (_, boss) => boss.hit(damage));
    }
    if (this.settings.gameplay.showHitboxes) {
      const debug = this.add.rectangle(hitbox.x, hitbox.y, width, height).setStrokeStyle(1, 0xff0000).setFillStyle(0xff0000, 0.15);
      this.effects.add(debug);
      this.time.delayedCall(PHYSICS.meleeDuration, () => debug.destroy());
    }
    this.time.delayedCall(PHYSICS.meleeDuration, () => hitbox.destroy());
  }

  spawnShockwave(x, y, width, height) {
    const wave = this.add.zone(x, y, width, height);
    this.physics.add.existing(wave);
    wave.body.setAllowGravity(false);
    wave.body.moves = false;
    this.physics.add.overlap(wave, this.enemies, (_, enemy) => {
      enemy.hit(1, wave);
      enemy.body.setVelocityY(-200);
    });
    if (this.boss?.active) {
      this.physics.add.overlap(wave, this.boss, (_, boss) => boss.hit(1));
    }
    const flash = this.add.rectangle(x, y, width, height, 0xffffff, 0.3);
    this.time.delayedCall(120, () => {
      wave.destroy();
      flash.destroy();
    });
  }

  spawnDecoy(x, y) {
    const decoy = this.add.image(x, y, "decoy").setAlpha(0.6);
    this.time.delayedCall(1000, () => decoy.destroy());
  }

  showShield(player) {
    this.playerShield.setVisible(true);
    this.playerShield.setPosition(player.x, player.y - 12);
  }

  hideShield() {
    this.playerShield.setVisible(false);
  }

  spawnInkClouds() {
    this.inkClouds.forEach((cloud) => cloud.destroy());
    this.inkClouds = [0, 1, 2].map((index) => {
      const cloud = this.add.rectangle(this.worldWidth - 220 + index * 50, 130 + index * 18, 32, 32, 0x000000, 0.7);
      this.time.delayedCall(4000, () => cloud.destroy());
      return cloud;
    });
  }

  toggleArchitectPlatforms() {
    this.breakablePlatforms.forEach((platform, index) => platform.setVisible(Math.floor(this.time.now / 150) % 2 === index % 2));
  }

  breakArenaTiles() {
    const available = this.breakablePlatforms.filter((platform) => platform.active && platform.visible);
    const pick = Phaser.Utils.Array.GetRandom(available);
    if (pick) {
      pick.setVisible(false);
      pick.body.enable = false;
    }
  }

  collectItem(item) {
    item.destroy();
    this.scoreManager.addCollect(item.collectKind, this, item.x, item.y);
    if (item.collectKind === "gem") {
      this.gemsCollected += 1;
    }
    this.tryActivatePortal();
  }

  tryActivatePortal() {
    if (!this.portalActive && this.gemsCollected >= this.gemsRequired && (!this.boss || !this.boss.active)) {
      this.portalActive = true;
      this.portal.setVisible(true);
      this.portal.body.enable = true;
    }
  }

  onBossDefeated() {
    this.tryActivatePortal();
    if (this.settings.video.screenShake) {
      this.cameras.main.shake(220, 0.01);
    }
  }

  spawnFloatingText(label, x, y, color) {
    const floating = this.add.text(x, y, label, getTextStyle(7, color, "center")).setOrigin(0.5);
    this.tweens.add({
      targets: floating,
      y: y - 14,
      alpha: 0,
      duration: 800,
      onComplete: () => floating.destroy()
    });
  }

  handlePlayerDeath() {
    const lives = this.scoreManager.loseLife();
    if (this.settings.video.screenShake) {
      this.cameras.main.shake(260, 0.015);
    }
    this.player.disableBody(true, true);
    this.time.delayedCall(700, () => {
      if (lives === 0) {
        this.scene.stop("HUDScene");
        this.scene.start("GameOverScene", { worldReached: this.world.id });
      } else {
        this.scene.restart();
      }
    });
  }

  completeWorld() {
    this.scoreManager.completeWorld(Math.max(0, Math.floor(this.remainingSeconds)));
    this.scene.stop("HUDScene");
    if (this.world.id === 3) {
      this.scene.start("EndingScene");
    } else {
      this.scene.start("WorldTransitionScene", { nextWorld: this.world.nextWorldScene, worldIndex: this.world.id + 1 });
    }
  }

  update(time, delta) {
    if (this.inputManager.justPressed("pause")) {
      this.scene.pause();
      this.scene.pause("HUDScene");
      this.scene.launch("PauseScene", { worldKey: this.scene.key });
      return;
    }

    if (this.remainingSeconds !== Number.POSITIVE_INFINITY && time - this.lastTimerTick >= 1000) {
      this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
      this.lastTimerTick = time;
      if (this.remainingSeconds === 0) {
        this.handlePlayerDeath();
      }
    }

    this.player.update(time, delta);
    if (this.player.shieldActive) {
      this.playerShield.setPosition(this.player.x, this.player.y - 12);
    }
    Phaser.Actions.Call(this.enemies.getChildren(), (enemy) => enemy.active && enemy.update(time, delta));
    if (this.boss?.active) {
      this.boss.update(time, delta);
    }
    this.tryActivatePortal();
    this.inputManager.update();
  }
}

class World1Scene extends BaseWorldScene {
  constructor() { super("World1Scene", 1); }
}
class World2Scene extends BaseWorldScene {
  constructor() { super("World2Scene", 2); }
}
class World3Scene extends BaseWorldScene {
  constructor() { super("World3Scene", 3); }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-shell",
  width: RESOLUTION.WIDTH,
  height: RESOLUTION.HEIGHT,
  backgroundColor: "#000000",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: RESOLUTION.WIDTH,
    height: RESOLUTION.HEIGHT
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: PHYSICS.gravity },
      debug: false
    }
  },
  scene: [
    BootScene,
    MainMenuScene,
    CharacterSelectScene,
    SettingsScene,
    HighScoreScene,
    PauseScene,
    GameOverScene,
    EndingScene,
    WorldTransitionScene,
    HUDScene,
    World1Scene,
    World2Scene,
    World3Scene
  ]
};

const game = new Phaser.Game(config);
window.pixelJumperGame = game;

function syncCrtOverlay() {
  const wrapper = document.getElementById("game-shell");
  const overlay = document.getElementById("crt-overlay");
  const canvas = wrapper?.querySelector("canvas:not(#crt-overlay)");
  if (!wrapper || !overlay || !canvas) {
    requestAnimationFrame(syncCrtOverlay);
    return;
  }
  const settings = game.registry.get("settings") || DEFAULT_SETTINGS;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (overlay.width !== width || overlay.height !== height) {
    overlay.width = width;
    overlay.height = height;
  }
  overlay.style.display = settings.video.crtScanlines || settings.video.crtVignette ? "block" : "none";
  canvas.style.filter = settings.video.phosphorBloom ? "blur(0.6px) brightness(1.08)" : "none";
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  if (settings.video.crtScanlines) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    for (let y = 0; y < height; y += 2) {
      ctx.fillRect(0, y, width, 1);
    }
  }
  if (settings.video.crtVignette) {
    const gradient = ctx.createRadialGradient(width * 0.5, height * 0.45, width * 0.08, width * 0.5, height * 0.5, width * 0.68);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  requestAnimationFrame(syncCrtOverlay);
}

window.addEventListener("load", () => requestAnimationFrame(syncCrtOverlay));
