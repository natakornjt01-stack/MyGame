// =====================================================
// FOREST ADVENTURE
// SINGLE FILE VERSION
// Phaser + Vite
// =====================================================

import Phaser from 'phaser';

// =====================================================
// ERROR DETECTOR
// =====================================================

window.addEventListener('error', function (event) {

console.error(event.error || event.message);

document.body.innerHTML = `
    <div style="
        background:#111;
        color:#ff5555;
        padding:20px;
        font-family:monospace;
        font-size:16px;
        white-space:pre-wrap;
        word-break:break-word;
        min-height:100vh;
        box-sizing:border-box;
    ">
        <h1 style="color:#ff3333;">
            ❌ GAME ERROR
        </h1>

        <div>
            ${event.error ? event.error.stack : event.message}
        </div>

        <br>

        <div>
            File:<br>
            ${event.filename || 'Unknown'}
        </div>

        <br>

        <div>
            Line:<br>
            ${event.lineno || 'Unknown'}
        </div>

        <br>

        <div>
            Column:<br>
            ${event.colno || 'Unknown'}
        </div>
    </div>
`;

});

window.addEventListener('unhandledrejection', function (event) {
console.error('Unhandled Promise Rejection:', event.reason);
});

// =====================================================
// GAME CONFIG
// =====================================================

const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 450;

// =====================================================
// PLAYER CONFIG
// =====================================================

const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 95;

const HITBOX_WIDTH = 44;
const HITBOX_HEIGHT = 80;

const GROUND_Y = 400;

const PLAYER_SPEED = 200;
const JUMP_POWER = 600;

// =====================================================
// ATTACK CONFIG
// =====================================================

const PLAYER_ATTACK_DAMAGE = 25;
const PLAYER_ATTACK_DISTANCE = 95;
const PLAYER_ATTACK_COOLDOWN = 400;

// =====================================================
// PLAYER HP CONFIG
// =====================================================

const PLAYER_MAX_HP = 100;

const ENEMY_DAMAGE = 10;

const PLAYER_INVULNERABLE_TIME = 800;

// =====================================================
// ENEMY CONFIG
// =====================================================

const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 55;

const ENEMY_SPEED = 70;

const ENEMY_DETECT_DISTANCE = 300;
const ENEMY_LOSE_DISTANCE = 400;

const ENEMY_MAX_HP = 50;

const ENEMY_COIN_REWARD = 5;

// =====================================================
// COIN CONFIG
// =====================================================

const COIN_SIZE = 32;
const COIN_VALUE = 1;

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let player = null;
let playerVisual = null;

let platforms = null;
let enemies = null;
let coins = null;

let cursors = null;

let leftButton = null;
let rightButton = null;
let jumpButton = null;
let attackButton = null;

let leftPressed = false;
let rightPressed = false;

let jumpPressed = false;
let attackPressed = false;

let playerHP = PLAYER_MAX_HP;
let coinCount = 0;

let playerFacing = 1;

let lastAttackTime = 0;
let lastDamageTime = 0;

let gameOver = false;

let attackEffect = null;

// =====================================================
// UI
// =====================================================

let hpBar = null;
let hpText = null;

let coinText = null;

// =====================================================
// PHASER SCENE
// =====================================================

class GameScene extends Phaser.Scene {

constructor() {
    super('GameScene');
}


// =================================================
// PRELOAD
// =================================================

preload() {

    // -----------------------------
    // IDLE
    // -----------------------------

    this.load.image('idle1', '/idle1.png');
    this.load.image('idle2', '/idle2.png');
    this.load.image('idle3', '/idle3.png');
    this.load.image('idle4', '/idle4.png');


    // -----------------------------
    // WALK
    // -----------------------------

    this.load.image('walk1', '/walk1.png');
    this.load.image('walk2', '/walk2.png');
    this.load.image('walk3', '/walk3.png');
    this.load.image('walk4', '/walk4.png');
    this.load.image('walk5', '/walk5.png');
    this.load.image('walk6', '/walk6.png');


    // -----------------------------
    // POWER
    // -----------------------------

    this.load.image('power', '/power.png');
}


// =================================================
// CREATE
// =================================================

create() {

    // -----------------------------
    // RESET GAME STATE
    // -----------------------------

    playerHP = PLAYER_MAX_HP;
    coinCount = 0;

    leftPressed = false;
    rightPressed = false;

    jumpPressed = false;
    attackPressed = false;

    playerFacing = 1;

    lastAttackTime = 0;
    lastDamageTime = 0;

    gameOver = false;

    attackEffect = null;


    // -----------------------------
    // POINTERS
    // -----------------------------

    this.input.addPointer(3);


    // -----------------------------
    // WORLD
    // -----------------------------

    this.physics.world.setBounds(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT
    );


    // -----------------------------
    // CAMERA
    // -----------------------------

    this.cameras.main.setBounds(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT
    );


    // -----------------------------
    // BACKGROUND
    // -----------------------------

    this.createForestBackground();


    // -----------------------------
    // PLATFORMS
    // -----------------------------

    platforms = this.physics.add.staticGroup();

    this.createPlatform(
        400,
        425,
        800,
        50
    );

    this.createPlatform(
        1200,
        425,
        800,
        50
    );

    this.createPlatform(
        2000,
        425,
        800,
        50
    );


    // -----------------------------
    // FLOATING PLATFORMS
    // -----------------------------

    this.createPlatform(
        550,
        330,
        180,
        25
    );

    this.createPlatform(
        900,
        270,
        180,
        25
    );

    this.createPlatform(
        1300,
        330,
        180,
        25
    );

    this.createPlatform(
        1700,
        270,
        180,
        25
    );

    this.createPlatform(
        2100,
        330,
        180,
        25
    );


    // -----------------------------
    // PLAYER ANIMATIONS
    // -----------------------------

    this.createPlayerAnimations();


    // -----------------------------
    // PLAYER PHYSICS BODY
    // -----------------------------

    player = this.add.rectangle(
        200,
        GROUND_Y - HITBOX_HEIGHT / 2,
        HITBOX_WIDTH,
        HITBOX_HEIGHT,
        0xffffff,
        0
    );

    this.physics.add.existing(player);

    player.body.setSize(
        HITBOX_WIDTH,
        HITBOX_HEIGHT
    );

    player.body.setOffset(0, 0);

    player.body.setCollideWorldBounds(true);

    player.body.setGravityY(1000);


    // -----------------------------
    // PLAYER VISUAL
    // -----------------------------

    playerVisual = this.add.sprite(
        200,
        GROUND_Y - PLAYER_HEIGHT / 2,
        'idle1'
    );

    playerVisual.setDisplaySize(
        PLAYER_WIDTH,
        PLAYER_HEIGHT
    );

    playerVisual.setDepth(10);

    playerVisual.play('player-idle');


    // -----------------------------
    // PLAYER / PLATFORM COLLISION
    // -----------------------------

    this.physics.add.collider(
        player,
        platforms
    );


    // -----------------------------
    // COINS
    // -----------------------------

    coins = this.physics.add.staticGroup();

    this.createCoins();


    // =================================================
    // IMPORTANT
    // COIN OVERLAP
    // =================================================

    this.physics.add.overlap(
        player,
        coins,
        this.collectCoin,
        null,
        this
    );


    // -----------------------------
    // ENEMIES
    // -----------------------------

    enemies = this.physics.add.group();


    this.createEnemy(650, 370);
    this.createEnemy(1000, 370);
    this.createEnemy(1450, 370);
    this.createEnemy(1800, 370);
    this.createEnemy(2200, 370);


    // -----------------------------
    // ENEMY / PLATFORM COLLISION
    // -----------------------------

    this.physics.add.collider(
        enemies,
        platforms
    );


    // -----------------------------
    // PLAYER / ENEMY COLLISION
    // -----------------------------

    this.physics.add.collider(
        player,
        enemies,
        this.handlePlayerEnemyCollision,
        null,
        this
    );


    // -----------------------------
    // KEYBOARD
    // -----------------------------

    cursors = this.input.keyboard.createCursorKeys();


    this.attackKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.J
    );

    this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
    );


    // -----------------------------
    // CAMERA FOLLOW
    // -----------------------------

    this.cameras.main.startFollow(
        player,
        true,
        0.08,
        0.08
    );


    // -----------------------------
    // TITLE
    // -----------------------------

    this.add.text(
        20,
        15,
        'FOREST ADVENTURE',
        {
            fontFamily: 'monospace',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }
    )
    .setScrollFactor(0)
    .setDepth(100);


    // -----------------------------
    // HP UI
    // -----------------------------

    this.createHPUI();


    // -----------------------------
    // COIN UI
    // -----------------------------

    this.createCoinUI();


    // -----------------------------
    // MOBILE CONTROLS
    // -----------------------------

    this.createMobileControls();


    // -----------------------------
    // DEBUG INFO
    // -----------------------------

    console.log(
        'Enemies:',
        enemies.getChildren().length
    );

    console.log(
        'Coins:',
        coins.getChildren().length
    );
}


// =================================================
// UPDATE
// =================================================

update() {

    if (!player || !player.body) {
        return;
    }


    // -----------------------------
    // SYNC PLAYER VISUAL
    // -----------------------------

    playerVisual.x = player.x;

    playerVisual.y =
        player.y -
        (PLAYER_HEIGHT - HITBOX_HEIGHT) / 2;


    // -----------------------------
    // GAME OVER
    // -----------------------------

    if (gameOver) {

        player.body.setVelocityX(0);

        return;
    }


    // -----------------------------
    // DAMAGE FLASH
    // -----------------------------

    if (
        Date.now() - lastDamageTime <
        PLAYER_INVULNERABLE_TIME
    ) {

        const flash =
            Math.floor(Date.now() / 100) % 2 === 0;

        playerVisual.setTint(
            flash ? 0xff5555 : 0xffffff
        );

    } else {

        playerVisual.clearTint();
    }


    // -----------------------------
    // MOVEMENT
    // -----------------------------

    const keyboardLeft =
        cursors.left.isDown;

    const keyboardRight =
        cursors.right.isDown;


    if (
        keyboardLeft ||
        leftPressed
    ) {

        player.body.setVelocityX(
            -PLAYER_SPEED
        );

        playerFacing = -1;

        playerVisual.setFlipX(true);

        this.playWalkAnimation();

    }
    else if (
        keyboardRight ||
        rightPressed
    ) {

        player.body.setVelocityX(
            PLAYER_SPEED
        );

        playerFacing = 1;

        playerVisual.setFlipX(false);

        this.playWalkAnimation();

    }
    else {

        player.body.setVelocityX(0);

        this.playIdleAnimation();
    }


    // -----------------------------
    // GROUND CHECK
    // -----------------------------

    const onGround =
        player.body.blocked.down ||
        player.body.touching.down;


    // -----------------------------
    // MOBILE JUMP
    // -----------------------------

    if (
        jumpPressed &&
        onGround
    ) {

        player.body.setVelocityY(
            -JUMP_POWER
        );

        jumpPressed = false;
    }
    else if (!onGround) {

        jumpPressed = false;
    }


    // -----------------------------
    // KEYBOARD JUMP
    // -----------------------------

    if (
        Phaser.Input.Keyboard.JustDown(
            cursors.up
        ) &&
        onGround
    ) {

        player.body.setVelocityY(
            -JUMP_POWER
        );
    }


    // -----------------------------
    // ATTACK
    // -----------------------------

    if (
        attackPressed
    ) {

        attackPressed = false;

        this.attackPlayer();
    }


    // -----------------------------
    // KEYBOARD ATTACK
    // -----------------------------

    if (
        Phaser.Input.Keyboard.JustDown(
            this.attackKey
        ) ||
        Phaser.Input.Keyboard.JustDown(
            this.spaceKey
        )
    ) {

        this.attackPlayer();
    }


    // -----------------------------
    // ENEMY AI
    // -----------------------------

    this.updateEnemies();
}


// =================================================
// PLAYER ANIMATIONS
// =================================================

createPlayerAnimations() {

    // -----------------------------
    // IDLE
    // -----------------------------

    if (
        !this.anims.exists('player-idle')
    ) {

        this.anims.create({
            key: 'player-idle',

            frames: [
                { key: 'idle1' },
                { key: 'idle2' },
                { key: 'idle3' },
                { key: 'idle4' }
            ],

            frameRate: 4,

            repeat: -1
        });
    }


    // -----------------------------
    // WALK
    // -----------------------------

    if (
        !this.anims.exists('player-walk')
    ) {

        this.anims.create({
            key: 'player-walk',

            frames: [
                { key: 'walk1' },
                { key: 'walk2' },
                { key: 'walk3' },
                { key: 'walk4' },
                { key: 'walk5' },
                { key: 'walk6' }
            ],

            frameRate: 10,

            repeat: -1
        });
    }
}


// =================================================
// PLAY IDLE
// =================================================

playIdleAnimation() {

    if (
        playerVisual.anims.currentAnim?.key !==
        'player-idle'
    ) {

        playerVisual.play(
            'player-idle'
        );
    }
}


// =================================================
// PLAY WALK
// =================================================

playWalkAnimation() {

    if (
        playerVisual.anims.currentAnim?.key !==
        'player-walk'
    ) {

        playerVisual.play(
            'player-walk'
        );
    }
}


// =================================================
// CREATE PLATFORM
// =================================================

createPlatform(
    x,
    y,
    width,
    height
) {

    const platform =
        this.add.rectangle(
            x,
            y,
            width,
            height,
            0x18851c
        );

    platform.setOrigin(0.5);

    this.physics.add.existing(
        platform,
        true
    );

    platforms.add(platform);

    return platform;
}


// =================================================
// FOREST BACKGROUND
// =================================================

createForestBackground() {

    // -----------------------------
    // SKY
    // -----------------------------

    this.add.rectangle(
        WORLD_WIDTH / 2,
        GAME_HEIGHT / 2,
        WORLD_WIDTH,
        GAME_HEIGHT,
        0x87CEEB
    )
    .setDepth(-20);


    // -----------------------------
    // SUN
    // -----------------------------

    this.add.circle(
        350,
        90,
        45,
        0xffd83d
    )
    .setDepth(-10);


    // -----------------------------
    // TREES
    // -----------------------------

    const treePositions = [
        100,
        350,
        600,
        850,
        1100,
        1350,
        1600,
        1850,
        2100,
        2350
    ];


    treePositions.forEach((x) => {

        // trunk

        this.add.rectangle(
            x,
            370,
            30,
            80,
            0x7b3f12
        )
        .setDepth(-5);


        // leaves

        this.add.circle(
            x,
            310,
            55,
            0x238b23
        )
        .setDepth(-6);


        this.add.circle(
            x - 35,
            330,
            38,
            0x2f8f4e
        )
        .setDepth(-6);


        this.add.circle(
            x + 35,
            330,
            38,
            0x2f8f4e
        )
        .setDepth(-6);
    });
}


// =================================================
// CREATE COINS
// =================================================

createCoins() {

    // -----------------------------
    // GROUND COINS
    // -----------------------------

    const groundCoins = [
        [350, 350],
        [700, 350],
        [1050, 350],
        [1450, 350],
        [1850, 350],
        [2250, 350]
    ];


    // -----------------------------
    // UPPER COINS
    // -----------------------------

    const upperCoins = [
        [550, 285],
        [900, 225],
        [1300, 285],
        [1700, 225],
        [2100, 285]
    ];


    const allCoins = [
        ...groundCoins,
        ...upperCoins
    ];


    allCoins.forEach(
        ([x, y]) => {

            this.createCoin(x, y);
        }
    );
}


// =================================================
// CREATE ONE COIN
// =================================================

createCoin(x, y) {

    const coin =
        this.add.circle(
            x,
            y,
            COIN_SIZE / 2,
            0xffc928
        );


    coin.setStrokeStyle(
        3,
        0xffa500
    );


    coin.setDepth(8);


    // -----------------------------
    // COIN SYMBOL
    // -----------------------------

    const symbol =
        this.add.text(
            x,
            y,
            '$',
            {
                fontFamily: 'monospace',
                fontSize: '18px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#9b6500',
                strokeThickness: 2
            }
        )
        .setOrigin(0.5)
        .setDepth(9);


    coin.coinSymbol = symbol;

    coin.collected = false;


    // -----------------------------
    // STATIC PHYSICS BODY
    // -----------------------------

    this.physics.add.existing(
        coin,
        true
    );


    // Make the static body circular.

    if (
        coin.body &&
        coin.body.setCircle
    ) {

        coin.body.setCircle(
            COIN_SIZE / 2
        );
    }


    // Add to coin group.

    coins.add(coin);


    // -----------------------------
    // COIN ANIMATION
    // -----------------------------

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


// =================================================
// COLLECT COIN
// =================================================

collectCoin(playerObject, coin) {

    // -----------------------------
    // SAFETY CHECK
    // -----------------------------

    if (!coin) {
        return;
    }


    if (
        coin.collected
    ) {
        return;
    }


    coin.collected = true;


    // =================================================
    // IMPORTANT FIX
    // =================================================
    //
    // OLD:
    //
    // coin.body.setEnable(false);
    //
    // This caused:
    //
    // TypeError:
    // coin.body.setEnable is not a function
    //
    // NEW:
    //
    // Use Phaser World.disableBody().
    //
    // This safely disables both DynamicBody
    // and StaticBody.
    // =================================================

    if (
        coin.body
    ) {

        this.physics.world.disableBody(
            coin.body
        );
    }


    // -----------------------------
    // HIDE COIN
    // -----------------------------

    coin.setVisible(false);


    // -----------------------------
    // HIDE SYMBOL
    // -----------------------------

    if (
        coin.coinSymbol
    ) {

        coin.coinSymbol.setVisible(false);
    }


    // -----------------------------
    // UPDATE COINS
    // -----------------------------

    coinCount += COIN_VALUE;

    this.updateCoinUI();


    // -----------------------------
    // COLLECT TEXT
    // -----------------------------

    const collectText =
        this.add.text(
            coin.x,
            coin.y - 10,
            `+${COIN_VALUE}`,
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#fff6a0',
                stroke: '#000000',
                strokeThickness: 3
            }
        )
        .setOrigin(0.5)
        .setDepth(50);


    // -----------------------------
    // COLLECT TEXT ANIMATION
    // -----------------------------

    this.tweens.add({

        targets: collectText,

        y: coin.y - 50,

        alpha: 0,

        duration: 500,

        ease: 'Cubic.easeOut',

        onComplete: () => {

            collectText.destroy();
        }
    });


    // -----------------------------
    // DESTROY COIN
    // -----------------------------

    this.tweens.add({

        targets: coin,

        scaleX: 1.5,
        scaleY: 1.5,

        alpha: 0,

        duration: 180,

        onComplete: () => {

            if (
                coin.coinSymbol
            ) {

                coin.coinSymbol.destroy();

                coin.coinSymbol = null;
            }

            coin.destroy();
        }
    });
}


// =================================================
// CREATE ENEMY
// =================================================

createEnemy(x, y) {

    const enemy =
        this.add.rectangle(
            x,
            y,
            ENEMY_WIDTH,
            ENEMY_HEIGHT,
            0xaa2222
        );


    enemy.setDepth(7);


    // -----------------------------
    // PHYSICS
    // -----------------------------

    this.physics.add.existing(
        enemy
    );


    enemy.body.setSize(
        ENEMY_WIDTH,
        ENEMY_HEIGHT
    );


    enemy.body.setCollideWorldBounds(
        true
    );


    enemy.body.setGravityY(
        1000
    );


    enemy.body.setVelocityX(
        ENEMY_SPEED
    );


    // -----------------------------
    // DATA
    // -----------------------------

    enemy.hp = ENEMY_MAX_HP;

    enemy.direction = 1;

    enemy.speed = ENEMY_SPEED;

    enemy.spawnX = x;

    enemy.patrolDistance = 180;

    enemy.isChasing = false;


    // -----------------------------
    // ENEMY LABEL
    // -----------------------------

    enemy.label =
        this.add.text(
            x,
            y - 48,
            'ENEMY',
            {
                fontFamily: 'monospace',
                fontSize: '10px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        )
        .setOrigin(0.5)
        .setDepth(20);


    // -----------------------------
    // HP BAR BACKGROUND
    // -----------------------------

    enemy.hpBarBackground =
        this.add.rectangle(
            x,
            y - 38,
            46,
            6,
            0x222222
        )
        .setDepth(20);


    // -----------------------------
    // HP BAR
    // -----------------------------

    enemy.hpBar =
        this.add.rectangle(
            x - 21,
            y - 38,
            42,
            4,
            0xff3333
        )
        .setOrigin(0, 0.5)
        .setDepth(21);


    enemies.add(enemy);

    return enemy;
}


// =================================================
// UPDATE ENEMIES
// =================================================

updateEnemies() {

    if (
        !enemies
    ) {
        return;
    }


    // =================================================
    // FIX
    // =================================================
    // ใช้ getChildren() แทน children.iterate()
    // เพื่อให้เข้ากับ Phaser เวอร์ชันที่กำลังใช้งาน
    // =================================================

    enemies.getChildren().forEach(
        (enemy) => {

            if (
                !enemy ||
                !enemy.active ||
                !enemy.body
            ) {
                return;
            }


            // -----------------------------
            // DISTANCE TO PLAYER
            // -----------------------------

            const distance =
                Phaser.Math.Distance.Between(
                    player.x,
                    player.y,
                    enemy.x,
                    enemy.y
                );


            // -----------------------------
            // CHASE
            // -----------------------------

            if (
                distance <=
                ENEMY_DETECT_DISTANCE
            ) {

                enemy.isChasing = true;
            }


            if (
                distance >=
                ENEMY_LOSE_DISTANCE
            ) {

                enemy.isChasing = false;
            }


            // -----------------------------
            // CHASING
            // -----------------------------

            if (
                enemy.isChasing
            ) {

                if (
                    player.x <
                    enemy.x
                ) {

                    enemy.direction = -1;

                    enemy.body.setVelocityX(
                        -enemy.speed
                    );

                } else {

                    enemy.direction = 1;

                    enemy.body.setVelocityX(
                        enemy.speed
                    );
                }

            }

            // -----------------------------
            // PATROL
            // -----------------------------

            else {

                const leftLimit =
                    enemy.spawnX -
                    enemy.patrolDistance;

                const rightLimit =
                    enemy.spawnX +
                    enemy.patrolDistance;


                if (
                    enemy.x <= leftLimit
                ) {

                    enemy.direction = 1;
                }


                if (
                    enemy.x >= rightLimit
                ) {

                    enemy.direction = -1;
                }


                enemy.body.setVelocityX(
                    enemy.direction *
                    enemy.speed
                );
            }


            // -----------------------------
            // UPDATE LABEL
            // -----------------------------

            if (
                enemy.label
            ) {

                enemy.label.x =
                    enemy.x;

                enemy.label.y =
                    enemy.y - 48;
            }


            // -----------------------------
            // UPDATE HP BAR
            // -----------------------------

            if (
                enemy.hpBarBackground
            ) {

                enemy.hpBarBackground.x =
                    enemy.x;

                enemy.hpBarBackground.y =
                    enemy.y - 38;
            }


            if (
                enemy.hpBar
            ) {

                enemy.hpBar.x =
                    enemy.x - 21;

                enemy.hpBar.y =
                    enemy.y - 38;


                const percent =
                    Phaser.Math.Clamp(
                        enemy.hp /
                        ENEMY_MAX_HP,
                        0,
                        1
                    );


                enemy.hpBar.displayWidth =
                    42 * percent;
            }
        }
    );
}


// =================================================
// PLAYER ATTACK
// =================================================

attackPlayer() {

    if (
        gameOver
    ) {
        return;
    }


    const now =
        Date.now();


    if (
        now - lastAttackTime <
        PLAYER_ATTACK_COOLDOWN
    ) {

        return;
    }


    lastAttackTime = now;


    // -----------------------------
    // ATTACK EFFECT
    // -----------------------------

    this.createAttackEffect();


    // -----------------------------
    // HIT ENEMIES
    // -----------------------------

    // =================================================
    // FIX
    // =================================================
    // ใช้ getChildren() แทน children.iterate()
    // =================================================

    enemies.getChildren().forEach(
        (enemy) => {

            if (
                !enemy ||
                !enemy.active ||
                !enemy.body
            ) {
                return;
            }


            const dx =
                enemy.x -
                player.x;


            const dy =
                Math.abs(
                    enemy.y -
                    player.y
                );


            const distance =
                Math.abs(dx);


            // -----------------------------
            // RANGE
            // -----------------------------

            if (
                distance >
                PLAYER_ATTACK_DISTANCE
            ) {
                return;
            }


            if (
                dy >
                70
            ) {
                return;
            }


            // -----------------------------
            // FACING DIRECTION
            // -----------------------------

            if (
                playerFacing === 1 &&
                dx < 0
            ) {
                return;
            }


            if (
                playerFacing === -1 &&
                dx > 0
            ) {
                return;
            }


            this.damageEnemy(
                enemy
            );
        }
    );
}


// =================================================
// ATTACK EFFECT
// =================================================

createAttackEffect() {

    if (
        attackEffect &&
        attackEffect.active
    ) {

        attackEffect.destroy();
    }


    const x =
        player.x +
        playerFacing * 48;


    const y =
        player.y - 5;


    attackEffect =
        this.add.arc(
            x,
            y,
            45,
            playerFacing === 1
                ? -70
                : 110,
            playerFacing === 1
                ? 70
                : 250,
            false,
            0xffffff,
            0
        );


    attackEffect.setStrokeStyle(
        8,
        0xffffff,
        1
    );


    attackEffect.setDepth(30);


    attackEffect.setScale(
        1,
        1
    );


    this.tweens.add({

        targets: attackEffect,

        scaleX: 1.25,

        alpha: 0,

        duration: 180,

        ease: 'Cubic.easeOut',

        onComplete: () => {

            if (
                attackEffect
            ) {

                attackEffect.destroy();

                attackEffect = null;
            }
        }
    });
}


// =================================================
// DAMAGE ENEMY
// =================================================

damageEnemy(enemy) {

    if (
        !enemy ||
        !enemy.active
    ) {
        return;
    }


    enemy.hp -=
        PLAYER_ATTACK_DAMAGE;


    // -----------------------------
    // HP BAR
    // -----------------------------

    if (
        enemy.hpBar
    ) {

        const percent =
            Phaser.Math.Clamp(
                enemy.hp /
                ENEMY_MAX_HP,
                0,
                1
            );


        enemy.hpBar.displayWidth =
            42 * percent;
    }


    // -----------------------------
    // HIT FLASH
    // -----------------------------

    enemy.setFillStyle(
        0xffffff
    );


    this.time.delayedCall(
        100,
        () => {

            if (
                enemy &&
                enemy.active
            ) {

                enemy.setFillStyle(
                    0xaa2222
                );
            }
        }
    );


    // -----------------------------
    // KNOCKBACK
    // -----------------------------

    if (
        enemy.body
    ) {

        enemy.body.setVelocityX(
            playerFacing * 180
        );

        enemy.body.setVelocityY(
            -150
        );
    }


    // -----------------------------
    // DEATH
    // -----------------------------

    if (
        enemy.hp <= 0
    ) {

        this.killEnemy(
            enemy
        );
    }
}


// =================================================
// KILL ENEMY
// =================================================

killEnemy(enemy) {

    if (
        !enemy ||
        !enemy.active
    ) {
        return;
    }


    // -----------------------------
    // DISABLE BODY
    // -----------------------------

    if (
        enemy.body
    ) {

        this.physics.world.disableBody(
            enemy.body
        );
    }


    // -----------------------------
    // DISABLE COLLISION
    // -----------------------------

    enemy.active = false;


    // -----------------------------
    // UI DESTROY
    // -----------------------------

    if (
        enemy.label
    ) {

        enemy.label.destroy();

        enemy.label = null;
    }


    if (
        enemy.hpBar
    ) {

        enemy.hpBar.destroy();

        enemy.hpBar = null;
    }


    if (
        enemy.hpBarBackground
    ) {

        enemy.hpBarBackground.destroy();

        enemy.hpBarBackground = null;
    }


    // -----------------------------
    // REWARD
    // -----------------------------

    coinCount +=
        ENEMY_COIN_REWARD;


    this.updateCoinUI();


    // -----------------------------
    // REWARD TEXT
    // -----------------------------

    const rewardText =
        this.add.text(
            enemy.x,
            enemy.y - 30,
            `+${ENEMY_COIN_REWARD} COINS`,
            {
                fontFamily: 'monospace',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#fff6a0',
                stroke: '#000000',
                strokeThickness: 3
            }
        )
        .setOrigin(0.5)
        .setDepth(50);


    // -----------------------------
    // ENEMY DEATH ANIMATION
    // -----------------------------

    this.tweens.add({

        targets: enemy,

        alpha: 0,

        scaleX: 1.5,
        scaleY: 1.5,

        duration: 300,

        onComplete: () => {

            rewardText.destroy();

            enemy.destroy();
        }
    });
}


// =================================================
// PLAYER / ENEMY COLLISION
// =================================================

handlePlayerEnemyCollision(
    playerObject,
    enemy
) {

    if (
        gameOver
    ) {
        return;
    }


    if (
        !enemy ||
        !enemy.active
    ) {
        return;
    }


    this.damagePlayer(
        enemy
    );
}


// =================================================
// DAMAGE PLAYER
// =================================================

damagePlayer(enemy) {

    const now =
        Date.now();


    if (
        now - lastDamageTime <
        PLAYER_INVULNERABLE_TIME
    ) {

        return;
    }


    lastDamageTime = now;


    // -----------------------------
    // HP
    // -----------------------------

    playerHP -=
        ENEMY_DAMAGE;


    playerHP =
        Math.max(
            0,
            playerHP
        );


    this.updateHPUI();


    // -----------------------------
    // KNOCKBACK
    // -----------------------------

    if (
        enemy &&
        enemy.active &&
        enemy.x < player.x
    ) {

        player.body.setVelocityX(
            250
        );

    }
    else {

        player.body.setVelocityX(
            -250
        );
    }


    player.body.setVelocityY(
        -250
    );


    // -----------------------------
    // CAMERA SHAKE
    // -----------------------------

    this.cameras.main.shake(
        120,
        0.008
    );


    // -----------------------------
    // DEATH
    // -----------------------------

    if (
        playerHP <= 0
    ) {

        this.killPlayer();
    }
}


// =================================================
// KILL PLAYER
// =================================================

killPlayer() {

    if (
        gameOver
    ) {
        return;
    }


    gameOver = true;


    // -----------------------------
    // DISABLE BODY
    // -----------------------------

    if (
        player.body
    ) {

        this.physics.world.disableBody(
            player.body
        );
    }


    // -----------------------------
    // STOP ANIMATION
    // -----------------------------

    playerVisual.anims.stop();


    playerVisual.setTint(
        0xff3333
    );


    // -----------------------------
    // GAME OVER TEXT
    // -----------------------------

    this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 30,
        'GAME OVER',
        {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ff3333',
            stroke: '#000000',
            strokeThickness: 6
        }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(200);


    // -----------------------------
    // RESTART TEXT
    // -----------------------------

    const restartText =
        this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + 35,
            'TAP TO RESTART',
            {
                fontFamily: 'monospace',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(200);


    // -----------------------------
    // RESTART
    // -----------------------------

    const restartGame = () => {

        this.scene.restart();
    };


    this.input.once(
        'pointerdown',
        restartGame
    );


    this.input.keyboard.once(
        'keydown-SPACE',
        restartGame
    );
}


// =================================================
// HP UI
// =================================================

createHPUI() {

    // -----------------------------
    // HP TEXT
    // -----------------------------

    hpText =
        this.add.text(
            20,
            43,
            `HP ${playerHP} / ${PLAYER_MAX_HP}`,
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        )
        .setScrollFactor(0)
        // =================================================
        // FIX:
        // ให้ข้อความ HP อยู่หน้าสุดของแถบ HP
        // =================================================
        .setDepth(102);


    // -----------------------------
    // HP BACKGROUND
    // -----------------------------

    this.add.rectangle(
        115,
        55,
        180,
        16,
        0x222222
    )
    .setScrollFactor(0)
    .setDepth(100);


    // -----------------------------
    // HP BAR
    // -----------------------------

    hpBar =
        this.add.rectangle(
            28,
            55,
            174,
            10,
            0x27d83d
        )
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(101);


    this.updateHPUI();
}


// =================================================
// UPDATE HP UI
// =================================================

updateHPUI() {

    if (
        !hpBar ||
        !hpText
    ) {
        return;
    }


    const percent =
        Phaser.Math.Clamp(
            playerHP /
            PLAYER_MAX_HP,
            0,
            1
        );


    hpBar.displayWidth =
        174 * percent;


    hpText.setText(
        `HP ${playerHP} / ${PLAYER_MAX_HP}`
    );
}


// =================================================
// COIN UI
// =================================================

createCoinUI() {

    this.add.circle(
        25,
        88,
        9,
        0xffc928
    )
    .setScrollFactor(0)
    .setDepth(100);


    this.add.text(
        48,
        78,
        'COIN:',
        {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }
    )
    .setScrollFactor(0)
    .setDepth(101);


    coinText =
        this.add.text(
            105,
            78,
            '0',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                fontStyle: 'bold',
                color: '#fff6a0',
                stroke: '#000000',
                strokeThickness: 3
            }
        )
        .setScrollFactor(0)
        .setDepth(101);


    this.updateCoinUI();
}


// =================================================
// UPDATE COIN UI
// =================================================

updateCoinUI() {

    if (
        coinText
    ) {

        coinText.setText(
            String(coinCount)
        );
    }
}


// =================================================
// MOBILE CONTROLS
// =================================================

createMobileControls() {

    // =================================================
    // LEFT
    // =================================================

    leftButton =
        this.createControlButton(
            90,
            370,
            100,
            70,
            '◀'
        );


    // =================================================
    // RIGHT
    // =================================================

    rightButton =
        this.createControlButton(
            210,
            370,
            100,
            70,
            '▶'
        );


    // =================================================
    // ATTACK
    // =================================================

    attackButton =
        this.createControlButton(
            575,
            370,
            110,
            80,
            '⚔'
        );


    // =================================================
    // JUMP
    // =================================================

    jumpButton =
        this.createControlButton(
            710,
            370,
            110,
            80,
            'โดด'
        );


    // =================================================
    // LEFT EVENTS
    // =================================================

    leftButton.on(
        'pointerdown',
        () => {

            leftPressed = true;
        }
    );


    leftButton.on(
        'pointerup',
        () => {

            leftPressed = false;
        }
    );


    leftButton.on(
        'pointerupoutside',
        () => {

            leftPressed = false;
        }
    );


    leftButton.on(
        'pointerout',
        () => {

            leftPressed = false;
        }
    );


    // =================================================
    // RIGHT EVENTS
    // =================================================

    rightButton.on(
        'pointerdown',
        () => {

            rightPressed = true;
        }
    );


    rightButton.on(
        'pointerup',
        () => {

            rightPressed = false;
        }
    );


    rightButton.on(
        'pointerupoutside',
        () => {

            rightPressed = false;
        }
    );


    rightButton.on(
        'pointerout',
        () => {

            rightPressed = false;
        }
    );


    // =================================================
    // JUMP EVENTS
    // =================================================

    jumpButton.on(
        'pointerdown',
        () => {

            jumpPressed = true;
        }
    );


    jumpButton.on(
        'pointerup',
        () => {

            jumpPressed = false;
        }
    );


    jumpButton.on(
        'pointerupoutside',
        () => {

            jumpPressed = false;
        }
    );


    // =================================================
    // ATTACK EVENTS
    // =================================================

    attackButton.on(
        'pointerdown',
        () => {

            attackPressed = true;
        }
    );


    attackButton.on(
        'pointerup',
        () => {

            attackPressed = false;
        }
    );


    attackButton.on(
        'pointerupoutside',
        () => {

            attackPressed = false;
        }
    );
}


// =================================================
// CREATE CONTROL BUTTON
// =================================================

createControlButton(
    x,
    y,
    width,
    height,
    text
) {

    const button =
        this.add.rectangle(
            x,
            y,
            width,
            height,
            0x222222,
            0.65
        );


    button.setInteractive({
        useHandCursor: false
    });


    button.setScrollFactor(0);

    button.setDepth(100);


    const label =
        this.add.text(
            x,
            y,
            text,
            {
                fontFamily: 'sans-serif',
                fontSize: 30,
                fontStyle: 'bold',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);


    button.label = label;


    // -----------------------------
    // PRESS EFFECT
    // -----------------------------

    button.on(
        'pointerdown',
        () => {

            button.setAlpha(0.85);
        }
    );


    button.on(
        'pointerup',
        () => {

            button.setAlpha(0.65);
        }
    );


    button.on(
        'pointerupoutside',
        () => {

            button.setAlpha(0.65);
        }
    );


    return button;
}

}

// =====================================================
// PHASER CONFIG
// =====================================================

const config = {

type: Phaser.AUTO,

width: GAME_WIDTH,

height: GAME_HEIGHT,

backgroundColor: '#87CEEB',


physics: {

    default: 'arcade',

    arcade: {

        gravity: {
            y: 1000
        },

        debug: false
    }
},


scale: {

    mode: Phaser.Scale.FIT,

    autoCenter:
        Phaser.Scale.CENTER_BOTH
},


scene: GameScene

};

// =====================================================
// START GAME
// =====================================================

new Phaser.Game(config);