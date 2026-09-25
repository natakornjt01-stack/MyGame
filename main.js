import Phaser from 'phaser';
import stage1 from './stages/stage1.js';
import stage2 from './stages/stage2.js';

// ERROR DETECTOR
window.addEventListener('error', function(event) {
    console.error(event.error || event.message);
    document.body.innerHTML = `
        <div style="background:#111;color:#ff5555;padding:20px;font-family:monospace;font-size:16px;white-space:pre-wrap;word-break:break-word;min-height:100vh;box-sizing:border-box;">
            <h1 style="color:#ff3333;">❌ GAME ERROR</h1>
            <div>${event.error ? event.error.stack : event.message}</div><br>
            <div>File:<br>${event.filename || 'Unknown'}</div><br>
            <div>Line:<br>${event.lineno || 'Unknown'}</div><br>
            <div>Column:<br>${event.colno || 'Unknown'}</div>
        </div>
    `;
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
});

// CONFIG
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
const WORLD_WIDTH = 3600;
const WORLD_HEIGHT = 450;
const WORLD_GRAVITY = 700;
const PLAYER_MAX_FALL_SPEED = 650;

// PLAYER
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 95;
const POWER_PLAYER_WIDTH = 105;
const POWER_PLAYER_HEIGHT = 125;
const HITBOX_WIDTH = 44;
const HITBOX_HEIGHT = 80;
const GROUND_Y = 400;
const PLAYER_SPEED = 200;
const JUMP_POWER = 360;

// ATTACK
const PLAYER_NORMAL_ATTACK_DAMAGE = 25;
const PLAYER_POWER_ATTACK_DAMAGE = 50;
const PLAYER_ATTACK_DISTANCE = 95;
const PLAYER_ATTACK_COOLDOWN = 400;

// HP
const PLAYER_MAX_HP = 100;
const ENEMY_DAMAGE = 10;
const PLAYER_INVULNERABLE_TIME = 800;

// POWER
const PLAYER_POWER_MAX_HP = 200;
const PLAYER_POWER_BONUS_HP = 100;
const PLAYER_POWER_DURATION = 10000;

// ENEMY
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 55;
const ENEMY_SPEED = 70;
const ENEMY_DETECT_DISTANCE = 300;
const ENEMY_LOSE_DISTANCE = 400;
const ENEMY_MAX_HP = 50;
const ENEMY_EXP_REWARD = 50;

// LEVEL
const PLAYER_START_LEVEL = 1;
const PLAYER_START_EXP_REQUIRED = 100;
const PLAYER_EXP_INCREASE_PER_LEVEL = 50;
const PLAYER_LEVEL_UP_HP_BONUS = 10;
const PLAYER_MAX_LEVEL = -1;

// COIN
const COIN_SIZE = 32;
const COIN_VALUE = 1;

// COIN DROP
const COIN_DROP_CHANCE = 0.80;
const COIN_DROP_MIN = 3;
const COIN_DROP_MAX = 5;
const COIN_DROP_MIN_X_SPEED = 80;
const COIN_DROP_MAX_X_SPEED = 180;
const COIN_DROP_MIN_Y_SPEED = 220;
const COIN_DROP_MAX_Y_SPEED = 320;
const COIN_DROP_BOUNCE = 0.45;
const COIN_DROP_DRAG_X = 100;
const COIN_DROP_LIFETIME = 20000;

// COIN MAGNET
const COIN_MAGNET_ENABLED = true;
const COIN_MAGNET_RADIUS = 90;
const COIN_MAGNET_SPEED = 550;
const COIN_AUTO_PICKUP_DISTANCE = 28;

// CHECKPOINT
const CHECKPOINT_WIDTH = 36;
const CHECKPOINT_HEIGHT = 90;
const CHECKPOINT_GLOW_RADIUS = 28;

// DEATH
const DEATH_RESPAWN_DELAY = 1000;

// UI
const HP_UI_X = 145;
const HP_UI_Y = 55;
const HP_BAR_WIDTH = 170;
const HP_BAR_HEIGHT = 16;
const HP_FILL_WIDTH = 164;

const POWER_UI_X = 330;
const POWER_UI_Y = 55;
const POWER_BAR_WIDTH = 170;
const POWER_BAR_HEIGHT = 16;
const POWER_FILL_WIDTH = 164;

const EXP_UI_X = 560;
const EXP_UI_Y = 55;
const EXP_BAR_WIDTH = 170;
const EXP_BAR_HEIGHT = 16;
const EXP_FILL_WIDTH = 164;

const UI_TEXT_SIZE = '13px';
const UI_TEXT_COLOR = '#ffffff';
const UI_TEXT_STROKE = '#000000';
const UI_TEXT_STROKE_WIDTH = 4;

// GLOBAL
let player = null;
let playerVisual = null;
let platforms = null;
let enemies = null;
let coins = null;
let coinDrops = null;
let checkpoints = null;
let cursors = null;
let leftButton = null;
let rightButton = null;
let jumpButton = null;
let attackButton = null;
let powerButton = null;

// STAGE
let currentStage = stage1;
let currentStageNumber = 1;
let stageTransitioning = false;

// INPUT STATE
let leftPressed = false;
let rightPressed = false;
let jumpPressed = false;
let attackPressed = false;
let powerPressed = false;

// PLAYER STATE
let playerHP = PLAYER_MAX_HP;
let coinCount = 0;
let playerFacing = 1;
let lastAttackTime = 0;
let lastDamageTime = 0;
let gameOver = false;
let attackEffect = null;

// DEATH UI
let deathText = null;
let respawnText = null;

// CHECKPOINT
let activeCheckpoint = 0;
let checkpointX = 200;
let checkpointY = GROUND_Y - HITBOX_HEIGHT / 2;

// LEVEL
let playerLevel = PLAYER_START_LEVEL;
let playerEXP = 0;
let playerEXPRequired = PLAYER_START_EXP_REQUIRED;

// POWER
let playerPowered = false;
let powerEndTime = 0;

// UI REFERENCES
let hpBar = null;
let hpText = null;
let coinText = null;
let powerBar = null;
let powerText = null;
let powerBarBackground = null;
let levelText = null;
let expBarBackground = null;
let expBar = null;
let expText = null;
let checkpointText = null;

// GAME SCENE
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    // PRELOAD
    preload() {
        this.load.image('idle1', '/idle1.png');
        this.load.image('idle2', '/idle2.png');
        this.load.image('idle3', '/idle3.png');
        this.load.image('idle4', '/idle4.png');

        this.load.image('walk1', '/walk1.png');
        this.load.image('walk2', '/walk2.png');
        this.load.image('walk3', '/walk3.png');
        this.load.image('walk4', '/walk4.png');
        this.load.image('walk5', '/walk5.png');
        this.load.image('walk6', '/walk6.png');

        this.load.image('power', '/power.png');
    }

    // CREATE
    create(data = {}) {
        // STAGE DATA
        const requestedStage = Number(data.stage || 1);
        if (requestedStage === 2) {
            currentStage = stage2;
            currentStageNumber = 2;
        } else {
            currentStage = stage1;
            currentStageNumber = 1;
        }
        stageTransitioning = false;

        // PLAYER PROGRESS
        if (data.keepProgress) {
            playerHP = Number.isFinite(data.playerHP) ? data.playerHP : PLAYER_MAX_HP;
            coinCount = Number.isFinite(data.coinCount) ? data.coinCount : 0;
            playerLevel = Number.isFinite(data.playerLevel) ? data.playerLevel : PLAYER_START_LEVEL;
            playerEXP = Number.isFinite(data.playerEXP) ? data.playerEXP : 0;
            playerEXPRequired = Number.isFinite(data.playerEXPRequired) ? data.playerEXPRequired : PLAYER_START_EXP_REQUIRED;
        } else {
            playerHP = PLAYER_MAX_HP;
            coinCount = 0;
            playerLevel = PLAYER_START_LEVEL;
            playerEXP = 0;
            playerEXPRequired = PLAYER_START_EXP_REQUIRED;
        }

        // RESET INPUT
        leftPressed = false;
        rightPressed = false;
        jumpPressed = false;
        attackPressed = false;
        powerPressed = false;

        // RESET STATE
        playerFacing = 1;
        lastAttackTime = 0;
        lastDamageTime = 0;
        gameOver = false;
        attackEffect = null;
        deathText = null;
        respawnText = null;
        playerPowered = false;
        powerEndTime = 0;

        // RESET CHECKPOINT
        activeCheckpoint = 0;
        checkpointX = 200;
        checkpointY = GROUND_Y - HITBOX_HEIGHT / 2;

        // MULTI TOUCH
        this.input.addPointer(3);

        // WORLD BOUNDS
        this.physics.world.setBounds(0, 0, currentStage.worldWidth, currentStage.worldHeight);
        this.cameras.main.setBounds(0, 0, currentStage.worldWidth, currentStage.worldHeight);

        // BACKGROUND
        this.createForestBackground();

        // PLATFORMS
        platforms = this.physics.add.staticGroup();
        currentStage.platforms.forEach((platformData) => {
            this.createPlatform(platformData.x, platformData.y, platformData.width, platformData.height);
        });

        // PLAYER ANIMATION
        this.createPlayerAnimations();

        // PLAYER HITBOX
        player = this.add.rectangle(200, GROUND_Y - HITBOX_HEIGHT / 2, HITBOX_WIDTH, HITBOX_HEIGHT, 0xffffff, 0);
        this.physics.add.existing(player);
        player.body.setSize(HITBOX_WIDTH, HITBOX_HEIGHT);
        player.body.setOffset(0, 0);
        player.body.setCollideWorldBounds(true);
        player.body.setMaxVelocityY(PLAYER_MAX_FALL_SPEED);

        // PLAYER VISUAL
        playerVisual = this.add.sprite(200, GROUND_Y - PLAYER_HEIGHT / 2, 'idle1');
        playerVisual.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        playerVisual.setDepth(10);
        playerVisual.play('player-idle');

        // PLAYER / PLATFORM COLLISION
        this.physics.add.collider(player, platforms);

        // COINS
        coins = this.physics.add.group({ allowGravity: false, immovable: true, collideWorldBounds: true });
        this.createCoins();
        this.physics.add.overlap(player, coins, this.collectCoin, null, this);

        // COIN DROPS
        coinDrops = this.physics.add.group({ allowGravity: true, collideWorldBounds: true });
        this.physics.add.collider(coinDrops, platforms);
        this.physics.add.overlap(player, coinDrops, this.collectCoin, null, this);

        // ENEMIES
        enemies = this.physics.add.group();
        currentStage.enemies.forEach((enemyData) => {
            this.createEnemy(enemyData.x, enemyData.y);
        });
        this.physics.add.collider(enemies, platforms);
        this.physics.add.collider(player, enemies, this.handlePlayerEnemyCollision, null, this);

        // CHECKPOINTS
        checkpoints = this.physics.add.staticGroup();
        currentStage.checkpoints.forEach((checkpointData) => {
            this.createCheckpoint(checkpointData.x, checkpointData.index);
        });
        this.physics.add.overlap(player, checkpoints, this.activateCheckpoint, null, this);

        // KEYBOARD
        cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.powerKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // CAMERA
        this.cameras.main.startFollow(player, true, 0.08, 0.08);

        // GAME TITLE
        this.add.text(20, 15, 'FOREST ADVENTURE', {
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(100);

        // UI
        this.createHPUI();
        this.createPowerUI();
        this.createEXPUI();
        this.createCoinUI();
        this.createCheckpointUI();

        // MOBILE CONTROLS
        this.createMobileControls();

        // DEBUG LOG
        console.log('CURRENT STAGE:', currentStage.id, currentStage.name);
        console.log('WORLD WIDTH:', currentStage.worldWidth);
        console.log('PLATFORMS:', currentStage.platforms.length);
        console.log('ENEMIES:', currentStage.enemies.length);
        console.log('COINS:', currentStage.coins.length);
        console.log('CHECKPOINTS:', currentStage.checkpoints.length);
        console.log('LEVEL:', playerLevel);
        console.log('EXP:', playerEXP, '/', playerEXPRequired);
        console.log('EXP per enemy:', ENEMY_EXP_REWARD);
    }

    // UPDATE
    update() {
        if (!player || !player.body) return;

        // CHECK STAGE COMPLETE
        if (!gameOver && !stageTransitioning) {
            this.checkStageComplete();
        }

        // PLAYER VISUAL FOLLOW HITBOX
        playerVisual.x = player.x;
        const currentVisualHeight = playerPowered ? POWER_PLAYER_HEIGHT : PLAYER_HEIGHT;
        playerVisual.y = player.y - (currentVisualHeight - HITBOX_HEIGHT) / 2;

        // COINS
        this.updateCoins();

        // POWER TIMER
        if (playerPowered && !gameOver) {
            const remaining = powerEndTime - Date.now();
            if (remaining <= 0) {
                this.endPowerMode();
            } else {
                this.updatePowerUI();
            }
        }

        // GAME OVER
        if (gameOver) {
            player.body.setVelocityX(0);
            return;
        }

        // DAMAGE FLASH
        if (Date.now() - lastDamageTime < PLAYER_INVULNERABLE_TIME) {
            const flash = Math.floor(Date.now() / 100) % 2 === 0;
            playerVisual.setTint(flash ? 0xff5555 : 0xffffff);
        } else {
            playerVisual.clearTint();
        }

        // KEYBOARD MOVEMENT
        const keyboardLeft = cursors.left.isDown;
        const keyboardRight = cursors.right.isDown;

        if (keyboardLeft || leftPressed) {
            player.body.setVelocityX(-PLAYER_SPEED);
            playerFacing = -1;
            playerVisual.setFlipX(true);
            if (!playerPowered) this.playWalkAnimation();
        } else if (keyboardRight || rightPressed) {
            player.body.setVelocityX(PLAYER_SPEED);
            playerFacing = 1;
            playerVisual.setFlipX(false);
            if (!playerPowered) this.playWalkAnimation();
        } else {
            player.body.setVelocityX(0);
            if (!playerPowered) this.playIdleAnimation();
        }

        // JUMP
        const onGround = player.body.blocked.down || player.body.touching.down;
        if (jumpPressed && onGround) {
            player.body.setVelocityY(-JUMP_POWER);
            jumpPressed = false;
        } else if (!onGround) {
            jumpPressed = false;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) && onGround) {
            player.body.setVelocityY(-JUMP_POWER);
        }

        // ATTACK
        if (attackPressed) {
            attackPressed = false;
            this.attackPlayer();
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.attackPlayer();
        }

        // POWER
        if (powerPressed) {
            powerPressed = false;
            this.activatePower();
        }

        if (Phaser.Input.Keyboard.JustDown(this.powerKey)) {
            this.activatePower();
        }

        // ENEMY AI
        this.updateEnemies();
    }

    // STAGE SYSTEM
    checkStageComplete() {
        if (currentStageNumber >= 2) return;
        if (!player || !player.active) return;

        const finishX = currentStage.worldWidth - 100;
        if (player.x >= finishX) {
            this.completeStage();
        }
    }

    completeStage() {
        if (stageTransitioning) return;
        stageTransitioning = true;

        player.body.setVelocity(0, 0);
        player.body.setEnable(false);
        playerVisual.anims.stop();

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, `STAGE ${currentStageNumber} CLEAR!`, {
            fontFamily: 'monospace',
            fontSize: '42px',
            fontStyle: 'bold',
            color: '#7dd3fc',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 25, currentStageNumber < 2 ? 'NEXT STAGE...' : 'GAME COMPLETE!', {
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

        this.cameras.main.flash(500, 255, 255, 255);

        this.time.delayedCall(1500, () => {
            if (currentStageNumber >= 2) {
                console.log('GAME COMPLETE');
                return;
            }
            const nextStage = currentStageNumber + 1;
            console.log('STAGE CLEAR:', currentStageNumber);
            console.log('NEXT STAGE:', nextStage);

            this.scene.restart({
                stage: nextStage,
                keepProgress: true,
                playerHP: playerHP,
                coinCount: coinCount,
                playerLevel: playerLevel,
                playerEXP: playerEXP,
                playerEXPRequired: playerEXPRequired
            });
        });
    }

    // COIN UPDATE
    updateCoins() {
        if (coins) {
            coins.getChildren().forEach((coin) => {
                if (!coin || !coin.active || !coin.body) return;
                this.updateCoinMagnet(coin);
                if (coin.coinSymbol) {
                    coin.coinSymbol.x = coin.x;
                    coin.coinSymbol.y = coin.y;
                    coin.coinSymbol.rotation = coin.rotation;
                }
            });
        }

        if (coinDrops) {
            coinDrops.getChildren().forEach((coin) => {
                if (!coin || !coin.active || !coin.body) return;
                this.updateCoinMagnet(coin);
                if (coin.coinSymbol) {
                    coin.coinSymbol.x = coin.x;
                    coin.coinSymbol.y = coin.y;
                    coin.coinSymbol.rotation = coin.rotation;
                }
            });
        }
    }

    // COIN MAGNET
    updateCoinMagnet(coin) {
        if (!COIN_MAGNET_ENABLED || !player || !player.active || coin.collected) return;

        const distance = Phaser.Math.Distance.Between(coin.x, coin.y, player.x, player.y);
        if (!coin.magnetized && distance <= COIN_MAGNET_RADIUS) {
            coin.magnetized = true;
            if (coin.body) coin.body.setVelocity(0, 0);
            this.createCoinMagnetEffect(coin);
        }

        if (coin.magnetized && coin.body) {
            const dx = player.x - coin.x;
            const dy = player.y - coin.y;
            const magnetDistance = Math.sqrt(dx * dx + dy * dy);

            if (magnetDistance <= COIN_AUTO_PICKUP_DISTANCE) {
                this.collectCoin(player, coin);
                return;
            }

            if (magnetDistance > 0) {
                coin.body.setVelocity(
                    (dx / magnetDistance) * COIN_MAGNET_SPEED,
                    (dy / magnetDistance) * COIN_MAGNET_SPEED
                );
            }
        }
    }

    createCoinMagnetEffect(coin) {
        if (!coin || !coin.active) return;
        const ring = this.add.circle(coin.x, coin.y, 16, 0xffd84a, 0);
        ring.setStrokeStyle(2, 0xfff2a0, 0.9);
        ring.setDepth(12);

        this.tweens.add({
            targets: ring,
            radius: 26,
            alpha: 0,
            duration: 220,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    // CHECKPOINT
    createCheckpoint(x, index) {
        const groundTop = GROUND_Y;
        const checkpoint = this.add.rectangle(x, groundTop - CHECKPOINT_HEIGHT / 2, CHECKPOINT_WIDTH, CHECKPOINT_HEIGHT, 0xffffff, 0);
        this.physics.add.existing(checkpoint, true);

        checkpoint.checkpointIndex = index;
        checkpoint.checkpointX = x;
        checkpoint.checkpointY = groundTop - HITBOX_HEIGHT / 2;
        checkpoint.setVisible(false);
        checkpoints.add(checkpoint);

        const pole = this.add.rectangle(x, groundTop - 45, 7, 90, 0x6b4423).setDepth(5);
        const flagColor = index <= activeCheckpoint ? 0x38d9ff : 0xffd84a;
        const flag = this.add.triangle(x + 25, groundTop - 72, 0, 0, 35, 12, 0, 24, flagColor).setOrigin(0, 0.5).setDepth(6);

        const label = this.add.text(x, groundTop - 105, `CP ${index}`, {
            fontFamily: 'monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(20);

        const glow = this.add.circle(x, groundTop - 45, CHECKPOINT_GLOW_RADIUS, flagColor, 0.10).setDepth(4);

        checkpoint.pole = pole;
        checkpoint.flag = flag;
        checkpoint.label = label;
        checkpoint.glow = glow;

        this.tweens.add({
            targets: flag,
            scaleX: 1.08,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return checkpoint;
    }

    activateCheckpoint(playerObject, checkpoint) {
        if (gameOver || !checkpoint || !checkpoint.active) return;

        const index = checkpoint.checkpointIndex;
        if (index <= activeCheckpoint) return;

        activeCheckpoint = index;
        checkpointX = checkpoint.checkpointX;
        checkpointY = checkpoint.checkpointY;

        checkpoints.getChildren().forEach((cp) => {
            if (!cp || !cp.active) return;
            const active = cp.checkpointIndex <= activeCheckpoint;
            if (cp.flag) cp.flag.setFillStyle(active ? 0x38d9ff : 0xffd84a);
            if (cp.glow) {
                cp.glow.setFillStyle(active ? 0x38d9ff : 0xffd84a);
                cp.glow.setAlpha(active ? 0.18 : 0.10);
            }
        });

        this.updateCheckpointUI();
        this.createCheckpointEffect(checkpoint);

        const checkpointMessage = this.add.text(checkpoint.x, checkpoint.y - 70, 'CHECKPOINT!', {
            fontFamily: 'monospace',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#38d9ff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: checkpointMessage,
            y: checkpoint.y - 120,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => checkpointMessage.destroy()
        });

        console.log('CHECKPOINT ACTIVATED:', activeCheckpoint);
        console.log('RESPAWN X:', checkpointX);
        console.log('RESPAWN Y:', checkpointY);
    }

    createCheckpointEffect(checkpoint) {
        if (!checkpoint) return;
        const ring = this.add.circle(checkpoint.x, checkpoint.y, 20, 0x38d9ff, 0.20);
        ring.setStrokeStyle(5, 0x7dd3fc, 1);
        ring.setDepth(50);

        this.tweens.add({
            targets: ring,
            radius: 75,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });

        const flash = this.add.circle(checkpoint.x, checkpoint.y, 35, 0xffffff, 0.25);
        flash.setDepth(49);

        this.tweens.add({
            targets: flash,
            radius: 90,
            alpha: 0,
            duration: 450,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
    }

    createCheckpointUI() {
        checkpointText = this.add.text(220, 78, 'CHECKPOINT: 0', {
            fontFamily: 'monospace',
            fontSize: '13px',
            fontStyle: 'bold',
            color: '#38d9ff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(102);

        this.updateCheckpointUI();
    }

    updateCheckpointUI() {
        if (checkpointText) {
            checkpointText.setText(`CHECKPOINT: ${activeCheckpoint}`);
        }
    }

    // POWER
    activatePower() {
        if (gameOver || playerPowered) return;

        playerHP = Phaser.Math.Clamp(playerHP + PLAYER_POWER_BONUS_HP, 0, PLAYER_POWER_MAX_HP);
        playerPowered = true;
        powerEndTime = Date.now() + PLAYER_POWER_DURATION;

        playerVisual.anims.stop();
        playerVisual.setTexture('power');
        playerVisual.setDisplaySize(POWER_PLAYER_WIDTH, POWER_PLAYER_HEIGHT);
        playerVisual.x = player.x;
        playerVisual.y = player.y - (POWER_PLAYER_HEIGHT - HITBOX_HEIGHT) / 2;

        this.updateHPUI();
        this.updatePowerUI();

        if (powerButton) {
            powerButton.setAlpha(0.35);
            if (powerButton.label) powerButton.label.setAlpha(0.45);
        }

        this.createPowerActivationEffect();
        console.log('POWER ACTIVATED');
    }

    endPowerMode() {
        if (!playerPowered) return;

        const calculatedMaxHP = PLAYER_MAX_HP + (playerLevel - PLAYER_START_LEVEL) * PLAYER_LEVEL_UP_HP_BONUS;
        playerHP = Math.min(playerHP, calculatedMaxHP);
        playerPowered = false;
        powerEndTime = 0;

        playerVisual.setTexture('idle1');
        playerVisual.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        playerVisual.x = player.x;
        playerVisual.y = player.y - (PLAYER_HEIGHT - HITBOX_HEIGHT) / 2;

        const moving = leftPressed || rightPressed || cursors.left.isDown || cursors.right.isDown;
        if (moving) {
            this.playWalkAnimation();
        } else {
            this.playIdleAnimation();
        }

        this.updateHPUI();
        this.updatePowerUI();

        if (powerButton) {
            powerButton.setAlpha(0.65);
            if (powerButton.label) powerButton.label.setAlpha(1);
        }

        this.createPowerEndEffect();
    }

    createPowerActivationEffect() {
        const ring = this.add.circle(player.x, player.y, 35, 0x8b5cf6, 0.25);
        ring.setStrokeStyle(5, 0xd8b4fe, 1);
        ring.setDepth(25);

        this.tweens.add({
            targets: ring,
            radius: 90,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    createPowerEndEffect() {
        const ring = this.add.circle(player.x, player.y, 70, 0x8b5cf6, 0);
        ring.setStrokeStyle(5, 0xffffff, 1);
        ring.setDepth(25);

        this.tweens.add({
            targets: ring,
            radius: 25,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.easeIn',
            onComplete: () => ring.destroy()
        });
    }

    // PLAYER ANIMATION
    createPlayerAnimations() {
        if (!this.anims.exists('player-idle')) {
            this.anims.create({
                key: 'player-idle',
                frames: [{ key: 'idle1' }, { key: 'idle2' }, { key: 'idle3' }, { key: 'idle4' }],
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('player-walk')) {
            this.anims.create({
                key: 'player-walk',
                frames: [{ key: 'walk1' }, { key: 'walk2' }, { key: 'walk3' }, { key: 'walk4' }, { key: 'walk5' }, { key: 'walk6' }],
                frameRate: 10,
                repeat: -1
            });
        }
    }

    playIdleAnimation() {
        if (playerPowered) return;
        if (playerVisual.anims.currentAnim?.key !== 'player-idle') {
            playerVisual.play('player-idle');
        }
    }

    playWalkAnimation() {
        if (playerPowered) return;
        if (playerVisual.anims.currentAnim?.key !== 'player-walk') {
            playerVisual.play('player-walk');
        }
    }

    // PLATFORM
    createPlatform(x, y, width, height) {
        const platform = this.add.rectangle(x, y, width, height, 0x18851c);
        platform.setOrigin(0.5);
        this.physics.add.existing(platform, true);
        platforms.add(platform);
        return platform;
    }

    // BACKGROUND
    createForestBackground() {
        this.add.rectangle(currentStage.worldWidth / 2, GAME_HEIGHT / 2, currentStage.worldWidth, GAME_HEIGHT, 0x87CEEB).setDepth(-20);
        this.add.circle(350, 90, 45, 0xffd83d).setDepth(-10);

        currentStage.treePositions.forEach((x) => {
            this.add.rectangle(x, 370, 30, 80, 0x7b3f12).setDepth(-5);
            this.add.circle(x, 310, 55, 0x238b23).setDepth(-6);
            this.add.circle(x - 35, 330, 38, 0x2f8f4e).setDepth(-6);
            this.add.circle(x + 35, 330, 38, 0x2f8f4e).setDepth(-6);
        });
    }

    // COINS
    createCoins() {
        if (!currentStage || !currentStage.coins) return;
        currentStage.coins.forEach((coinData) => {
            this.createCoin(coinData.x, coinData.y);
        });
    }

    createCoin(x, y) {
        const coin = this.add.circle(x, y, COIN_SIZE / 2, 0xffc928);
        coin.setStrokeStyle(3, 0xffa500);
        coin.setDepth(8);

        const symbol = this.add.text(x, y, '$', {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#9b6500',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(9);

        coin.coinSymbol = symbol;
        coin.coinValue = COIN_VALUE;
        coin.collected = false;
        coin.magnetized = false;
        coin.isDrop = false;

        this.physics.add.existing(coin);
        if (coin.body && coin.body.setCircle) {
            coin.body.setCircle(COIN_SIZE / 2);
            coin.body.setAllowGravity(false);
            coin.body.setImmovable(true);
            coin.body.setCollideWorldBounds(true);
        }

        coins.add(coin);

        this.tweens.add({
            targets: coin,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        return coin;
    }

    // COIN DROP
    dropCoinsFromEnemy(x, y) {
        if (Math.random() > COIN_DROP_CHANCE) return;
        const amount = Phaser.Math.Between(COIN_DROP_MIN, COIN_DROP_MAX);

        for (let i = 0; i < amount; i++) {
            this.createCoinDrop(x, y - 20, i, amount);
        }
        this.createCoinDropBurst(x, y);
    }

    createCoinDrop(x, y, index = 0, total = 1) {
        const coin = this.add.circle(x, y, COIN_SIZE / 2, 0xffc928);
        coin.setStrokeStyle(3, 0xffa500);
        coin.setDepth(8);

        const symbol = this.add.text(x, y, '$', {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#9b6500',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(9);

        coin.coinSymbol = symbol;
        coin.coinValue = COIN_VALUE;
        coin.collected = false;
        coin.magnetized = false;
        coin.isDrop = true;

        this.physics.add.existing(coin);
        if (coin.body && coin.body.setCircle) {
            coin.body.setCircle(COIN_SIZE / 2);
            coin.body.setAllowGravity(true);
            coin.body.setImmovable(false);
            coin.body.setBounce(COIN_DROP_BOUNCE);
            coin.body.setCollideWorldBounds(true);
            coin.body.setDragX(COIN_DROP_DRAG_X);
            coin.body.setMaxVelocity(600, 700);
        }

        coinDrops.add(coin);

        let direction = index % 2 === 0 ? -1 : 1;
        if (total === 1) direction = Phaser.Math.RND.pick([-1, 1]);

        const xSpeed = Phaser.Math.Between(COIN_DROP_MIN_X_SPEED, COIN_DROP_MAX_X_SPEED);
        const ySpeed = Phaser.Math.Between(COIN_DROP_MIN_Y_SPEED, COIN_DROP_MAX_Y_SPEED);

        coin.body.setVelocity(direction * xSpeed, -ySpeed);
        coin.setAngle(Phaser.Math.Between(-20, 20));
        coin.setScale(0.35);
        symbol.setScale(0.35);

        this.tweens.add({
            targets: [coin, symbol],
            scaleX: 1,
            scaleY: 1,
            duration: 180,
            ease: 'Back.out'
        });

        this.tweens.add({
            targets: [coin, symbol],
            angle: Phaser.Math.Between(-180, 180),
            duration: 500,
            ease: 'Cubic.easeOut'
        });

        if (COIN_DROP_LIFETIME > 0) {
            coin.expireTimer = this.time.delayedCall(COIN_DROP_LIFETIME, () => {
                if (coin && coin.active && !coin.collected) {
                    this.removeCoin(coin);
                }
            });
        }

        return coin;
    }

    createCoinDropBurst(x, y) {
        const ring = this.add.circle(x, y, 12, 0xffd84a, 0.15);
        ring.setStrokeStyle(3, 0xfff1a0, 1);
        ring.setDepth(15);

        this.tweens.add({
            targets: ring,
            radius: 48,
            alpha: 0,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    // COLLECT COIN
    collectCoin(playerObject, coin) {
        if (!coin || !coin.active || coin.collected) return;

        coin.collected = true;
        if (coin.expireTimer) {
            coin.expireTimer.remove();
            coin.expireTimer = null;
        }

        if (coin.body) {
            coin.body.stop();
            this.physics.world.disableBody(coin.body);
        }

        if (coin.coinSymbol) {
            coin.coinSymbol.setVisible(false);
        }

        const value = coin.coinValue || COIN_VALUE;
        coinCount += value;
        this.updateCoinUI();

        const collectText = this.add.text(coin.x, coin.y - 10, `+${value}`, {
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#fff6a0',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: collectText,
            y: coin.y - 50,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => collectText.destroy()
        });

        this.tweens.add({
            targets: coin,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 180,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (coin.coinSymbol) {
                    coin.coinSymbol.destroy();
                    coin.coinSymbol = null;
                }
                coin.destroy();
            }
        });
    }

    removeCoin(coin) {
        if (!coin || !coin.active) return;

        coin.collected = true;
        if (coin.expireTimer) {
            coin.expireTimer.remove();
            coin.expireTimer = null;
        }

        if (coin.body) {
            coin.body.stop();
            this.physics.world.disableBody(coin.body);
        }

        if (coin.coinSymbol) {
            coin.coinSymbol.destroy();
            coin.coinSymbol = null;
        }

        this.tweens.add({
            targets: coin,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 180,
            onComplete: () => {
                if (coin && coin.active) {
                    coin.destroy();
                }
            }
        });
    }

    // ENEMY
    createEnemy(x, y) {
        const enemy = this.add.rectangle(x, y, ENEMY_WIDTH, ENEMY_HEIGHT, 0xaa2222).setDepth(7);
        this.physics.add.existing(enemy);

        enemy.body.setSize(ENEMY_WIDTH, ENEMY_HEIGHT);
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setMaxVelocityY(PLAYER_MAX_FALL_SPEED);
        enemy.body.setVelocityX(ENEMY_SPEED);

        enemy.hp = ENEMY_MAX_HP;
        enemy.direction = 1;
        enemy.speed = ENEMY_SPEED;
        enemy.spawnX = x;
        enemy.patrolDistance = 180;
        enemy.isChasing = false;

        enemy.label = this.add.text(x, y - 48, 'ENEMY', {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(20);

        enemy.hpBarBackground = this.add.rectangle(x, y - 38, 46, 6, 0x222222).setDepth(20);
        enemy.hpBar = this.add.rectangle(x - 21, y - 38, 42, 4, 0xff3333).setOrigin(0, 0.5).setDepth(21);

        enemies.add(enemy);
        return enemy;
    }

    // ENEMY AI
    updateEnemies() {
        if (!enemies) return;

        enemies.getChildren().forEach((enemy) => {
            if (!enemy || !enemy.active || !enemy.body) return;

            const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (distance <= ENEMY_DETECT_DISTANCE) enemy.isChasing = true;
            if (distance >= ENEMY_LOSE_DISTANCE) enemy.isChasing = false;

            if (enemy.isChasing) {
                if (player.x < enemy.x) {
                    enemy.direction = -1;
                    enemy.body.setVelocityX(-enemy.speed);
                } else {
                    enemy.direction = 1;
                    enemy.body.setVelocityX(enemy.speed);
                }
            } else {
                const leftLimit = enemy.spawnX - enemy.patrolDistance;
                const rightLimit = enemy.spawnX + enemy.patrolDistance;

                if (enemy.x <= leftLimit) enemy.direction = 1;
                if (enemy.x >= rightLimit) enemy.direction = -1;

                enemy.body.setVelocityX(enemy.direction * enemy.speed);
            }

            if (enemy.label) {
                enemy.label.x = enemy.x;
                enemy.label.y = enemy.y - 48;
            }

            if (enemy.hpBarBackground) {
                enemy.hpBarBackground.x = enemy.x;
                enemy.hpBarBackground.y = enemy.y - 38;
            }

            if (enemy.hpBar) {
                enemy.hpBar.x = enemy.x - 21;
                enemy.hpBar.y = enemy.y - 38;
                const percent = Phaser.Math.Clamp(enemy.hp / ENEMY_MAX_HP, 0, 1);
                enemy.hpBar.displayWidth = 42 * percent;
            }
        });
    }

    // ATTACK
    attackPlayer() {
        if (gameOver) return;

        const now = Date.now();
        if (now - lastAttackTime < PLAYER_ATTACK_COOLDOWN) return;

        lastAttackTime = now;
        this.createAttackEffect();

        const attackDamage = playerPowered ? PLAYER_POWER_ATTACK_DAMAGE : PLAYER_NORMAL_ATTACK_DAMAGE;

        enemies.getChildren().forEach((enemy) => {
            if (!enemy || !enemy.active || !enemy.body) return;

            const dx = enemy.x - player.x;
            const dy = Math.abs(enemy.y - player.y);
            const distance = Math.abs(dx);

            if (distance > PLAYER_ATTACK_DISTANCE || dy > 70) return;
            if (playerFacing === 1 && dx < 0) return;
            if (playerFacing === -1 && dx > 0) return;

            this.damageEnemy(enemy, attackDamage);
        });
    }

    // ATTACK EFFECT
    createAttackEffect() {
        if (attackEffect && attackEffect.active) {
            attackEffect.destroy();
        }

        const x = player.x + playerFacing * 48;
        const y = player.y - 5;

        attackEffect = this.add.arc(
            x, y, 45,
            playerFacing === 1 ? -70 : 110,
            playerFacing === 1 ? 70 : 250,
            false, 0xffffff, 0
        );

        attackEffect.setStrokeStyle(8, 0xffffff, 1);
        attackEffect.setDepth(30);

        this.tweens.add({
            targets: attackEffect,
            scaleX: 1.25,
            alpha: 0,
            duration: 180,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (attackEffect) {
                    attackEffect.destroy();
                    attackEffect = null;
                }
            }
        });
    }

    // DAMAGE ENEMY
    damageEnemy(enemy, damage) {
        if (!enemy || !enemy.active) return;

        enemy.hp -= damage;
        if (enemy.hpBar) {
            const percent = Phaser.Math.Clamp(enemy.hp / ENEMY_MAX_HP, 0, 1);
            enemy.hpBar.displayWidth = 42 * percent;
        }

        enemy.setFillStyle(0xffffff);
        this.time.delayedCall(100, () => {
            if (enemy && enemy.active) enemy.setFillStyle(0xaa2222);
        });

        if (enemy.body) {
            enemy.body.setVelocityX(playerFacing * 180);
            enemy.body.setVelocityY(-150);
        }

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    // KILL ENEMY
    killEnemy(enemy) {
        if (!enemy || !enemy.active) return;

        const deathX = enemy.x;
        const deathY = enemy.y;

        this.addEXP(ENEMY_EXP_REWARD, deathX, deathY);

        if (enemy.body) {
            this.physics.world.disableBody(enemy.body);
        }

        enemy.active = false;
        this.dropCoinsFromEnemy(deathX, deathY);

        if (enemy.label) { enemy.label.destroy(); enemy.label = null; }
        if (enemy.hpBar) { enemy.hpBar.destroy(); enemy.hpBar = null; }
        if (enemy.hpBarBackground) { enemy.hpBarBackground.destroy(); enemy.hpBarBackground = null; }

        this.tweens.add({
            targets: enemy,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            onComplete: () => enemy.destroy()
        });
    }

    // EXP
    addEXP(amount, x, y) {
        if (gameOver || amount <= 0) return;

        if (PLAYER_MAX_LEVEL > 0 && playerLevel >= PLAYER_MAX_LEVEL) {
            playerEXP = playerEXPRequired;
            this.updateEXPUI();
            return;
        }

        playerEXP += amount;
        console.log(`+${amount} EXP`);

        if (x !== undefined && y !== undefined) {
            const expGainText = this.add.text(x, y - 65, `+${amount} EXP`, {
                fontFamily: 'monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#7dd3fc',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(60);

            this.tweens.add({
                targets: expGainText,
                y: y - 105,
                alpha: 0,
                duration: 700,
                ease: 'Cubic.easeOut',
                onComplete: () => expGainText.destroy()
            });
        }

        while (playerEXP >= playerEXPRequired) {
            playerEXP -= playerEXPRequired;
            this.levelUp();
        }

        this.updateEXPUI();
    }

    // LEVEL UP
    levelUp() {
        if (PLAYER_MAX_LEVEL > 0 && playerLevel >= PLAYER_MAX_LEVEL) {
            playerEXP = playerEXPRequired;
            return;
        }

        playerLevel++;
        playerEXPRequired += PLAYER_EXP_INCREASE_PER_LEVEL;

        const newMaxHP = PLAYER_MAX_HP + (playerLevel - PLAYER_START_LEVEL) * PLAYER_LEVEL_UP_HP_BONUS;
        playerHP = Math.min(
            playerHP + PLAYER_LEVEL_UP_HP_BONUS,
            playerPowered ? PLAYER_POWER_MAX_HP : newMaxHP
        );

        this.updateHPUI();
        this.updateEXPUI();
        this.createLevelUpEffect();

        console.log('LEVEL UP!');
        console.log('LEVEL:', playerLevel);
        console.log('NEXT EXP:', playerEXPRequired);
        console.log('MAX HP:', newMaxHP);
    }

    createLevelUpEffect() {
        const ring = this.add.circle(player.x, player.y, 30, 0x38bdf8, 0.25);
        ring.setStrokeStyle(5, 0x7dd3fc, 1);
        ring.setDepth(80);

        this.tweens.add({
            targets: ring,
            radius: 100,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });

        const levelUpText = this.add.text(player.x, player.y - 75, `LEVEL UP!\nLEVEL ${playerLevel}`, {
            fontFamily: 'monospace',
            fontSize: '24px',
            fontStyle: 'bold',
            align: 'center',
            color: '#7dd3fc',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(90);

        this.tweens.add({
            targets: levelUpText,
            y: player.y - 130,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => levelUpText.destroy()
        });

        playerVisual.setTint(0x7dd3fc);
        this.time.delayedCall(300, () => {
            if (playerVisual && playerVisual.active) playerVisual.clearTint();
        });

        this.cameras.main.flash(180, 100, 200, 255);
    }

    // PLAYER / ENEMY COLLISION
    handlePlayerEnemyCollision(playerObject, enemy) {
        if (gameOver || !enemy || !enemy.active) return;
        this.damagePlayer(enemy);
    }

    // DAMAGE PLAYER
    damagePlayer(enemy) {
        if (gameOver) return;

        const now = Date.now();
        if (now - lastDamageTime < PLAYER_INVULNERABLE_TIME) return;

        lastDamageTime = now;
        playerHP -= ENEMY_DAMAGE;
        playerHP = Math.max(0, playerHP);

        this.updateHPUI();

        if (enemy && enemy.active && enemy.x < player.x) {
            player.body.setVelocityX(250);
        } else {
            player.body.setVelocityX(-250);
        }
        player.body.setVelocityY(-250);

        this.cameras.main.shake(120, 0.008);

        if (playerHP <= 0) {
            this.killPlayer();
        }
    }

    // DEATH
    killPlayer() {
        if (gameOver) return;
        gameOver = true;

        if (player.body) {
            player.body.setVelocity(0, 0);
            this.physics.world.disableBody(player.body);
        }

        playerVisual.anims.stop();
        playerVisual.setTint(0xff3333);

        if (deathText) { deathText.destroy(); deathText = null; }
        if (respawnText) { respawnText.destroy(); respawnText = null; }

        deathText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'YOU DIED', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ff3333',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        respawnText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35, 'RESPAWNING...', {
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.time.delayedCall(DEATH_RESPAWN_DELAY, () => {
            this.respawnPlayer();
        });
    }

    // RESPAWN
    respawnPlayer() {
        if (!player || !player.body) return;

        if (deathText) { deathText.destroy(); deathText = null; }
        if (respawnText) { respawnText.destroy(); respawnText = null; }

        // RE-ENABLE PHYSICS
        this.physics.world.enable(player);
        player.body.setEnable(true);
        player.body.setSize(HITBOX_WIDTH, HITBOX_HEIGHT);
        player.body.setOffset(0, 0);
        player.body.setCollideWorldBounds(true);
        player.body.setMaxVelocityY(PLAYER_MAX_FALL_SPEED);
        player.body.reset(checkpointX, checkpointY);
        player.body.setVelocity(0, 0);

        player.x = checkpointX;
        player.y = checkpointY;

        // RESET HP
        playerHP = PLAYER_MAX_HP + (playerLevel - PLAYER_START_LEVEL) * PLAYER_LEVEL_UP_HP_BONUS;
        playerPowered = false;
        powerEndTime = 0;
        lastDamageTime = Date.now();

        // RESET VISUAL
        playerVisual.anims.stop();
        playerVisual.setTexture('idle1');
        playerVisual.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
        playerVisual.clearTint();
        playerVisual.setFlipX(playerFacing === -1);
        playerVisual.x = checkpointX;
        playerVisual.y = checkpointY - (PLAYER_HEIGHT - HITBOX_HEIGHT) / 2;
        playerVisual.play('player-idle');

        // GAME OVER OFF
        gameOver = false;

        this.updateHPUI();
        this.updatePowerUI();

        if (powerButton) {
            powerButton.setAlpha(0.65);
            if (powerButton.label) powerButton.label.setAlpha(1);
        }

        // CAMERA
        this.cameras.main.startFollow(player, true, 0.08, 0.08);
        this.cameras.main.flash(250, 255, 255, 255);

        // RESPAWN EFFECT
        const respawnEffect = this.add.circle(checkpointX, checkpointY, 25, 0x38d9ff, 0.25);
        respawnEffect.setStrokeStyle(4, 0x7dd3fc, 1);
        respawnEffect.setDepth(50);

        this.tweens.add({
            targets: respawnEffect,
            radius: 70,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => respawnEffect.destroy()
        });

        console.log('RESPAWN:', checkpointX, checkpointY, 'CHECKPOINT:', activeCheckpoint);
        console.log('PLAYER BODY ENABLE:', player.body.enable);
    }

    // HP UI
    createHPUI() {
        this.add.rectangle(HP_UI_X, HP_UI_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x222222).setScrollFactor(0).setDepth(100);

        hpBar = this.add.rectangle(HP_UI_X - HP_BAR_WIDTH / 2 + 3, HP_UI_Y, HP_FILL_WIDTH, 10, 0x27d83d)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        hpText = this.add.text(HP_UI_X, HP_UI_Y, `HP ${playerHP} / ${PLAYER_MAX_HP}`, {
            fontFamily: 'monospace',
            fontSize: UI_TEXT_SIZE,
            fontStyle: 'bold',
            color: UI_TEXT_COLOR,
            stroke: UI_TEXT_STROKE,
            strokeThickness: UI_TEXT_STROKE_WIDTH
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.updateHPUI();
    }

    updateHPUI() {
        if (!hpBar || !hpText) return;

        const calculatedMaxHP = PLAYER_MAX_HP + (playerLevel - PLAYER_START_LEVEL) * PLAYER_LEVEL_UP_HP_BONUS;
        const maxHP = playerPowered ? PLAYER_POWER_MAX_HP : calculatedMaxHP;
        const percent = Phaser.Math.Clamp(playerHP / maxHP, 0, 1);

        hpBar.displayWidth = HP_FILL_WIDTH * percent;
        hpBar.setFillStyle(playerPowered ? 0xa855f7 : 0x27d83d);

        hpText.setText(`HP ${playerHP} / ${maxHP}`);
        hpText.x = HP_UI_X;
        hpText.y = HP_UI_Y;
    }

    // POWER UI
    createPowerUI() {
        powerBarBackground = this.add.rectangle(POWER_UI_X, POWER_UI_Y, POWER_BAR_WIDTH, POWER_BAR_HEIGHT, 0x222222).setScrollFactor(0).setDepth(100);

        powerBar = this.add.rectangle(POWER_UI_X - POWER_BAR_WIDTH / 2 + 3, POWER_UI_Y, POWER_FILL_WIDTH, 10, 0xa855f7)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        powerText = this.add.text(POWER_UI_X, POWER_UI_Y, 'POWER', {
            fontFamily: 'monospace',
            fontSize: UI_TEXT_SIZE,
            fontStyle: 'bold',
            color: UI_TEXT_COLOR,
            stroke: UI_TEXT_STROKE,
            strokeThickness: UI_TEXT_STROKE_WIDTH
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.updatePowerUI();
    }

    updatePowerUI() {
        if (!powerBar || !powerText) return;

        if (!playerPowered) {
            powerBar.displayWidth = POWER_FILL_WIDTH;
            powerText.setText('POWER');
            powerText.x = POWER_UI_X;
            powerText.y = POWER_UI_Y;
            return;
        }

        const remaining = Math.max(0, powerEndTime - Date.now());
        const seconds = remaining / 1000;
        const percent = Phaser.Math.Clamp(remaining / PLAYER_POWER_DURATION, 0, 1);

        powerBar.displayWidth = POWER_FILL_WIDTH * percent;
        powerText.setText(`POWER ${seconds.toFixed(1)}s`);
        powerText.x = POWER_UI_X;
        powerText.y = POWER_UI_Y;
    }

    // EXP UI
    createEXPUI() {
        levelText = this.add.text(EXP_UI_X - 82, EXP_UI_Y - 17, `LV ${playerLevel}`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#7dd3fc',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        expBarBackground = this.add.rectangle(EXP_UI_X, EXP_UI_Y, EXP_BAR_WIDTH, EXP_BAR_HEIGHT, 0x222222).setScrollFactor(0).setDepth(100);

        expBar = this.add.rectangle(EXP_UI_X - EXP_BAR_WIDTH / 2 + 3, EXP_UI_Y, EXP_FILL_WIDTH, 10, 0x38bdf8)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        expText = this.add.text(EXP_UI_X, EXP_UI_Y, `EXP ${playerEXP} / ${playerEXPRequired}`, {
            fontFamily: 'monospace',
            fontSize: UI_TEXT_SIZE,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: UI_TEXT_STROKE_WIDTH
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.updateEXPUI();
    }

    updateEXPUI() {
        if (!expBar || !expText || !levelText) return;

        const percent = Phaser.Math.Clamp(playerEXP / playerEXPRequired, 0, 1);
        expBar.displayWidth = EXP_FILL_WIDTH * percent;

        levelText.setText(`LV ${playerLevel}`);
        levelText.x = EXP_UI_X - 82;
        levelText.y = EXP_UI_Y - 17;

        expText.setText(`EXP ${playerEXP} / ${playerEXPRequired}`);
        expText.x = EXP_UI_X;
        expText.y = EXP_UI_Y;
    }

    // COIN UI
    createCoinUI() {
        this.add.circle(25, 88, 9, 0xffc928).setScrollFactor(0).setDepth(100);

        this.add.text(48, 78, 'COIN:', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(101);

        coinText = this.add.text(105, 78, '0', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#fff6a0',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(101);

        this.updateCoinUI();
    }

    updateCoinUI() {
        if (coinText) {
            coinText.setText(String(coinCount));
        }
    }

    // MOBILE CONTROLS
    createMobileControls() {
        leftButton = this.createControlButton(90, 370, 100, 70, '◀');
        rightButton = this.createControlButton(210, 370, 100, 70, '▶');

        powerButton = this.createControlButton(450, 370, 100, 80, 'POWER');
        powerButton.label.setFontSize(20);

        attackButton = this.createControlButton(575, 370, 100, 80, '⚔');
        jumpButton = this.createControlButton(710, 370, 100, 80, 'โดด');

        // LEFT
        leftButton.on('pointerdown', () => { leftPressed = true; });
        leftButton.on('pointerup', () => { leftPressed = false; });
        leftButton.on('pointerupoutside', () => { leftPressed = false; });
        leftButton.on('pointerout', () => { leftPressed = false; });

        // RIGHT
        rightButton.on('pointerdown', () => { rightPressed = true; });
        rightButton.on('pointerup', () => { rightPressed = false; });
        rightButton.on('pointerupoutside', () => { rightPressed = false; });
        rightButton.on('pointerout', () => { rightPressed = false; });

        // POWER
        powerButton.on('pointerdown', () => { powerPressed = true; });
        powerButton.on('pointerup', () => { powerPressed = false; });
        powerButton.on('pointerupoutside', () => { powerPressed = false; });

        // JUMP
        jumpButton.on('pointerdown', () => { jumpPressed = true; });
        jumpButton.on('pointerup', () => { jumpPressed = false; });
        jumpButton.on('pointerupoutside', () => { jumpPressed = false; });

        // ATTACK
        attackButton.on('pointerdown', () => { attackPressed = true; });
        attackButton.on('pointerup', () => { attackPressed = false; });
        attackButton.on('pointerupoutside', () => { attackPressed = false; });
    }

    // CONTROL BUTTON
    createControlButton(x, y, width, height, text) {
        const button = this.add.rectangle(x, y, width, height, 0x222222, 0.65);
        button.setInteractive({ useHandCursor: false });
        button.setScrollFactor(0);
        button.setDepth(100);

        const label = this.add.text(x, y, text, {
            fontFamily: 'sans-serif',
            fontSize: 30,
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        button.label = label;

        button.on('pointerdown', () => {
            button.setAlpha(0.85);
        });

        button.on('pointerup', () => {
            button.setAlpha(button === powerButton && playerPowered ? 0.35 : 0.65);
        });

        button.on('pointerupoutside', () => {
            button.setAlpha(button === powerButton && playerPowered ? 0.35 : 0.65);
        });

        return button;
    }
}

// PHASER CONFIG
const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: WORLD_GRAVITY },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: GameScene
};

// START GAME
new Phaser.Game(config);
