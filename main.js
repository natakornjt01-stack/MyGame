// IMPORT
import Phaser from 'phaser';
import stage1 from './stages/stage1.js';
import stage2 from './stages/stage2.js';
import Inventory from './inventory.js';
import Equipment from './equipment.js';
import Skills from './skills.js';
import Quest from './quest.js';
import NPC from './npc.js';
import Shop from './shop.js';
import AudioManager from './audio.js';

// ERROR DETECTOR
window.addEventListener('error',e=>{
 console.error(e.error||e.message);
 document.body.innerHTML=`<div style="background:#111;color:#ff5555;padding:20px;font-family:monospace;font-size:16px;white-space:pre-wrap;word-break:break-word;min-height:100vh"><h1 style="color:#ff3333">❌ GAME ERROR</h1><div>${e.error?e.error.stack:e.message}</div><br><div>File:<br>${e.filename||'Unknown'}</div><br><div>Line:<br>${e.lineno||'Unknown'}</div><br><div>Column:<br>${e.colno||'Unknown'}</div></div>`;
});

window.addEventListener('unhandledrejection',e=>{
 console.error('Unhandled Promise Rejection:',e.reason);
});

// CONFIG
const GAME_WIDTH=800;
const GAME_HEIGHT=600;
const CONTROL_AREA_Y=525;
const WORLD_GRAVITY=700;
const PLAYER_MAX_FALL_SPEED=650;

// PLAYER
const PLAYER_WIDTH=80;
const PLAYER_HEIGHT=95;
const POWER_PLAYER_WIDTH=105;
const POWER_PLAYER_HEIGHT=125;
const HITBOX_WIDTH=44;
const HITBOX_HEIGHT=80;
const GROUND_Y=450;
const PLAYER_SPEED=200;
const JUMP_POWER=360;

// ATTACK
const PLAYER_NORMAL_ATTACK_DAMAGE=25;
const PLAYER_POWER_ATTACK_DAMAGE=50;
const PLAYER_ATTACK_DISTANCE=95;
const PLAYER_ATTACK_COOLDOWN=400;

// SKILL
const SKILL_PANEL_WIDTH=560;
const SKILL_PANEL_HEIGHT=280;
const SKILL_FRONT_DISTANCE=150;
const SKILL_BURST_RADIUS=170;

// QUEST
let quest=null;
let questOpen=false;
let questPanel=null;
let questTrackerText=null;

// HP
const PLAYER_MAX_HP=100;
const ENEMY_DAMAGE=10;
const PLAYER_INVULNERABLE_TIME=800;

// POWER
const PLAYER_POWER_MAX_HP=200;
const PLAYER_POWER_BONUS_HP=100;
const PLAYER_POWER_DURATION=10000;
const PLAYER_POWER_COOLDOWN=20000;

// NPC
let npcObjects=[];
let nearbyNPC=null;
let npcOpen=false;
let npcPanel=null;
let npcTalkText=null;
let npcNameText=null;
let npcPageText=null;
let talkPressed=false;

// SHOP
let shop=null;
let shopOpen=false;
let shopPanel=null;
let shopCoinText=null;
let shopPointerHandler=null;

// ENEMY
const ENEMY_TYPES={
 slime:{
  name:'SLIME',
  width:40,
  height:55,
  speed:70,
  hp:50,
  damage:10,
  exp:50,
  color:0xaa2222,
  gravity:true,
  fly:false
 },
 bat:{
  name:'BAT',
  width:48,
  height:32,
  speed:110,
  hp:35,
  damage:8,
  exp:60,
  color:0x7c3aed,
  gravity:false,
  fly:true
 },
 tank:{
  name:'TANK',
  width:60,
  height:70,
  speed:40,
  hp:100,
  damage:20,
  exp:100,
  color:0x555555,
  gravity:true,
  fly:false
 }
};

const ENEMY_DETECT_DISTANCE=300;
const ENEMY_LOSE_DISTANCE=400;

// LEVEL
const PLAYER_START_LEVEL=1;
const PLAYER_START_EXP_REQUIRED=100;
const PLAYER_EXP_INCREASE_PER_LEVEL=50;
const PLAYER_LEVEL_UP_HP_BONUS=10;
const PLAYER_MAX_LEVEL=-1;

// COIN
const COIN_SIZE=32;
const COIN_VALUE=1;

// COIN DROP
const COIN_DROP_CHANCE=.80;
const COIN_DROP_MIN=3;
const COIN_DROP_MAX=5;
const COIN_DROP_MIN_X_SPEED=80;
const COIN_DROP_MAX_X_SPEED=180;
const COIN_DROP_MIN_Y_SPEED=220;
const COIN_DROP_MAX_Y_SPEED=320;
const COIN_DROP_BOUNCE=.45;
const COIN_DROP_DRAG_X=100;
const COIN_DROP_LIFETIME=20000;

// COIN MAGNET
const COIN_MAGNET_ENABLED=true;
const COIN_MAGNET_RADIUS=90;
const COIN_MAGNET_SPEED=550;
const COIN_AUTO_PICKUP_DISTANCE=28;

// CHECKPOINT
const CHECKPOINT_WIDTH=36;
const CHECKPOINT_HEIGHT=90;
const CHECKPOINT_GLOW_RADIUS=28;

// DEATH
const DEATH_RESPAWN_DELAY=1000;

// UI
const HP_UI_X=145;
const HP_UI_Y=55;
const HP_BAR_WIDTH=170;
const HP_BAR_HEIGHT=16;
const HP_FILL_WIDTH=164;

const POWER_UI_X=330;
const POWER_UI_Y=55;
const POWER_BAR_WIDTH=170;
const POWER_BAR_HEIGHT=16;
const POWER_FILL_WIDTH=164;

const EXP_UI_X=560;
const EXP_UI_Y=55;
const EXP_BAR_WIDTH=170;
const EXP_BAR_HEIGHT=16;
const EXP_FILL_WIDTH=164;

const UI_TEXT_SIZE='13px';
const UI_TEXT_COLOR='#ffffff';
const UI_TEXT_STROKE='#000000';
const UI_TEXT_STROKE_WIDTH=4;

// SAVE / LOAD
const SAVE_KEY='mygame-save-v1';
const SAVE_VERSION=1;
const SETTINGS_KEY='mygame-settings-v1';

function getGameSettings(){
 try{
  const data=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
  return{
   music:data.music!==false,
   sound:data.sound!==false,
   vibration:data.vibration!==false
  };
 }catch(error){
  return{music:true,sound:true,vibration:true};
 }
}

function saveGameSettings(settings){
 localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
}

const audio=new AudioManager();

// GLOBAL
let player=null;
let playerVisual=null;
let platforms=null;
let enemies=null;
let coins=null;
let coinDrops=null;
let checkpoints=null;
let cursors=null;

let leftButton=null;
let rightButton=null;
let jumpButton=null;
let attackButton=null;
let powerButton=null;
let inventoryButton=null;
let talkButton=null;
let skillButtons={};
let skillCooldownOverlays={};
let controlArea=null;

let bgSkyLayer=null;
let bgMountainLayer=null;
let bgForestLayer=null;

// STAGE
let currentStage=stage1;
let currentStageNumber=1;
let stageTransitioning=false;

// INPUT
let leftPressed=false;
let rightPressed=false;
let jumpPressed=false;
let attackPressed=false;
let powerPressed=false;

// PLAYER
let playerHP=PLAYER_MAX_HP;
let coinCount=0;
let playerFacing=1;
let lastAttackTime=0;
let lastDamageTime=0;
let gameOver=false;
let attackEffect=null;

// DEATH UI
let deathText=null;
let respawnText=null;

// CHECKPOINT
let activeCheckpoint=0;
let checkpointX=200;
let checkpointY=GROUND_Y-HITBOX_HEIGHT/2;

// LEVEL
let playerLevel=PLAYER_START_LEVEL;
let playerEXP=0;
let playerEXPRequired=PLAYER_START_EXP_REQUIRED;

// POWER
let playerPowered=false;
let powerEndTime=0;
let powerCooldownUntil=0;

// INVENTORY
let inventory=null;
let inventoryOpen=false;
let inventoryPanel=null;
let inventoryRefreshTimer=null;
let saveKey=null;
let loadKey=null;
let pauseKey=null;
let pauseOpen=false;
let pausePanel=null;

// EQUIPMENT
let equipment=null;

// SKILL
let skills=null;
let skillOpen=false;
let skillPanel=null;

// UI
let hpBar=null;
let hpText=null;
let coinText=null;
let powerBar=null;
let powerText=null;
let powerBarBackground=null;
let levelText=null;
let expBarBackground=null;
let expBar=null;
let expText=null;
let checkpointText=null;

// GAME
class GameScene extends Phaser.Scene{

 constructor(){
  super('GameScene');
 }

 // PRELOAD
preload(){
 this.load.image('idle1','/idle1.png');
 this.load.image('idle2','/idle2.png');
 this.load.image('idle3','/idle3.png');
 this.load.image('idle4','/idle4.png');

 this.load.image('walk1','/walk1.png');
 this.load.image('walk2','/walk2.png');
 this.load.image('walk3','/walk3.png');
 this.load.image('walk4','/walk4.png');
 this.load.image('walk5','/walk5.png');
 this.load.image('walk6','/walk6.png');

 this.load.image('power','/power.png');

 this.load.image('bgSky','/backgrounds/sky.png');
 this.load.image('bgMountain','/backgrounds/mountain.png');
 this.load.image('bgForest','/backgrounds/forest_ground.png');
}

 // CREATE
 create(data={}){
  audio.startMusic();
  this.input.on('pointerdown',()=>audio.unlock());

  const requestedStage=Number(data.stage||1);

  if(requestedStage===2){
   currentStage=stage2;
   currentStageNumber=2;
  }else{
   currentStage=stage1;
   currentStageNumber=1;
  }

  stageTransitioning=false;

  if(data.keepProgress){
   playerHP=Number.isFinite(data.playerHP)?data.playerHP:PLAYER_MAX_HP;
   coinCount=Number.isFinite(data.coinCount)?data.coinCount:0;
   playerLevel=Number.isFinite(data.playerLevel)?data.playerLevel:PLAYER_START_LEVEL;
   playerEXP=Number.isFinite(data.playerEXP)?data.playerEXP:0;
   playerEXPRequired=Number.isFinite(data.playerEXPRequired)?data.playerEXPRequired:PLAYER_START_EXP_REQUIRED;

   inventory=new Inventory(20,data.inventory);
   equipment=new Equipment(data.equipment);
  }else{
   playerHP=PLAYER_MAX_HP;
   coinCount=0;
   playerLevel=PLAYER_START_LEVEL;
   playerEXP=0;
   playerEXPRequired=PLAYER_START_EXP_REQUIRED;

   inventory=new Inventory(20,[
    {id:'potion',count:3}
   ]);

   equipment=new Equipment();
  }

  skills=new Skills();
   
   // SHOP
shop=new Shop();
shopOpen=false;
shopPanel=null;
shopCoinText=null;
shopPointerHandler=null;
   // QUEST
 quest=new Quest(data.quest);

  inventoryOpen=false;
  inventoryPanel=null;
  inventoryRefreshTimer=null;

  skillOpen=false;
  skillPanel=null;
   // QUEST
questOpen=false;
questPanel=null;
questTrackerText=null;

  leftPressed=false;
  rightPressed=false;
  jumpPressed=false;
  attackPressed=false;
  powerPressed=false;

  playerFacing=1;
  lastAttackTime=0;
  lastDamageTime=0;
  gameOver=false;
  attackEffect=null;

  deathText=null;
  respawnText=null;

  playerPowered=false;
  powerEndTime=0;
  powerCooldownUntil=0;

  activeCheckpoint=0;
  checkpointX=200;
  checkpointY=GROUND_Y-HITBOX_HEIGHT/2;

  if(data.keepProgress){
   activeCheckpoint=Number.isFinite(data.activeCheckpoint)?data.activeCheckpoint:0;
   checkpointX=Number.isFinite(data.checkpointX)?data.checkpointX:checkpointX;
   checkpointY=Number.isFinite(data.checkpointY)?data.checkpointY:checkpointY;
  }

  skillButtons={};
  skillCooldownOverlays={};
  pauseOpen=false;
  pausePanel=null;

  this.input.addPointer(3);

  this.physics.world.setBounds(
   0,
   0,
   currentStage.worldWidth,
   currentStage.worldHeight
  );

  this.cameras.main.setBounds(
   0,
   0,
   currentStage.worldWidth,
   currentStage.worldHeight
  );

  this.createForestBackground();

  platforms=this.physics.add.staticGroup();

  currentStage.platforms.forEach(p=>{
   this.createPlatform(
    p.x,
    p.y,
    p.width,
    p.height
   );
  });

  this.createPlayerAnimations();

  const spawnX=data.keepProgress&&Number.isFinite(data.playerX)?data.playerX:200;
  const spawnY=data.keepProgress&&Number.isFinite(data.playerY)?data.playerY:GROUND_Y-HITBOX_HEIGHT/2;

  player=this.add.rectangle(
   spawnX,
   spawnY,
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

  player.body.setOffset(0,0);
  player.body.setCollideWorldBounds(true);
  player.body.setMaxVelocityY(
   PLAYER_MAX_FALL_SPEED
  );

  playerVisual=this.add.sprite(
   spawnX,
   spawnY-(PLAYER_HEIGHT-HITBOX_HEIGHT)/2,
   'idle1'
  );

  playerVisual.setDisplaySize(
   PLAYER_WIDTH,
   PLAYER_HEIGHT
  );

  playerVisual.setDepth(10);
  playerVisual.play('player-idle');

  this.physics.add.collider(
   player,
   platforms
  );

  // COINS
  coins=this.physics.add.group({
   allowGravity:false,
   immovable:true,
   collideWorldBounds:true
  });

  this.createCoins();

  this.physics.add.overlap(
   player,
   coins,
   this.collectCoin,
   null,
   this
  );

  coinDrops=this.physics.add.group({
   allowGravity:true,
   collideWorldBounds:true
  });

  this.physics.add.collider(
   coinDrops,
   platforms
  );

  this.physics.add.overlap(
   player,
   coinDrops,
   this.collectCoin,
   null,
   this
  );

  // ENEMY
  enemies=this.physics.add.group();

  currentStage.enemies.forEach((e,i)=>{
   this.createEnemy(
    e.x,
    e.y,
    e.type||
    Object.keys(ENEMY_TYPES)[
     i%Object.keys(ENEMY_TYPES).length
    ]
   );
  });

  this.physics.add.collider(
   enemies,
   platforms,
   enemy=>enemy.enemyType!=='bat'
  );

  this.physics.add.collider(
   player,
   enemies,
   this.handlePlayerEnemyCollision,
   null,
   this
  );

  // CHECKPOINT
  checkpoints=this.physics.add.staticGroup();

  currentStage.checkpoints.forEach(c=>{
   this.createCheckpoint(
    c.x,
    c.index
   );
  });

  this.physics.add.overlap(
   player,
   checkpoints,
   this.activateCheckpoint,
   null,
   this
  );
   // NPC
this.createNPCs();
   this.npcKey=this.input.keyboard.addKey(
 Phaser.Input.Keyboard.KeyCodes.E
);
   

  // INPUT
  cursors=this.input.keyboard.createCursorKeys();

  this.attackKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.J
  );

  this.spaceKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  this.powerKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.P
  );

  this.inventoryKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.I
  );

  this.skillKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.K
  );

  this.skill1Key=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.ONE
  );

  this.skill2Key=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.TWO
  );

  this.skill3Key=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.THREE
  );
this.questKey=this.input.keyboard.addKey(
 Phaser.Input.Keyboard.KeyCodes.Q
);

  saveKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.F6
  );

  loadKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.F7
  );

  pauseKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.ESC
  );
   

  this.cameras.main.startFollow(
   player,
   true,
   .08,
   .08
  );

  this.add.text(
   20,
   15,
   'FOREST ADVENTURE',
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setScrollFactor(0).setDepth(100);

  this.createHPUI();
  this.createPowerUI();
  this.createEXPUI();
  this.createCoinUI();
  this.createCheckpointUI();
   this.createQuestUI();
  this.createMobileControls();
  if(data.keepProgress)this.saveGame(false);
 }

 // UPDATE
 update(){
  if(!player||!player.body)return;
if(this.backgroundLayers){
  const camera=this.cameras.main;
  this.backgroundLayers.forEach(layer=>{
   layer.img.x=
    GAME_WIDTH/2+
    camera.scrollX*(1-layer.factor);
   layer.img.y=
    GAME_HEIGHT/2+
    camera.scrollY;
  });
}
  if(saveKey&&Phaser.Input.Keyboard.JustDown(saveKey)){
   this.saveGame();
   return;
  }

  if(loadKey&&Phaser.Input.Keyboard.JustDown(loadKey)){
   this.loadGame();
   return;
  }

  if(pauseKey&&Phaser.Input.Keyboard.JustDown(pauseKey)){
   this.togglePauseMenu();
   return;
  }

  if(pauseOpen){
   if(player.body)player.body.setVelocity(0,0);
   return;
  }

  if(!gameOver&&!stageTransitioning)
   this.checkStageComplete();

  playerVisual.x=player.x;
this.updateBackgroundParallax();

const currentVisualHeight=
 playerPowered?
 POWER_PLAYER_HEIGHT:
 PLAYER_HEIGHT;

  playerVisual.y=
   player.y-
   (currentVisualHeight-HITBOX_HEIGHT)/2;

  this.updateCoins();
  this.updateMobileSkillButtons();
   this.updateQuestUI();

  if(playerPowered&&!gameOver){
   const remaining=
    powerEndTime-Date.now();

   if(remaining<=0)
    this.endPowerMode();
   else
    this.updatePowerUI();
  }else if(!gameOver){
   this.updatePowerUI();
  }

  if(
   Phaser.Input.Keyboard.JustDown(
    this.inventoryKey
   )
  ){
   this.toggleInventory();
   return;
  }

  if(
   Phaser.Input.Keyboard.JustDown(
    this.skillKey
   )
  ){
   this.toggleSkillPanel();
   return;
  }
   // QUEST KEY
if(
 Phaser.Input.Keyboard.JustDown(
  this.questKey
 )
){
 this.toggleQuestPanel();
 return;
}

  if(
   Phaser.Input.Keyboard.JustDown(
    this.skill1Key
   )
  )
   this.useSkill('slash');

  if(
   Phaser.Input.Keyboard.JustDown(
    this.skill2Key
   )
  )
   this.useSkill('heal');

  if(
   Phaser.Input.Keyboard.JustDown(
    this.skill3Key
   )
  )
   this.useSkill('burst');

   // NPC
this.updateNPCs();

if(
 Phaser.Input.Keyboard.JustDown(
  this.npcKey
 )||
 talkPressed
){
 talkPressed=false;
 this.talkToNPC();
}

// SHOP PANEL
if(shopOpen){
 player.body.setVelocity(0,0);

 if(enemies)
  enemies.getChildren().forEach(e=>{
   if(e&&e.body)e.body.setVelocity(0,0);
  });

 return;
}

if(npcOpen){
 player.body.setVelocity(0,0);

 if(enemies)
  enemies.getChildren().forEach(e=>{
   if(e&&e.body)e.body.setVelocity(0,0);
  });

 return;
}
   
  if(skillOpen){
   player.body.setVelocity(0,0);

   if(enemies)
    enemies.setVelocity(0,0);

   this.updateSkillPanel();

   return;
  }
// QUEST PANEL
if(questOpen){
 player.body.setVelocity(0,0);
 if(enemies)
  enemies.setVelocity(0,0);
 this.updateQuestPanel();
 return;
}
  if(inventoryOpen){
   player.body.setVelocity(0,0);

   if(enemies)
    enemies.setVelocity(0,0);

   return;
  }

  if(gameOver){
   player.body.setVelocityX(0);
   return;
  }

  if(
   Date.now()-lastDamageTime<
   PLAYER_INVULNERABLE_TIME
  ){
   const flash=
    Math.floor(Date.now()/100)%2===0;

   playerVisual.setTint(
    flash?
    0xff5555:
    0xffffff
   );
  }else{
   playerVisual.clearTint();
  }

  const keyboardLeft=
   cursors.left.isDown;

  const keyboardRight=
   cursors.right.isDown;

  if(
   keyboardLeft||
   leftPressed
  ){
   player.body.setVelocityX(
    -PLAYER_SPEED
   );

   playerFacing=-1;
   playerVisual.setFlipX(true);

   if(!playerPowered)
    this.playWalkAnimation();

  }else if(
   keyboardRight||
   rightPressed
  ){
   player.body.setVelocityX(
    PLAYER_SPEED
   );

   playerFacing=1;
   playerVisual.setFlipX(false);

   if(!playerPowered)
    this.playWalkAnimation();

  }else{
   player.body.setVelocityX(0);

   if(!playerPowered)
    this.playIdleAnimation();
  }

  const onGround=
   player.body.blocked.down||
   player.body.touching.down;

  if(
   jumpPressed&&
   onGround
  ){
   audio.play('jump');
   player.body.setVelocityY(
    -JUMP_POWER
   );

   jumpPressed=false;
  }else if(!onGround){
   jumpPressed=false;
  }

  if(
   Phaser.Input.Keyboard.JustDown(
    cursors.up
   )&&
   onGround
  ){
   audio.play('jump');
   player.body.setVelocityY(
    -JUMP_POWER
   );
  }

  if(attackPressed){
   attackPressed=false;
   this.attackPlayer();
  }

  if(
   Phaser.Input.Keyboard.JustDown(
    this.attackKey
   )||
   Phaser.Input.Keyboard.JustDown(
    this.spaceKey
   )
  ){
   this.attackPlayer();
  }

  if(powerPressed){
   powerPressed=false;
   this.activatePower();
  }

  if(
   Phaser.Input.Keyboard.JustDown(
    this.powerKey
   )
  )
   this.activatePower();

  this.updateEnemies();
 }

 // PAUSE MENU
 togglePauseMenu(){
  if(pauseOpen)this.hidePauseMenu();
  else this.showPauseMenu();
 }

 showPauseMenu(){
  if(pauseOpen)return;

  pauseOpen=true;
  this.physics.world.pause();

  pausePanel=this.add.container(
   GAME_WIDTH/2,
   GAME_HEIGHT/2
  ).setScrollFactor(0)
   .setDepth(1200);

  const shade=this.add.rectangle(
   0,
   0,
   GAME_WIDTH,
   GAME_HEIGHT,
   0x020617,
   .78
  );
  shade.setScrollFactor(0);
  const panel=this.add.rectangle(
   0,
   0,
   420,
   500,
   0x111827,
   .99
  ).setStrokeStyle(4,0x7dd3fc,1);
  panel.setScrollFactor(0);

  const title=this.add.text(0,-205,'PAUSED',{
   fontFamily:'monospace',
   fontSize:'34px',
   fontStyle:'bold',
   color:'#7dd3fc',
   stroke:'#000000',
   strokeThickness:5
  }).setOrigin(.5);

  title.setScrollFactor(0);

  const continueButton=this.createPauseButton(0,-130,'CONTINUE',0x2563eb);
  const saveButton=this.createPauseButton(0,-65,'SAVE GAME',0x166534);
  const loadButton=this.createPauseButton(0,0,'LOAD GAME',0x7c3aed);
  const settingsButton=this.createPauseButton(0,65,'SETTINGS',0x475569);
  const exitButton=this.createPauseButton(0,145,'EXIT TO MAIN MENU',0x991b1b);

  pausePanel.add([
   shade,
   panel,
   title,
   continueButton,
   continueButton.label,
   saveButton,
   saveButton.label,
   loadButton,
   loadButton.label,
   settingsButton,
   settingsButton.label,
   exitButton,
   exitButton.label
  ]);

  continueButton.on('pointerup',()=>this.hidePauseMenu());
  saveButton.on('pointerup',()=>this.saveGame());
  loadButton.on('pointerup',()=>{
   this.hidePauseMenu();
   this.loadGame();
  });
  settingsButton.on('pointerup',()=>{
   if(pausePanel)pausePanel.setVisible(false);
   this.scene.launch('SettingsScene',{fromGame:true});
   this.scene.bringToTop('SettingsScene');
  });
  exitButton.on('pointerup',()=>{
   this.hidePauseMenu();
   this.scene.start('MainMenuScene');
  });
 }

 hidePauseMenu(){
  if(pausePanel){
   pausePanel.destroy(true);
   pausePanel=null;
  }
  pauseOpen=false;
  if(this.physics&&this.physics.world)
   this.physics.world.resume();
 }

 closeSettingsMenu(){
  if(pausePanel)pausePanel.setVisible(true);
 }

 createPauseButton(x,y,text,color){
  const button=this.add.rectangle(
   x,
   y,
   300,
   48,
   color,
   .95
  ).setStrokeStyle(2,0x7dd3fc,.7)
   .setInteractive({useHandCursor:false});
  button.setScrollFactor(0);

  button.label=this.add.text(x,y,text,{
   fontFamily:'monospace',
   fontSize:'15px',
   fontStyle:'bold',
   color:'#ffffff',
   stroke:'#000000',
   strokeThickness:3
  }).setOrigin(.5);
  button.label.setScrollFactor(0);

  button.on('pointerdown',()=>{
   audio.play('click');
   button.setAlpha(.7);
  });
  button.on('pointerup',()=>button.setAlpha(.95));
  button.on('pointerupoutside',()=>button.setAlpha(.95));
  return button;
 }

 // SAVE / LOAD
 getSaveData(){
  return{
   version:SAVE_VERSION,
   savedAt:new Date().toISOString(),
   stage:currentStageNumber,
   playerX:player?.x??200,
   playerY:player?.y??checkpointY,
   playerHP,
   coinCount,
   playerLevel,
   playerEXP,
   playerEXPRequired,
   activeCheckpoint,
   checkpointX,
   checkpointY,
   inventory:inventory?.getData()??[],
   equipment:equipment?.getData()??[],
   quest:quest?.getData()??[]
  };
 }

 saveGame(showMessage=true){
  try{
   localStorage.setItem(SAVE_KEY,JSON.stringify(this.getSaveData()));
   console.log('GAME SAVED');
   if(showMessage)this.showSaveMessage('GAME SAVED',0x86efac);
   return true;
  }catch(error){
   console.error('SAVE FAILED:',error);
   if(showMessage)this.showSaveMessage('SAVE FAILED',0xff5555);
   return false;
  }
 }

 loadGame(){
  let data=null;

  try{
   const raw=localStorage.getItem(SAVE_KEY);
   if(!raw){
    this.showSaveMessage('NO SAVE DATA',0xffd166);
    return false;
   }

   data=JSON.parse(raw);
   if(!data||data.version!==SAVE_VERSION||![1,2].includes(Number(data.stage))){
    throw new Error('Invalid save data');
   }
  }catch(error){
   console.error('LOAD FAILED:',error);
   this.showSaveMessage('LOAD FAILED',0xff5555);
   return false;
  }

  this.hideInventory();
  this.hideSkillPanel();
  this.hideQuestPanel();
  this.closeShopPanel();
  this.closeNPCPanel();

  this.scene.restart({
   stage:Number(data.stage),
   keepProgress:true,
   playerX:Number(data.playerX),
   playerY:Number(data.playerY),
   playerHP:Number(data.playerHP),
   coinCount:Number(data.coinCount),
   playerLevel:Number(data.playerLevel),
   playerEXP:Number(data.playerEXP),
   playerEXPRequired:Number(data.playerEXPRequired),
   activeCheckpoint:Number(data.activeCheckpoint),
   checkpointX:Number(data.checkpointX),
   checkpointY:Number(data.checkpointY),
   inventory:Array.isArray(data.inventory)?data.inventory:[],
   equipment:Array.isArray(data.equipment)?data.equipment:[],
   quest:Array.isArray(data.quest)?data.quest:[]
  });

  console.log('GAME LOADED');
  return true;
 }

 clearSave(){
  localStorage.removeItem(SAVE_KEY);
  this.showSaveMessage('SAVE CLEARED',0xffd166);
 }

 showSaveMessage(text,color=0x86efac){
  const message=this.add.text(
   GAME_WIDTH/2,
   115,
   text,
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5).setScrollFactor(0).setDepth(1000);

  message.setTint(color);
  this.tweens.add({
   targets:message,
   y:85,
   alpha:0,
   duration:900,
   ease:'Cubic.easeOut',
   onComplete:()=>message.destroy()
  });
 }

 // STAGE
 checkStageComplete(){
  if(currentStageNumber>=2)return;
  if(!player||!player.active)return;

  if(
   player.x>=
   currentStage.worldWidth-100
  )
   this.completeStage();
 }

 completeStage(){
  if(stageTransitioning)return;

  this.saveGame(false);

  stageTransitioning=true;

  player.body.setVelocity(0,0);
  player.body.setEnable(false);
  playerVisual.anims.stop();

  this.hideInventory();
  inventoryOpen=false;

  this.hideSkillPanel();
  skillOpen=false;

  this.hideQuestPanel();
questOpen=false;
   
  this.add.text(
   GAME_WIDTH/2,
   GAME_HEIGHT/2-45,
   `STAGE ${currentStageNumber} CLEAR!`,
   {
    fontFamily:'monospace',
    fontSize:'42px',
    fontStyle:'bold',
    color:'#7dd3fc',
    stroke:'#000000',
    strokeThickness:6
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(300);

  this.add.text(
   GAME_WIDTH/2,
   GAME_HEIGHT/2+25,
   currentStageNumber<2?
   'NEXT STAGE...':
   'GAME COMPLETE!',
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(300);

  this.cameras.main.flash(
   500,
   255,
   255,
   255
  );

  this.time.delayedCall(
   1500,
   ()=>{
    if(currentStageNumber>=2){
     console.log('GAME COMPLETE');
     return;
    }

    const nextStage=
     currentStageNumber+1;

    this.scene.restart({
 stage:nextStage,
 keepProgress:true,
 playerHP,
 coinCount,
 playerLevel,
 playerEXP,
 playerEXPRequired,
 inventory:
  inventory?
  inventory.getData():
  [],
 equipment:
  equipment?
  equipment.getData():
  [],
 quest:
  quest?
  quest.getData():
  []
});
   }
  );
 }

// QUEST
createQuestUI(){
 this.add.rectangle(
  665,
  115,
  250,
  66,
  0x111827,
  .72
 ).setScrollFactor(0)
  .setDepth(100);

 questTrackerText=this.add.text(
  548,
  87,
  'QUEST',
  {
   fontFamily:'monospace',
   fontSize:'11px',
   fontStyle:'bold',
   color:'#fbbf24',
   stroke:'#000000',
   strokeThickness:3
  }
 ).setScrollFactor(0)
  .setDepth(102);

 this.updateQuestUI();
}

updateQuestUI(){
 if(!questTrackerText||!quest)return;

 const q=quest.getActive();

 if(!q){
  questTrackerText.setText(
   'QUEST\nALL QUESTS COMPLETE'
  );
  return;
 }

 questTrackerText.setText(
  `QUEST\n${q.name}: ${q.progress}/${q.target}`
 );
}

toggleQuestPanel(){
 if(
  gameOver||
  stageTransitioning||
  inventoryOpen||
  skillOpen
 )
  return;

 questOpen=!questOpen;

 if(questOpen)
  this.showQuestPanel();
 else
  this.hideQuestPanel();
}

showQuestPanel(){
 if(questPanel||!quest)return;

 questPanel=this.add.container(
  GAME_WIDTH/2,
  GAME_HEIGHT/2
 ).setScrollFactor(0)
  .setDepth(700);

 const bg=this.add.rectangle(
  0,
  0,
  620,
  360,
  0x111827,
  .98
 );

 bg.setStrokeStyle(
  4,
  0xf59e0b,
  1
 );

 questPanel.add(bg);

 questPanel.add(
  this.add.text(
   0,
   -145,
   'QUESTS',
   {
    fontFamily:'monospace',
    fontSize:'28px',
    fontStyle:'bold',
    color:'#fbbf24',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5)
 );

 const close=this.add.rectangle(
  255,
  -145,
  70,
  28,
  0x334155,
  1
 );

 close.setStrokeStyle(
  2,
  0xf59e0b,
  1
 );

 close.setInteractive();

 questPanel.add(close);

 questPanel.add(
  this.add.text(
   255,
   -145,
   'CLOSE',
   {
    fontFamily:'monospace',
    fontSize:'10px',
    fontStyle:'bold',
    color:'#fff'
   }
  ).setOrigin(.5)
 );

 close.on(
  'pointerdown',
  ()=>this.toggleQuestPanel()
 );

 quest.getAll().forEach(
  (q,i)=>{
   const y=-75+i*68;

   const box=this.add.rectangle(
    0,
    y,
    560,
    55,
    q.completed?
    0x14532d:
    0x1f2937,
    1
   );

   box.setStrokeStyle(
    2,
    q.completed?
    0x22c55e:
    0x475569,
    1
   );

   const text=this.add.text(
    -250,
    y-17,
    `${q.completed?'✓':'○'} ${q.name}\n${q.description}`,
    {
     fontFamily:'monospace',
     fontSize:'11px',
     fontStyle:'bold',
     color:'#fff',
     lineSpacing:2
    }
   );

   const progress=this.add.text(
    240,
    y,
    q.completed?
    'COMPLETE':
    `${q.progress}/${q.target}`,
    {
     fontFamily:'monospace',
     fontSize:'12px',
     fontStyle:'bold',
     color:q.completed?
     '#86efac':
     '#fbbf24'
    }
   ).setOrigin(1,.5);

   const reward=this.add.text(
    240,
    y+17,
    `+${q.reward.exp} EXP  +${q.reward.coin} COIN`,
    {
     fontFamily:'monospace',
     fontSize:'8px',
     color:'#cbd5e1'
    }
   ).setOrigin(1,.5);

   questPanel.add([
    box,
    text,
    progress,
    reward
   ]);
  }
 );

 questPanel.add(
  this.add.text(
   0,
   155,
   'Q = QUEST MENU',
   {
    fontFamily:'monospace',
    fontSize:'11px',
    color:'#fff6a0'
   }
  ).setOrigin(.5)
 );
}

updateQuestPanel(){
 if(!questPanel)return;


}

hideQuestPanel(){
 if(questPanel){
  questPanel.destroy(true);
  questPanel=null;
 }
}

handleQuestProgress(done=[]){
 if(!quest||!done.length)return;

 done.forEach(
  id=>{
   const reward=quest.getReward(id);

   if(reward.coin){
    coinCount+=reward.coin;
    this.updateCoinUI();
   }

   if(reward.exp)
    this.addEXP(reward.exp);

   const q=quest.get(id);

   if(q){
    const text=this.add.text(
     GAME_WIDTH/2,
     150,
     `QUEST COMPLETE!\n${q.name}\n+${reward.exp} EXP  +${reward.coin} COIN`,
     {
      fontFamily:'monospace',
      fontSize:'16px',
      fontStyle:'bold',
      align:'center',
      color:'#fbbf24',
      stroke:'#000000',
      strokeThickness:4
     }
    ).setOrigin(.5)
     .setScrollFactor(0)
     .setDepth(800);

    this.tweens.add({
     targets:text,
     y:105,
     alpha:0,
     duration:1400,
     ease:'Cubic.easeOut',
     onComplete:()=>text.destroy()
    });
   }
  }
 );

 this.updateQuestUI();
}
  
  
 // SKILL
 toggleSkillPanel(){
  if(
   gameOver||
   stageTransitioning||
   inventoryOpen
  )
   return;

  skillOpen=!skillOpen;

  if(skillOpen)
   this.showSkillPanel();
  else
   this.hideSkillPanel();
 }

 showSkillPanel(){
  if(skillPanel||!skills)return;

  skillPanel=this.add.container(
   GAME_WIDTH/2,
   GAME_HEIGHT/2
  ).setScrollFactor(0)
   .setDepth(700);

  const bg=this.add.rectangle(
   0,
   0,
   SKILL_PANEL_WIDTH,
   SKILL_PANEL_HEIGHT,
   0x111827,
   .98
  );

  bg.setStrokeStyle(
   4,
   0xa855f7,
   1
  );

  skillPanel.add(bg);

  skillPanel.add(
   this.add.text(
    0,
    -115,
    'SKILLS',
    {
     fontFamily:'monospace',
     fontSize:'28px',
     fontStyle:'bold',
     color:'#d8b4fe',
     stroke:'#000000',
     strokeThickness:4
    }
   ).setOrigin(.5)
  );

  const close=this.add.rectangle(
   235,
   -115,
   70,
   28,
   0x334155,
   1
  );

  close.setStrokeStyle(
   2,
   0xa855f7,
   1
  );

  close.setInteractive();

  const closeText=this.add.text(
   235,
   -115,
   'CLOSE',
   {
    fontFamily:'monospace',
    fontSize:'10px',
    fontStyle:'bold',
    color:'#fff'
   }
  ).setOrigin(.5);

  skillPanel.add([
   close,
   closeText
  ]);

  close.on(
   'pointerdown',
   ()=>this.toggleSkillPanel()
  );

  ['slash','heal','burst'].forEach(
   (id,i)=>{
    const x=-190+i*190;
    const def=skills.get(id);

    const button=this.add.rectangle(
     x,
     10,
     165,
     120,
     0x1f2937,
     1
    );

    button.setStrokeStyle(
     2,
     0x475569,
     1
    );

    button.setInteractive();

    const name=this.add.text(
     x,
     -25,
     def.name,
     {
      fontFamily:'monospace',
      fontSize:'15px',
      fontStyle:'bold',
      color:'#ffffff'
     }
    ).setOrigin(.5);

    const desc=this.add.text(
     x,
     5,
     def.description,
     {
      fontFamily:'monospace',
      fontSize:'10px',
      color:'#cbd5e1',
      align:'center',
      wordWrap:{
       width:145
      }
     }
    ).setOrigin(.5);

    const cooldown=this.add.text(
     x,
     42,
     'READY',
     {
      fontFamily:'monospace',
      fontSize:'12px',
      fontStyle:'bold',
      color:'#7dd3fc'
     }
    ).setOrigin(.5);

    button.skillId=id;
    button.cooldownText=cooldown;

    skillPanel.add([
     button,
     name,
     desc,
     cooldown
    ]);

    button.on(
     'pointerdown',
     ()=>this.useSkill(id)
    );
   }
  );

  skillPanel.add(
   this.add.text(
    0,
    105,
    'K / SKILL = MENU   1 Slash   2 Heal   3 Burst',
    {
     fontFamily:'monospace',
     fontSize:'11px',
     color:'#fff6a0'
    }
   ).setOrigin(.5)
  );

  this.updateSkillPanel();
 }

 hideSkillPanel(){
  if(skillPanel){
   skillPanel.destroy(true);
   skillPanel=null;
  }
 }

 updateSkillPanel(){
  if(!skillPanel||!skills)return;

  skillPanel.list.forEach(
   object=>{
    if(
     !object.cooldownText||
     !object.skillId
    )
     return;

    const left=
     skills.getRemaining(
      object.skillId
     );

    object.cooldownText.setText(
     left>0?
     (left/1000).toFixed(1)+'s':
     'READY'
    );

    object.cooldownText.setColor(
     left>0?
     '#fca5a5':
     '#7dd3fc'
    );
   }
  );
 }

 useSkill(id){
  if(
   gameOver||
   inventoryOpen||
   stageTransitioning||
   !skills
  )
   return;

  const skill=skills.use(id);

  if(!skill)return;

  if(id==='slash')
   this.skillFrontAttack(skill);

  if(id==='heal')
   this.skillHeal(skill);

  if(id==='burst')
   this.skillBurst(skill);

  this.updateSkillPanel();
  this.updateMobileSkillButtons();
 }

 skillFrontAttack(skill){
  const damage=
   skill.damage+
   this.getEquipmentStats().atk;

  let hit=0;

  enemies.getChildren().forEach(
   enemy=>{
    if(
     !enemy||
     !enemy.active||
     !enemy.body
    )
     return;

    const dx=
     enemy.x-player.x;

    const dy=
     Math.abs(
      enemy.y-player.y
     );

    if(
     Math.abs(dx)>
     SKILL_FRONT_DISTANCE||
     dy>100
    )
     return;

    if(
     playerFacing===1&&
     dx<0
    )
     return;

    if(
     playerFacing===-1&&
     dx>0
    )
     return;

    this.damageEnemy(
     enemy,
     damage
    );

    hit++;
   }
  );

  this.createSkillEffect(
   player.x+playerFacing*70,
   player.y,
   0xa855f7,
   hit?1:.6,
   85
  );
 }

 skillHeal(skill){
  const maxHP=
   playerPowered?
   PLAYER_POWER_MAX_HP+
   this.getEquipmentStats().maxHP:
   this.getPlayerMaxHP();

  const old=playerHP;

  playerHP=Phaser.Math.Clamp(
   playerHP+skill.heal,
   0,
   maxHP
  );

  const amount=
   playerHP-old;

  this.updateHPUI();

  const text=this.add.text(
   player.x,
   player.y-75,
   '+'+amount+' HP',
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#7cff8a',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setOrigin(.5)
   .setDepth(80);

  this.tweens.add({
   targets:text,
   y:text.y-45,
   alpha:0,
   duration:700,
   onComplete:()=>text.destroy()
  });

  this.createSkillEffect(
   player.x,
   player.y,
   0x22c55e,
   1,
   75
  );
 }

 skillBurst(skill){
  const damage=
   skill.damage+
   this.getEquipmentStats().atk;

  let hit=0;

  enemies.getChildren().forEach(
   enemy=>{
    if(
     !enemy||
     !enemy.active||
     !enemy.body
    )
     return;

    const distance=
     Phaser.Math.Distance.Between(
      player.x,
      player.y,
      enemy.x,
      enemy.y
     );

    if(
     distance>
     SKILL_BURST_RADIUS
    )
     return;

    this.damageEnemy(
     enemy,
     damage
    );

    hit++;
   }
  );

  this.createSkillEffect(
   player.x,
   player.y,
   0xf59e0b,
   hit?1:.65,
   SKILL_BURST_RADIUS
  );
 }

 createSkillEffect(
  x,
  y,
  color,
  alpha=1,
  radius=70
 ){
  const ring=this.add.circle(
   x,
   y,
   20,
   color,
   alpha*.25
  );

  ring.setStrokeStyle(
   5,
   color,
   alpha
  );

  ring.setDepth(75);

  this.tweens.add({
   targets:ring,
   radius,
   alpha:0,
   duration:350,
   ease:'Cubic.easeOut',
   onComplete:()=>ring.destroy()
  });
 }

 // MOBILE SKILL BUTTONS
 createSkillButton(id,x,y,icon){
  const button=this.add.rectangle(
   x,
   y,
   72,
   62,
   0x222222,
   .72
  );

  button.setStrokeStyle(
   2,
   0xa855f7,
   1
  );

  button.setInteractive({
   useHandCursor:false
  });

  button.setScrollFactor(0);
  button.setDepth(100);

  const iconText=this.add.text(
   x,
   y-13,
   icon,
   {
    fontFamily:'sans-serif',
    fontSize:'21px',
    fontStyle:'bold',
    color:'#ffffff'
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(101);

  const name=this.add.text(
   x,
   y+7,
   id==='slash'?'SLASH':
   id==='heal'?'HEAL':
   'BURST',
   {
    fontFamily:'monospace',
    fontSize:'9px',
    fontStyle:'bold',
    color:'#ffffff'
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(101);

  const cooldown=this.add.text(
   x,
   y+23,
   'READY',
   {
    fontFamily:'monospace',
    fontSize:'8px',
    fontStyle:'bold',
    color:'#7dd3fc'
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(101);

  const cooldownOverlay=this.add.rectangle(
   x,
   y,
   68,
   58,
   0x000000,
   .62
  ).setScrollFactor(0)
   .setDepth(102)
   .setVisible(false);

  const cooldownRing=this.add.rectangle(
   x,
   y,
   68,
   58,
   0x000000,
   0
  ).setScrollFactor(0)
   .setDepth(103)
   .setVisible(false);
  cooldownRing.setStrokeStyle(5,0xfca5a5,1);

  const cooldownNumber=this.add.text(
   x,
   y,
   '',
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(104)
   .setVisible(false);

  button.skillId=id;
  button.cooldownText=cooldown;
  button.nameText=name;
  button.iconText=iconText;
  button.cooldownOverlay=cooldownOverlay;
  button.cooldownRing=cooldownRing;
  button.cooldownNumber=cooldownNumber;

  skillButtons[id]=button;

  button.on(
   'pointerdown',
   ()=>{
    button.setAlpha(.9);
    this.useSkill(id);
   }
  );

  button.on(
   'pointerup',
   ()=>{
    button.setAlpha(
     skills&&
     skills.getRemaining(id)>0?
     .4:
     .72
    );
   }
  );

  button.on(
   'pointerupoutside',
   ()=>{
    button.setAlpha(
     skills&&
     skills.getRemaining(id)>0?
     .4:
     .72
    );
   }
  );

  button.on(
   'pointercancel',
   ()=>button.setAlpha(
    skills&&skills.getRemaining(id)>0?.4:.72
   )
  );

  return button;
 }

 updateMobileSkillButtons(){
  if(!skills)return;

  Object.values(skillButtons).forEach(
   button=>{
    if(
     !button||
     !button.active||
     !button.cooldownText
    )
     return;

    const left=
     skills.getRemaining(
      button.skillId
     );

    const definition=skills.get(button.skillId);
    const ratio=definition&&definition.cooldown>0?
     Phaser.Math.Clamp(left/definition.cooldown,0,1):0;

    button.cooldownText.setText(
     left>0?
     (left/1000).toFixed(1)+'s':
     'READY'
    );

    button.cooldownText.setColor(
     left>0?
     '#fca5a5':
     '#7dd3fc'
    );

    button.setAlpha(left>0?.45:.72);

    if(button.cooldownOverlay){
     button.cooldownOverlay.setVisible(left>0);
     button.cooldownRing.setVisible(left>0);
     button.cooldownNumber.setVisible(left>0);

     if(left>0){
      button.cooldownRing.rotation=
       (1-ratio)*Math.PI*2;
      button.cooldownNumber.setText(
       String(Math.ceil(left/1000))
      );
     }
    }

    button.iconText.setAlpha(left>0?.08:1);
    button.nameText.setAlpha(left>0?.15:1);
   }
  );
 }

// INVENTORY
toggleInventory(){
 if(
  gameOver||
  stageTransitioning||
  shopOpen
 )
  return;

 inventoryOpen=!inventoryOpen;

 if(inventoryOpen){
  this.showInventory();
 }else{
  this.hideInventory();
 }
}

 showInventory()
 {
  if(
   inventoryPanel||
   !inventory
  )
   return;

  inventoryPanel=this.add.container(
   GAME_WIDTH/2,
   GAME_HEIGHT/2
  ).setScrollFactor(0)
   .setDepth(500)
   .setExclusive(true);

  const bg=this.add.rectangle(
  0,
  0,
  760,
  500,
  0x111827,
  .98
);

  bg.setScrollFactor(0);

  bg.setStrokeStyle(
   4,
   0x7dd3fc,
   1
  );

  inventoryPanel.add(bg);

  inventoryPanel.add(
   this.add.text(
    0,
    -215,
    'INVENTORY',
    {
     fontFamily:'monospace',
     fontSize:'36px',
     fontStyle:'bold',
     color:'#7dd3fc',
     stroke:'#000000',
     strokeThickness:4
    }
   ).setOrigin(.5)
  );

  const close=this.add.rectangle(
   305,
  -210,
  120,
  52,
  0x334155,
  1
);

  close.setStrokeStyle(
   2,
   0x7dd3fc,
   1
  );

  close.setScrollFactor(0);
  close.setInteractive();

  const closeText=this.add.text(
   305,
   -210,
   'CLOSE',
   {
    fontFamily:'monospace',
    fontSize:'15px',
    fontStyle:'bold',
    color:'#ffffff'
   }
  ).setOrigin(.5);

  inventoryPanel.add([
   close,
   closeText
  ]);

 close.on(
   'pointerup',
   (pointer, localX, localY, event)=>{
    event?.stopPropagation();
    this.toggleInventory();
   }
  );

  inventoryPanel.add(
   this.add.text(
    -300,
    -135,
    'EQUIPMENT',
    {
     fontFamily:'monospace',
     fontSize:'14px',
     fontStyle:'bold',
     color:'#ffffff'
    }
   ).setOrigin(0,.5)
  );

  this.createEquipmentSlot(
 -245,
 -125,
 'weapon',
 'WEAPON'
);

this.createEquipmentSlot(
 0,
 -125,
 'armor',
 'ARMOR'
);

this.createEquipmentSlot(
 245,
 -125,
 'accessory',
 'ACCESSORY'
);

  const stats=equipment.getStats();

  inventoryPanel.add(
   this.add.text(
    0,
    -55,
    `ATK +${stats.atk}   DEF +${stats.def}   MAX HP +${stats.maxHP}`,
    {
     fontFamily:'monospace',
     fontSize:'12px',
     fontStyle:'bold',
     color:'#fff6a0'
    }
   ).setOrigin(.5)
  );

  for(
   let i=0;
   i<inventory.size;
   i++
  ){
   const x=
    -280+
    (i%5)*140;

   const y=
    -35+
    Math.floor(i/5)*62;

   const item=
    inventory.getSlot(i);

   const slot=this.add.rectangle(
x,
y,
135,
56,
0x1f2937,
 1
);

   slot.setStrokeStyle(
    2,
    0x475569,
    1
   );

   slot.setScrollFactor(0);
   slot.setInteractive();

   const name=this.add.text(
    x-43,
    y-7,
    item?
    item.name:
    'EMPTY',
    {
     fontFamily:'monospace',
     fontSize:'13px',
     color:item?
     '#ffffff':
     '#64748b'
    }
   ).setOrigin(0,.5);

   const count=this.add.text(
    x+43,
    y+9,
    item?
    `x${item.count}`:
    '',
    {
     fontFamily:'monospace',
     fontSize:'13px',
     fontStyle:'bold',
     color:'#fff6a0'
    }
   ).setOrigin(1,.5);

   inventoryPanel.add([
    slot,
    name,
    count
   ]);

   slot.on(
    'pointerup',
    (pointer, localX, localY, event)=>{
     event?.stopPropagation();
     const current=
      inventory.getSlot(i);

     if(!current)return;

     if(
      current.type===
      'equipment'
     ){
      this.equipInventoryItem(i);
      return;
     }

     const used=
      inventory.use(i);

     if(used){
      this.useInventoryItem(
       used
      );

      this.refreshInventory();
     }
    }
   );
  }
 }

 createEquipmentSlot(
  x,
  y,
  type,
  label
 )
 {
  const item=
   equipment.get(type);

  const slot=this.add.rectangle(
  x,
  y,
  190,
  55,
  0x1f2937,
  1
 );

  slot.setStrokeStyle(
   2,
   item?
   0x7dd3fc:
   0x475569,
   1
  );

  slot.setScrollFactor(0);
  slot.setInteractive();

  const title=this.add.text(
   x-85,
   y-10,
   label,
   {
    fontFamily:'monospace',
    fontSize:'9px',
    fontStyle:'bold',
    color:'#7dd3fc'
   }
  ).setOrigin(0,.5);

  const name=this.add.text(
   x-85,
   y+8,
   item?
   item.name:
   'EMPTY',
   {
    fontFamily:'monospace',
    fontSize:'10px',
    color:item?
    '#ffffff':
    '#64748b'
   }
  ).setOrigin(0,.5);

  inventoryPanel.add([
   slot,
   title,
   name
  ]);

  slot.on(
   'pointerup',
   (pointer, localX, localY, event)=>{
    event?.stopPropagation();
    if(!equipment.get(type))
     return;

    const empty=
     inventory.findEmptySlot();

    if(empty<0)
     return;

    const old=
     equipment.unequip(type);

    if(old)
     inventory.setSlot(
      empty,
      old
     );

    this.updateHPUI();
    this.refreshInventory();
   }
  );
 }

 equipInventoryItem(index){
  const item=
   inventory.getSlot(index);

  if(
   !item||
   item.type!=='equipment'
  )
   return;

  const old=
   equipment.equip(item);

  if(old)
   inventory.setSlot(
    index,
    old
   );
  else
   inventory.setSlot(
    index,
    null
   );

  this.updateHPUI();
  this.refreshInventory();
 }

 // INVENTORY
refreshInventory(){
 if(inventoryRefreshTimer){
  inventoryRefreshTimer.remove(false);
  inventoryRefreshTimer=null;
 }

 if(!inventoryOpen)return;

 // Rebuild only after the current pointer event has finished.
 inventoryRefreshTimer=this.time.delayedCall(0,()=>{
  inventoryRefreshTimer=null;
  if(!inventoryOpen)return;
  this.hideInventory();
  this.showInventory();
 });
}

 hideInventory(){
  if(inventoryRefreshTimer){
   inventoryRefreshTimer.remove(false);
   inventoryRefreshTimer=null;
  }

  if(inventoryPanel){
   inventoryPanel.destroy(true);
   inventoryPanel=null;
  }
 }

 useInventoryItem(item){
  if(!item)return;

  if(item.id==='potion'){
   const maxHP=
    this.getPlayerMaxHP();

   const oldHP=
    playerHP;

   playerHP=
    Phaser.Math.Clamp(
     playerHP+30,
     0,
     maxHP
    );

   this.updateHPUI();

   const heal=
    playerHP-oldHP;

   if(heal>0){
    const text=this.add.text(
     player.x,
     player.y-80,
     `+${heal} HP`,
     {
      fontFamily:'monospace',
      fontSize:'18px',
      fontStyle:'bold',
      color:'#7cff8a',
      stroke:'#000000',
      strokeThickness:3
     }
    ).setOrigin(.5)
     .setDepth(600);

    this.tweens.add({
     targets:text,
     y:text.y-35,
     alpha:0,
     duration:600,
     onComplete:()=>text.destroy()
    });
   }
  }
 }

 getPlayerMaxHP(){
  const stats=
   equipment?
   equipment.getStats():
   {
    maxHP:0
   };

  return PLAYER_MAX_HP+
   (playerLevel-
    PLAYER_START_LEVEL)*
   PLAYER_LEVEL_UP_HP_BONUS+
   stats.maxHP;
 }

 getEquipmentStats(){
  return equipment?
   equipment.getStats():
   {
    atk:0,
    def:0,
    maxHP:0
   };
 }

 // COINS
 updateCoins(){
  if(coins)
   coins.getChildren().forEach(
    coin=>{
     if(
      !coin||
      !coin.active||
      !coin.body
     )
      return;

     this.updateCoinMagnet(
      coin
     );

     if(coin.coinSymbol){
      coin.coinSymbol.x=coin.x;
      coin.coinSymbol.y=coin.y;
      coin.coinSymbol.rotation=coin.rotation;
     }
    }
   );

  if(coinDrops)
   coinDrops.getChildren().forEach(
    coin=>{
     if(
      !coin||
      !coin.active||
      !coin.body
     )
      return;

     if(coin.body.blocked.down){
      coin.body.setVelocityX(0);
      coin.body.setDragX(1800);
     }

     this.updateCoinMagnet(
      coin
     );

     if(coin.coinSymbol){
      coin.coinSymbol.x=coin.x;
      coin.coinSymbol.y=coin.y;
      coin.coinSymbol.rotation=coin.rotation;
     }
    }
   );
 }

 updateCoinMagnet(coin){
  if(
   !COIN_MAGNET_ENABLED||
   !player||
   !player.active||
   coin.collected
  )
   return;

  if(
   coin.isDrop&&
   Date.now()<(coin.magnetDelayUntil||0)
  )
   return;

  const distance=
   Phaser.Math.Distance.Between(
    coin.x,
    coin.y,
    player.x,
    player.y
   );

  if(
   !coin.magnetized&&
   distance<=COIN_MAGNET_RADIUS
  ){
   coin.magnetized=true;

   if(coin.body)
    coin.body.setVelocity(0,0);

   this.createCoinMagnetEffect(
    coin
   );
  }

  if(
   coin.magnetized&&
   coin.body
  ){
   const dx=
    player.x-coin.x;

   const dy=
    player.y-coin.y;

   const d=
    Math.sqrt(
     dx*dx+
     dy*dy
    );

   if(
    d<=COIN_AUTO_PICKUP_DISTANCE
   ){
    this.collectCoin(
     player,
     coin
    );

    return;
   }

   if(d>0)
    coin.body.setVelocity(
     dx/d*COIN_MAGNET_SPEED,
     dy/d*COIN_MAGNET_SPEED
    );
  }
 }

 createCoinMagnetEffect(coin){
  if(!coin||!coin.active)return;

  const ring=this.add.circle(
   coin.x,
   coin.y,
   16,
   0xffd84a,
   0
  );

  ring.setStrokeStyle(
   2,
   0xfff2a0,
   .9
  );

  ring.setDepth(12);

  this.tweens.add({
   targets:ring,
   radius:26,
   alpha:0,
   duration:220,
   ease:'Cubic.easeOut',
   onComplete:()=>ring.destroy()
  });
 }

 // CHECKPOINT
 createCheckpoint(x,index){
  const groundTop=GROUND_Y;

  const checkpoint=this.add.rectangle(
   x,
   groundTop-CHECKPOINT_HEIGHT/2,
   CHECKPOINT_WIDTH,
   CHECKPOINT_HEIGHT,
   0xffffff,
   0
  );

  this.physics.add.existing(
   checkpoint,
   true
  );

  checkpoint.checkpointIndex=index;
  checkpoint.checkpointX=x;
  checkpoint.checkpointY=
   groundTop-HITBOX_HEIGHT/2;

  checkpoint.setVisible(false);
  checkpoints.add(checkpoint);

  const pole=this.add.rectangle(
   x,
   groundTop-45,
   7,
   90,
   0x6b4423
  ).setDepth(5);

  const flagColor=
   index<=activeCheckpoint?
   0x38d9ff:
   0xffd84a;

  const flag=this.add.triangle(
   x+25,
   groundTop-72,
   0,
   0,
   35,
   12,
   0,
   24,
   flagColor
  ).setOrigin(0,.5)
   .setDepth(6);

  const label=this.add.text(
   x,
   groundTop-105,
   `CP ${index}`,
   {
    fontFamily:'monospace',
    fontSize:'11px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setOrigin(.5)
   .setDepth(20);

  const glow=this.add.circle(
   x,
   groundTop-45,
   CHECKPOINT_GLOW_RADIUS,
   flagColor,
   .10
  ).setDepth(4);

  checkpoint.pole=pole;
  checkpoint.flag=flag;
  checkpoint.label=label;
  checkpoint.glow=glow;

  this.tweens.add({
   targets:flag,
   scaleX:1.08,
   duration:700,
   yoyo:true,
   repeat:-1,
   ease:'Sine.easeInOut'
  });

  return checkpoint;
 }

 activateCheckpoint(
  playerObject,
  checkpoint
 ){
  if(
   gameOver||
   !checkpoint||
   !checkpoint.active
  )
   return;

  const index=
   checkpoint.checkpointIndex;

  if(index<=activeCheckpoint)
   return;

  activeCheckpoint=index;
  checkpointX=checkpoint.checkpointX;
  checkpointY=checkpoint.checkpointY;
  audio.play('checkpoint');

  checkpoints.getChildren().forEach(
   cp=>{
    if(!cp||!cp.active)return;

    const active=
     cp.checkpointIndex<=
     activeCheckpoint;

    if(cp.flag)
     cp.flag.setFillStyle(
      active?
      0x38d9ff:
      0xffd84a
     );

    if(cp.glow){
     cp.glow.setFillStyle(
      active?
      0x38d9ff:
      0xffd84a
     );

     cp.glow.setAlpha(
      active?.18:.10
     );
    }
   }
  );

  this.updateCheckpointUI();
  this.saveGame(false);
  this.createCheckpointEffect(checkpoint);

  const message=this.add.text(
   checkpoint.x,
   checkpoint.y-70,
   'CHECKPOINT!',
   {
    fontFamily:'monospace',
    fontSize:'22px',
    fontStyle:'bold',
    color:'#38d9ff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5)
   .setDepth(100);

  this.tweens.add({
   targets:message,
   y:checkpoint.y-120,
   alpha:0,
   duration:1000,
   ease:'Cubic.easeOut',
   onComplete:()=>message.destroy()
  });
 }

 createCheckpointEffect(checkpoint){
  if(!checkpoint)return;

  const ring=this.add.circle(
   checkpoint.x,
   checkpoint.y,
   20,
   0x38d9ff,
   .20
  );

  ring.setStrokeStyle(
   5,
   0x7dd3fc,
   1
  );

  ring.setDepth(50);

  this.tweens.add({
   targets:ring,
   radius:75,
   alpha:0,
   duration:600,
   ease:'Cubic.easeOut',
   onComplete:()=>ring.destroy()
  });

  const flash=this.add.circle(
   checkpoint.x,
   checkpoint.y,
   35,
   0xffffff,
   .25
  );

  flash.setDepth(49);

  this.tweens.add({
   targets:flash,
   radius:90,
   alpha:0,
   duration:450,
   ease:'Cubic.easeOut',
   onComplete:()=>flash.destroy()
  });
 }

 createCheckpointUI(){
  checkpointText=this.add.text(
   220,
   78,
   'CHECKPOINT: 0',
   {
    fontFamily:'monospace',
    fontSize:'13px',
    fontStyle:'bold',
    color:'#38d9ff',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setScrollFactor(0)
   .setDepth(102);

  this.updateCheckpointUI();
   // QUEST CHECKPOINT
this.handleQuestProgress(
 quest?
 quest.onCheckpoint():
 []
);
 }

 updateCheckpointUI(){
  if(checkpointText)
   checkpointText.setText(
    `CHECKPOINT: ${activeCheckpoint}`
   );
 }

 // POWER
 activatePower(){
  if(
   gameOver||
   playerPowered||
   Date.now()<powerCooldownUntil
  )
   return;

  const stats=
   this.getEquipmentStats();

  playerHP=Phaser.Math.Clamp(
   playerHP+
   PLAYER_POWER_BONUS_HP,
   0,
   PLAYER_POWER_MAX_HP+
   stats.maxHP
  );

  playerPowered=true;
  audio.play('power');
  powerCooldownUntil=Date.now()+PLAYER_POWER_COOLDOWN;

  powerEndTime=
   Date.now()+
   PLAYER_POWER_DURATION;

  playerVisual.anims.stop();

  playerVisual.setTexture(
   'power'
  );

  playerVisual.setDisplaySize(
   POWER_PLAYER_WIDTH,
   POWER_PLAYER_HEIGHT
  );

  playerVisual.x=player.x;

  playerVisual.y=
   player.y-
   (POWER_PLAYER_HEIGHT-
    HITBOX_HEIGHT)/2;

  this.updateHPUI();
  this.updatePowerUI();

  if(powerButton){
   powerButton.setAlpha(.35);

   if(powerButton.label)
    powerButton.label.setAlpha(.45);
  }

  this.createPowerActivationEffect();
 }

 endPowerMode(){
  if(!playerPowered)return;

  const maxHP=
   this.getPlayerMaxHP();

  playerHP=
   Math.min(
    playerHP,
    maxHP
   );

  playerPowered=false;
  powerEndTime=0;

  playerVisual.setTexture(
   'idle1'
  );

  playerVisual.setDisplaySize(
   PLAYER_WIDTH,
   PLAYER_HEIGHT
  );

  playerVisual.x=player.x;

  playerVisual.y=
   player.y-
   (PLAYER_HEIGHT-
    HITBOX_HEIGHT)/2;

  const moving=
   leftPressed||
   rightPressed||
   cursors.left.isDown||
   cursors.right.isDown;

  if(moving)
   this.playWalkAnimation();
  else
   this.playIdleAnimation();

  this.updateHPUI();
  this.updatePowerUI();

  if(powerButton){
   powerButton.setAlpha(.65);

   if(powerButton.label)
    powerButton.label.setAlpha(1);
  }

  this.createPowerEndEffect();
 }

 createPowerActivationEffect(){
  const ring=this.add.circle(
   player.x,
   player.y,
   35,
   0x8b5cf6,
   .25
  );

  ring.setStrokeStyle(
   5,
   0xd8b4fe,
   1
  );

  ring.setDepth(25);

  this.tweens.add({
   targets:ring,
   radius:90,
   alpha:0,
   duration:500,
   ease:'Cubic.easeOut',
   onComplete:()=>ring.destroy()
  });
 }

 createPowerEndEffect(){
  const ring=this.add.circle(
   player.x,
   player.y,
   70,
   0x8b5cf6,
   0
  );

  ring.setStrokeStyle(
   5,
   0xffffff,
   1
  );

  ring.setDepth(25);

  this.tweens.add({
   targets:ring,
   radius:25,
   alpha:0,
   duration:350,
   ease:'Cubic.easeIn',
   onComplete:()=>ring.destroy()
  });
 }

 // ANIMATION
 createPlayerAnimations(){
  if(!this.anims.exists('player-idle')){
   this.anims.create({
    key:'player-idle',
    frames:[
     {key:'idle1'},
     {key:'idle2'},
     {key:'idle3'},
     {key:'idle4'}
    ],
    frameRate:4,
    repeat:-1
   });
  }

  if(!this.anims.exists('player-walk')){
   this.anims.create({
    key:'player-walk',
    frames:[
     {key:'walk1'},
     {key:'walk2'},
     {key:'walk3'},
     {key:'walk4'},
     {key:'walk5'},
     {key:'walk6'}
    ],
    frameRate:10,
    repeat:-1
   });
  }
 }

 playIdleAnimation(){
  if(playerPowered)return;

  if(
   playerVisual.anims.currentAnim?.key!==
   'player-idle'
  )
   playerVisual.play('player-idle');
 }

 playWalkAnimation(){
  if(playerPowered)return;

  if(
   playerVisual.anims.currentAnim?.key!==
   'player-walk'
  )
   playerVisual.play('player-walk');
 }

 // PLATFORM
 createPlatform(
  x,
  y,
  width,
  height
 ){
  const platform=this.add.rectangle(
   x,
   y,
   width,
   height,
   0x18851c
  );

  platform.setOrigin(.5);

  this.physics.add.existing(
   platform,
   true
  );

  platforms.add(platform);

  return platform;
 }

// BACKGROUND
createForestBackground(){
 const w=currentStage.worldWidth;
 const baseY=337.5;

 const sky=this.add.image(w/2,baseY,'bgSky');
 const mountain=this.add.image(w/2,baseY,'bgMountain');
 const forest=this.add.image(w/2,baseY,'bgForest');

 const scale=w/800;

 sky.setScale(scale).setDepth(-30);
 mountain.setScale(scale).setDepth(-20);
 forest.setScale(scale).setDepth(-10);

 bgSkyLayer={
  object:sky,
  x:w/2,
  y:baseY,
  speed:.18,
  ySpeed:.05
 };

 bgMountainLayer={
  object:mountain,
  x:w/2,
  y:baseY,
  speed:.45,
  ySpeed:.15
 };

 bgForestLayer={
  object:forest,
  x:w/2,
  y:baseY,
  speed:.70,
  ySpeed:.25
 };
}

 // BACKGROUND PARALLAX
updateBackgroundParallax(){
 const camera=this.cameras.main;

 const layers=[
  bgSkyLayer,
  bgMountainLayer,
  bgForestLayer
 ];

 layers.forEach(layer=>{
  if(!layer?.object)return;

  layer.object.x=
   layer.x+
   camera.scrollX*(1-layer.speed);

  layer.object.y=
   layer.y+
   camera.scrollY*(1-layer.ySpeed);
 });
}

 // COINS
 createCoins(){
  if(
   !currentStage||
   !currentStage.coins
  )
   return;

  currentStage.coins.forEach(
   c=>{
    this.createCoin(
     c.x,
     c.y
    );
   }
  );
 }

 createCoin(x,y){
  const coin=this.add.circle(
   x,
   y,
   COIN_SIZE/2,
   0xffc928
  );

  coin.setStrokeStyle(
   3,
   0xffa500
  );

  coin.setDepth(8);

  const symbol=this.add.text(
   x,
   y,
   '$',
   {
    fontFamily:'monospace',
    fontSize:'18px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#9b6500',
    strokeThickness:2
   }
  ).setOrigin(.5)
   .setDepth(9);

  coin.coinSymbol=symbol;
  coin.coinValue=COIN_VALUE;
  coin.collected=false;
  coin.magnetized=false;
  coin.isDrop=false;

  this.physics.add.existing(coin);

  if(
   coin.body&&
   coin.body.setCircle
  ){
   coin.body.setCircle(
    COIN_SIZE/2
   );

   coin.body.setAllowGravity(false);
   coin.body.setImmovable(true);
   coin.body.setCollideWorldBounds(true);
  }

  coins.add(coin);

  this.tweens.add({
   targets:coin,
   scaleX:1.12,
   scaleY:1.12,
   duration:600,
   yoyo:true,
   repeat:-1,
   ease:'Sine.easeInOut'
  });

  return coin;
 }

 // COIN DROP
 dropCoinsFromEnemy(x,y){
  if(
   Math.random()>
   COIN_DROP_CHANCE
  )
   return;

  const amount=
   Phaser.Math.Between(
    COIN_DROP_MIN,
    COIN_DROP_MAX
   );

  for(
   let i=0;
   i<amount;
   i++
  )
   this.createCoinDrop(
    x,
    y-20,
    i,
    amount
   );

  this.createCoinDropBurst(
   x,
   y
  );
 }

 createCoinDrop(
  x,
  y,
  index=0,
  total=1
 ){
  const coin=this.add.circle(
   x,
   y,
   COIN_SIZE/2,
   0xffc928
  );

  coin.setStrokeStyle(
   3,
   0xffa500
  );

  coin.setDepth(8);

  const symbol=this.add.text(
   x,
   y,
   '$',
   {
    fontFamily:'monospace',
    fontSize:'18px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#9b6500',
    strokeThickness:2
   }
  ).setOrigin(.5)
   .setDepth(9);

  coin.coinSymbol=symbol;
  coin.coinValue=COIN_VALUE;
  coin.collected=false;
  coin.magnetized=false;
  coin.isDrop=true;
  coin.magnetDelayUntil=Date.now()+900;

  this.physics.add.existing(coin);

  if(
   coin.body&&
   coin.body.setCircle
  ){
   coin.body.setCircle(
    COIN_SIZE/2
   );

   coin.body.setAllowGravity(true);
   coin.body.setImmovable(false);
   coin.body.setBounce(.05);
   coin.body.setCollideWorldBounds(true);
   coin.body.setDragX(1400);
   coin.body.setMaxVelocity(600,700);
  }

  coinDrops.add(coin);

  let direction=
   index%2===0?-1:1;

  if(total===1)
   direction=
    Phaser.Math.RND.pick([
     -1,
     1
    ]);

  const xSpeed=
   Phaser.Math.Between(
    COIN_DROP_MIN_X_SPEED,
    COIN_DROP_MAX_X_SPEED
   );

  const ySpeed=
   Phaser.Math.Between(
    COIN_DROP_MIN_Y_SPEED,
    COIN_DROP_MAX_Y_SPEED
   );

  coin.body.setVelocity(
   direction*xSpeed,
   -ySpeed
  );

  coin.setAngle(
   Phaser.Math.Between(
    -20,
    20
   )
  );

  coin.setScale(.35);
  symbol.setScale(.35);

  this.tweens.add({
   targets:[
    coin,
    symbol
   ],
   scaleX:1,
   scaleY:1,
   duration:180,
   ease:'Back.out'
  });

  this.tweens.add({
   targets:[
    coin,
    symbol
   ],
   angle:Phaser.Math.Between(
    -180,
    180
   ),
   duration:500,
   ease:'Cubic.easeOut'
  });

  if(
   COIN_DROP_LIFETIME>0
  ){
   coin.expireTimer=
    this.time.delayedCall(
     COIN_DROP_LIFETIME,
     ()=>{
      if(
       coin&&
       coin.active&&
       !coin.collected
      )
       this.removeCoin(coin);
     }
    );
  }

  return coin;
 }

 createCoinDropBurst(x,y){
  const ring=this.add.circle(
   x,
   y,
   12,
   0xffd84a,
   .15
  );

  ring.setStrokeStyle(
   3,
   0xfff1a0,
   1
  );

  ring.setDepth(15);

  this.tweens.add({
   targets:ring,
   radius:48,
   alpha:0,
   duration:300,
   ease:'Cubic.easeOut',
   onComplete:()=>ring.destroy()
  });
 }

 collectCoin(
  playerObject,
  coin
 ){
  if(
   !coin||
   !coin.active||
   coin.collected
  )
   return;

  coin.collected=true;

  if(coin.expireTimer){
   coin.expireTimer.remove();
   coin.expireTimer=null;
  }

  if(coin.body){
   coin.body.stop();

   this.physics.world.disableBody(
    coin.body
   );
  }

  if(coin.coinSymbol)
   coin.coinSymbol.setVisible(false);

  const value=
   coin.coinValue||
   COIN_VALUE;

  coinCount+=value;
  audio.play('coin');
   // QUEST COIN
this.handleQuestProgress(
 quest?
 quest.onCoin(value):
 []
);

  this.updateCoinUI();

  const collectText=this.add.text(
   coin.x,
   coin.y-10,
   `+${value}`,
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#fff6a0',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setOrigin(.5)
   .setDepth(50);

  this.tweens.add({
   targets:collectText,
   y:coin.y-50,
   alpha:0,
   duration:500,
   ease:'Cubic.easeOut',
   onComplete:()=>collectText.destroy()
  });

  this.tweens.add({
   targets:coin,
   scaleX:1.5,
   scaleY:1.5,
   alpha:0,
   duration:180,
   ease:'Cubic.easeOut',
   onComplete:()=>{
    if(coin.coinSymbol){
     coin.coinSymbol.destroy();
     coin.coinSymbol=null;
    }

    coin.destroy();
   }
  });
 }

 removeCoin(coin){
  if(!coin||!coin.active)
   return;

  coin.collected=true;

  if(coin.expireTimer){
   coin.expireTimer.remove();
   coin.expireTimer=null;
  }

  if(coin.body){
   coin.body.stop();

   this.physics.world.disableBody(
    coin.body
   );
  }

  if(coin.coinSymbol){
   coin.coinSymbol.destroy();
   coin.coinSymbol=null;
  }

  this.tweens.add({
   targets:coin,
   alpha:0,
   scaleX:.5,
   scaleY:.5,
   duration:180,
   onComplete:()=>{
    if(
     coin&&
     coin.active
    )
     coin.destroy();
   }
  });
 }

 // ENEMY
 createEnemy(
  x,
  y,
  type='slime'
 ){
  const config=
   ENEMY_TYPES[type]||
   ENEMY_TYPES.slime;

  const enemy=this.add.rectangle(
   x,
   y,
   config.width,
   config.height,
   config.color
  ).setDepth(7);

  this.physics.add.existing(enemy);

  enemy.enemyType=type;
  enemy.enemyConfig=config;
  enemy.hp=config.hp;
  enemy.maxHP=config.hp;
  enemy.damage=config.damage;
  enemy.expReward=config.exp;
  enemy.direction=1;
  enemy.speed=config.speed;
  enemy.spawnX=x;
  enemy.spawnY=y;
  enemy.patrolDistance=180;
  enemy.isChasing=false;
  enemy.attackCooldown=0;

  enemy.body.setSize(
   config.width,
   config.height
  );

  enemy.body.setCollideWorldBounds(true);
  enemy.body.setMaxVelocityY(
   PLAYER_MAX_FALL_SPEED
  );

  if(config.gravity){
   enemy.body.setAllowGravity(true);
  }else{
   enemy.body.setAllowGravity(false);
   enemy.body.setImmovable(false);
  }

  enemy.body.setVelocityX(config.speed);

  enemy.label=this.add.text(
   x,
   y-config.height/2-18,
   config.name,
   {
    fontFamily:'monospace',
    fontSize:'10px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:2
   }
  ).setOrigin(.5)
   .setDepth(20);

  enemy.hpBarBackground=this.add.rectangle(
   x,
   y-config.height/2-8,
   46,
   6,
   0x222222
  ).setDepth(20);

  enemy.hpBar=this.add.rectangle(
   x-21,
   y-config.height/2-8,
   42,
   4,
   0xff3333
  ).setOrigin(0,.5)
   .setDepth(21);

  enemies.add(enemy);

  return enemy;
 }

 // ENEMY AI
 updateEnemies(){
  if(!enemies||!player)
   return;

  enemies.getChildren().forEach(
   enemy=>{
    if(
     !enemy||
     !enemy.active||
     !enemy.body
    )
     return;

    const config=enemy.enemyConfig;

    const distance=
     Phaser.Math.Distance.Between(
      player.x,
      player.y,
      enemy.x,
      enemy.y
     );

    if(
     distance<=
     ENEMY_DETECT_DISTANCE
    )
     enemy.isChasing=true;

    if(
     distance>=
     ENEMY_LOSE_DISTANCE
    )
     enemy.isChasing=false;

    if(enemy.enemyType==='bat'){
     if(enemy.isChasing){
      const dx=player.x-enemy.x;
      const dy=player.y-70-enemy.y;
      const d=Math.sqrt(dx*dx+dy*dy)||1;

      enemy.body.setVelocityX(
       dx/d*enemy.speed
      );

      enemy.body.setVelocityY(
       dy/d*enemy.speed
      );

      enemy.direction=dx<0?-1:1;
     }else{
      const left=
       enemy.spawnX-
       enemy.patrolDistance;

      const right=
       enemy.spawnX+
       enemy.patrolDistance;

      if(enemy.x<=left)
       enemy.direction=1;

      if(enemy.x>=right)
       enemy.direction=-1;

      enemy.body.setVelocityX(
       enemy.direction*
       enemy.speed
      );

      enemy.body.setVelocityY(
       Math.sin(
        this.time.now/300+
        enemy.spawnX
       )*25
      );
     }
    }else{
     if(enemy.isChasing){
      if(player.x<enemy.x){
       enemy.direction=-1;
       enemy.body.setVelocityX(
        -enemy.speed
       );
      }else{
       enemy.direction=1;
       enemy.body.setVelocityX(
        enemy.speed
       );
      }
     }else{
      const left=
       enemy.spawnX-
       enemy.patrolDistance;

      const right=
       enemy.spawnX+
       enemy.patrolDistance;

      if(enemy.x<=left)
       enemy.direction=1;

      if(enemy.x>=right)
       enemy.direction=-1;

      enemy.body.setVelocityX(
       enemy.direction*
       enemy.speed
      );
     }
    }

    const h=config.height/2;

    if(enemy.label){
     enemy.label.x=enemy.x;
     enemy.label.y=enemy.y-h-18;
    }

    if(enemy.hpBarBackground){
     enemy.hpBarBackground.x=enemy.x;
     enemy.hpBarBackground.y=enemy.y-h-8;
    }

    if(enemy.hpBar){
     enemy.hpBar.x=enemy.x-21;
     enemy.hpBar.y=enemy.y-h-8;

     const percent=
      Phaser.Math.Clamp(
       enemy.hp/
       enemy.maxHP,
       0,
       1
      );

     enemy.hpBar.displayWidth=
      42*percent;
    }
   }
  );
 }

 // ATTACK
 attackPlayer(){
  if(gameOver)return;

  const now=Date.now();

  if(
   now-lastAttackTime<
   PLAYER_ATTACK_COOLDOWN
  )
   return;

  lastAttackTime=now;

  this.createAttackEffect();

  const stats=
   this.getEquipmentStats();

  const attackDamage=
   (
    playerPowered?
    PLAYER_POWER_ATTACK_DAMAGE:
    PLAYER_NORMAL_ATTACK_DAMAGE
   )+
   stats.atk;

  enemies.getChildren().forEach(
   enemy=>{
    if(
     !enemy||
     !enemy.active||
     !enemy.body
    )
     return;

    const dx=
     enemy.x-player.x;

    const dy=
     Math.abs(
      enemy.y-player.y
     );

    const distance=
     Math.abs(dx);

    if(
     distance>
     PLAYER_ATTACK_DISTANCE||
     dy>90
    )
     return;

    if(
     playerFacing===1&&
     dx<0
    )
     return;

    if(
     playerFacing===-1&&
     dx>0
    )
     return;

    this.damageEnemy(
     enemy,
     attackDamage
    );
   }
  );
 }

 createAttackEffect(){
  audio.play('attack');

  if(
   attackEffect&&
   attackEffect.active
  )
   attackEffect.destroy();

  const x=
   player.x+
   playerFacing*48;

  const y=player.y-5;

  attackEffect=this.add.arc(
   x,
   y,
   45,
   playerFacing===1?-70:110,
   playerFacing===1?70:250,
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

  this.tweens.add({
   targets:attackEffect,
   scaleX:1.25,
   alpha:0,
   duration:180,
   ease:'Cubic.easeOut',
   onComplete:()=>{
    if(attackEffect){
     attackEffect.destroy();
     attackEffect=null;
    }
   }
  });
 }

 damageEnemy(
  enemy,
  damage
 ){
  if(
   !enemy||
   !enemy.active
  )
   return;

  enemy.hp-=damage;

  if(enemy.hpBar){
   const percent=
    Phaser.Math.Clamp(
     enemy.hp/
     enemy.maxHP,
     0,
     1
    );

   enemy.hpBar.displayWidth=
    42*percent;
  }

  enemy.setFillStyle(0xffffff);

  this.time.delayedCall(
   100,
   ()=>{
    if(
     enemy&&
     enemy.active&&
     enemy.enemyConfig
    )
     enemy.setFillStyle(
      enemy.enemyConfig.color
     );
   }
  );

  if(enemy.body){
   enemy.body.setVelocityX(
    playerFacing*180
   );

   if(
    enemy.enemyType!=='bat'
   )
    enemy.body.setVelocityY(
     -150
    );
  }

  if(enemy.hp<=0)
   this.killEnemy(enemy);
  else
   audio.play('hit');
 }

 killEnemy(enemy){
  if(
   !enemy||
   !enemy.active
  )
   return;

  const deathX=enemy.x;
  const deathY=enemy.y;
  audio.play('enemyDown');

  this.addEXP(
   enemy.expReward||50,
   deathX,
   deathY
  );
// QUEST KILL
this.handleQuestProgress(
 quest?
 quest.onEnemyKill(enemy.enemyType):
 []
);
   

  if(enemy.body)
   this.physics.world.disableBody(
    enemy.body
   );

  enemy.active=false;

  this.dropCoinsFromEnemy(
   deathX,
   deathY
  );

  if(enemy.label){
   enemy.label.destroy();
   enemy.label=null;
  }

  if(enemy.hpBar){
   enemy.hpBar.destroy();
   enemy.hpBar=null;
  }

  if(enemy.hpBarBackground){
   enemy.hpBarBackground.destroy();
   enemy.hpBarBackground=null;
  }

  this.tweens.add({
   targets:enemy,
   alpha:0,
   scaleX:1.5,
   scaleY:1.5,
   duration:300,
   onComplete:()=>{
    enemy.destroy();
   }
  });
 }

 // EXP
 addEXP(
  amount,
  x,
  y
 ){
  if(
   gameOver||
   amount<=0
  )
   return;

  if(
   PLAYER_MAX_LEVEL>0&&
   playerLevel>=
   PLAYER_MAX_LEVEL
  ){
   playerEXP=playerEXPRequired;
   this.updateEXPUI();
   return;
  }

  playerEXP+=amount;

  if(
   x!==undefined&&
   y!==undefined
  ){
   const expGainText=this.add.text(
    x,
    y-65,
    `+${amount} EXP`,
    {
     fontFamily:'monospace',
     fontSize:'16px',
     fontStyle:'bold',
     color:'#7dd3fc',
     stroke:'#000000',
     strokeThickness:3
    }
   ).setOrigin(.5)
    .setDepth(60);

   this.tweens.add({
    targets:expGainText,
    y:y-105,
    alpha:0,
    duration:700,
    ease:'Cubic.easeOut',
    onComplete:()=>{
     expGainText.destroy();
    }
   });
  }

  while(
   playerEXP>=
   playerEXPRequired
  ){
   playerEXP-=playerEXPRequired;
   this.levelUp();
  }

  this.updateEXPUI();
 }

 levelUp(){
  if(
   PLAYER_MAX_LEVEL>0&&
   playerLevel>=
   PLAYER_MAX_LEVEL
  ){
   playerEXP=playerEXPRequired;
   return;
  }

  playerLevel++;
  audio.play('levelup');

  playerEXPRequired+=
   PLAYER_EXP_INCREASE_PER_LEVEL;

  const maxHP=
   this.getPlayerMaxHP();

  playerHP=
   Math.min(
    playerHP+
    PLAYER_LEVEL_UP_HP_BONUS,
    playerPowered?
    PLAYER_POWER_MAX_HP+
    this.getEquipmentStats().maxHP:
    maxHP
   );

  this.updateHPUI();
  this.updateEXPUI();
  this.createLevelUpEffect();
 }

 createLevelUpEffect(){
  const ring=this.add.circle(
   player.x,
   player.y,
   30,
   0x38bdf8,
   .25
  );

  ring.setStrokeStyle(
   5,
   0x7dd3fc,
   1
  );

  ring.setDepth(80);

  this.tweens.add({
   targets:ring,
   radius:100,
   alpha:0,
   duration:600,
   ease:'Cubic.easeOut',
   onComplete:()=>{
    ring.destroy();
   }
  });

  const text=this.add.text(
   player.x,
   player.y-75,
   `LEVEL UP!\nLEVEL ${playerLevel}`,
   {
    fontFamily:'monospace',
    fontSize:'24px',
    fontStyle:'bold',
    align:'center',
    color:'#7dd3fc',
    stroke:'#000000',
    strokeThickness:5
   }
  ).setOrigin(.5)
   .setDepth(90);

  this.tweens.add({
   targets:text,
   y:player.y-130,
   alpha:0,
   duration:1200,
   ease:'Cubic.easeOut',
   onComplete:()=>{
    text.destroy();
   }
  });

  playerVisual.setTint(
   0x7dd3fc
  );

  this.time.delayedCall(
   300,
   ()=>{
    if(
     playerVisual&&
     playerVisual.active
    )
     playerVisual.clearTint();
   }
  );

  this.cameras.main.flash(
   180,
   100,
   200,
   255
  );
 }

 // COLLISION
 handlePlayerEnemyCollision(
  playerObject,
  enemy
 ){
  if(
   gameOver||
   !enemy||
   !enemy.active
  )
   return;

  this.damagePlayer(enemy);
 }

 damagePlayer(enemy){
  if(
   gameOver||
   inventoryOpen||
   skillOpen
  )
   return;

  const now=Date.now();

  if(
   now-lastDamageTime<
   PLAYER_INVULNERABLE_TIME
  )
   return;

  lastDamageTime=now;

  const stats=
   this.getEquipmentStats();

  const rawDamage=
   enemy?.damage||
   ENEMY_DAMAGE;

  const damage=
   Math.max(
    1,
    rawDamage-
    stats.def
   );

  playerHP-=damage;
  audio.play('hit');

  playerHP=
   Math.max(
    0,
    playerHP
   );

  this.updateHPUI();

  if(
   enemy&&
   enemy.active
  ){
   if(enemy.x<player.x)
    player.body.setVelocityX(250);
   else
    player.body.setVelocityX(-250);
  }

  player.body.setVelocityY(-250);

  this.cameras.main.shake(
   120,
   .008
  );

  if(playerHP<=0)
   this.killPlayer();
 }

 // DEATH
killPlayer(){
 if(gameOver)return;

 gameOver=true;

 this.closeShopPanel();
 shopOpen=false;

 this.hideQuestPanel();
 questOpen=false;

 this.hideInventory();
 inventoryOpen=false;

 this.hideSkillPanel();
 skillOpen=false;
  

  if(player.body){
   player.body.setVelocity(
    0,
    0
   );

   this.physics.world.disableBody(
    player.body
   );
  }

  playerVisual.anims.stop();
  playerVisual.setTint(0xff3333);

  if(deathText){
   deathText.destroy();
   deathText=null;
  }

  if(respawnText){
   respawnText.destroy();
   respawnText=null;
  }

  deathText=this.add.text(
   GAME_WIDTH/2,
   GAME_HEIGHT/2-30,
   'YOU DIED',
   {
    fontFamily:'monospace',
    fontSize:'48px',
    fontStyle:'bold',
    color:'#ff3333',
    stroke:'#000000',
    strokeThickness:6
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(200);

  respawnText=this.add.text(
   GAME_WIDTH/2,
   GAME_HEIGHT/2+35,
   'RESPAWNING...',
   {
    fontFamily:'monospace',
    fontSize:'20px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(200);

  this.time.delayedCall(
   DEATH_RESPAWN_DELAY,
   ()=>this.respawnPlayer()
  );
 }

 respawnPlayer(){
  if(
   !player||
   !player.body
  )
   return;

  if(deathText){
   deathText.destroy();
   deathText=null;
  }

  if(respawnText){
   respawnText.destroy();
   respawnText=null;
  }

  this.physics.world.enable(player);

  player.body.setEnable(true);

  player.body.setSize(
   HITBOX_WIDTH,
   HITBOX_HEIGHT
  );

  player.body.setOffset(0,0);

  player.body.setCollideWorldBounds(true);

  player.body.setMaxVelocityY(
   PLAYER_MAX_FALL_SPEED
  );

  player.body.reset(
   checkpointX,
   checkpointY
  );

  player.body.setVelocity(
   0,
   0
  );

  player.x=checkpointX;
  player.y=checkpointY;

  playerHP=
   this.getPlayerMaxHP();

  playerPowered=false;
  powerEndTime=0;

  lastDamageTime=Date.now();

  playerVisual.anims.stop();

  playerVisual.setTexture('idle1');

  playerVisual.setDisplaySize(
   PLAYER_WIDTH,
   PLAYER_HEIGHT
  );

  playerVisual.clearTint();

  playerVisual.setFlipX(
   playerFacing===-1
  );

  playerVisual.x=checkpointX;

  playerVisual.y=
   checkpointY-
   (PLAYER_HEIGHT-
    HITBOX_HEIGHT)/2;

  playerVisual.play('player-idle');

  gameOver=false;

  this.updateHPUI();
  this.updatePowerUI();

  if(powerButton){
   powerButton.setAlpha(.65);

   if(powerButton.label)
    powerButton.label.setAlpha(1);
  }

  this.cameras.main.startFollow(
   player,
   true,
   .08,
   .08
  );

  this.cameras.main.flash(
   250,
   255,
   255,
   255
  );

  const effect=this.add.circle(
   checkpointX,
   checkpointY,
   25,
   0x38d9ff,
   .25
  );

  effect.setStrokeStyle(
   4,
   0x7dd3fc,
   1
  );

  effect.setDepth(50);

  this.tweens.add({
   targets:effect,
   radius:70,
   alpha:0,
   duration:500,
   ease:'Cubic.easeOut',
   onComplete:()=>{
    effect.destroy();
   }
  });
 }

 // HP UI
 createHPUI(){
  this.add.rectangle(
   HP_UI_X,
   HP_UI_Y,
   HP_BAR_WIDTH,
   HP_BAR_HEIGHT,
   0x222222
  ).setScrollFactor(0)
   .setDepth(100);

  hpBar=this.add.rectangle(
   HP_UI_X-HP_BAR_WIDTH/2+3,
   HP_UI_Y,
   HP_FILL_WIDTH,
   10,
   0x27d83d
  ).setOrigin(0,.5)
   .setScrollFactor(0)
   .setDepth(101);

  hpText=this.add.text(
   HP_UI_X,
   HP_UI_Y,
   `HP ${playerHP} / ${this.getPlayerMaxHP()}`,
   {
    fontFamily:'monospace',
    fontSize:UI_TEXT_SIZE,
    fontStyle:'bold',
    color:UI_TEXT_COLOR,
    stroke:UI_TEXT_STROKE,
    strokeThickness:UI_TEXT_STROKE_WIDTH
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(102);

  this.updateHPUI();
 }

 updateHPUI(){
  if(
   !hpBar||
   !hpText
  )
   return;

  const stats=
   this.getEquipmentStats();

  const normalMaxHP=
   this.getPlayerMaxHP();

  const powerMaxHP=
   PLAYER_POWER_MAX_HP+
   stats.maxHP;

  const maxHP=
   playerPowered?
   powerMaxHP:
   normalMaxHP;

  const percent=
   Phaser.Math.Clamp(
    playerHP/maxHP,
    0,
    1
   );

  hpBar.displayWidth=
   HP_FILL_WIDTH*
   percent;

  hpBar.setFillStyle(
   playerPowered?
   0xa855f7:
   0x27d83d
  );

  hpText.setText(
   `HP ${playerHP} / ${maxHP}`
  );

  hpText.x=HP_UI_X;
  hpText.y=HP_UI_Y;
 }

 // POWER UI
 createPowerUI(){
  powerBarBackground=this.add.rectangle(
   POWER_UI_X,
   POWER_UI_Y,
   POWER_BAR_WIDTH,
   POWER_BAR_HEIGHT,
   0x222222
  ).setScrollFactor(0)
   .setDepth(100);

  powerBar=this.add.rectangle(
   POWER_UI_X-POWER_BAR_WIDTH/2+3,
   POWER_UI_Y,
   POWER_FILL_WIDTH,
   10,
   0xa855f7
  ).setOrigin(0,.5)
   .setScrollFactor(0)
   .setDepth(101);

  powerText=this.add.text(
   POWER_UI_X,
   POWER_UI_Y,
   'POWER',
   {
    fontFamily:'monospace',
    fontSize:UI_TEXT_SIZE,
    fontStyle:'bold',
    color:UI_TEXT_COLOR,
    stroke:UI_TEXT_STROKE,
    strokeThickness:UI_TEXT_STROKE_WIDTH
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(102);

  this.updatePowerUI();
 }

 updatePowerUI(){
  if(
   !powerBar||
   !powerText
  )
   return;

  if(!playerPowered){
   const cooldownRemaining=Math.max(
    0,
    powerCooldownUntil-Date.now()
   );
   const cooldownPercent=Phaser.Math.Clamp(
    cooldownRemaining/PLAYER_POWER_COOLDOWN,
    0,
    1
   );

   powerBar.displayWidth=
    POWER_FILL_WIDTH*(cooldownRemaining>0?
     cooldownPercent:1);

   powerText.setText(
    cooldownRemaining>0?
    `POWER CD ${Math.ceil(cooldownRemaining/1000)}s`:
    'POWER READY'
   );

   if(powerButton){
    powerButton.setAlpha(cooldownRemaining>0?.35:.65);
    if(powerButton.label)
     powerButton.label.setAlpha(cooldownRemaining>0?.45:1);
   }

   powerText.x=POWER_UI_X;
   powerText.y=POWER_UI_Y;

   return;
  }

  const remaining=
   Math.max(
    0,
    powerEndTime-Date.now()
   );

  const seconds=
   remaining/1000;

  const percent=
   Phaser.Math.Clamp(
    remaining/
    PLAYER_POWER_DURATION,
    0,
    1
   );

  powerBar.displayWidth=
   POWER_FILL_WIDTH*
   percent;

  powerText.setText(
   `POWER ${seconds.toFixed(1)}s`
  );

  powerText.x=POWER_UI_X;
  powerText.y=POWER_UI_Y;
 }

 // EXP UI
 createEXPUI(){
  levelText=this.add.text(
   EXP_UI_X-82,
   EXP_UI_Y-17,
   `LV ${playerLevel}`,
   {
    fontFamily:'monospace',
    fontSize:'14px',
    fontStyle:'bold',
    color:'#7dd3fc',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(102);

  expBarBackground=this.add.rectangle(
   EXP_UI_X,
   EXP_UI_Y,
   EXP_BAR_WIDTH,
   EXP_BAR_HEIGHT,
   0x222222
  ).setScrollFactor(0)
   .setDepth(100);

  expBar=this.add.rectangle(
   EXP_UI_X-EXP_BAR_WIDTH/2+3,
   EXP_UI_Y,
   EXP_FILL_WIDTH,
   10,
   0x38bdf8
  ).setOrigin(0,.5)
   .setScrollFactor(0)
   .setDepth(101);

  expText=this.add.text(
   EXP_UI_X,
   EXP_UI_Y,
   `EXP ${playerEXP} / ${playerEXPRequired}`,
   {
    fontFamily:'monospace',
    fontSize:UI_TEXT_SIZE,
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:UI_TEXT_STROKE_WIDTH
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(102);

  this.updateEXPUI();
 }

 updateEXPUI(){
  if(
   !expBar||
   !expText||
   !levelText
  )
   return;

  const percent=
   Phaser.Math.Clamp(
    playerEXP/
    playerEXPRequired,
    0,
    1
   );

  expBar.displayWidth=
   EXP_FILL_WIDTH*
   percent;

  levelText.setText(
   `LV ${playerLevel}`
  );

  levelText.x=
   EXP_UI_X-82;

  levelText.y=
   EXP_UI_Y-17;

  expText.setText(
   `EXP ${playerEXP} / ${playerEXPRequired}`
  );

  expText.x=EXP_UI_X;
  expText.y=EXP_UI_Y;
 }

 // COIN UI
 createCoinUI(){
  this.add.circle(
   25,
   88,
   9,
   0xffc928
  ).setScrollFactor(0)
   .setDepth(100);

  this.add.text(
   48,
   78,
   'COIN:',
   {
    fontFamily:'monospace',
    fontSize:'14px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setScrollFactor(0)
   .setDepth(101);

  coinText=this.add.text(
   105,
   78,
   '0',
   {
    fontFamily:'monospace',
    fontSize:'14px',
    fontStyle:'bold',
    color:'#fff6a0',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setScrollFactor(0)
   .setDepth(101);

  this.updateCoinUI();
 }

 updateCoinUI(){
  if(coinText)
   coinText.setText(
    String(coinCount)
   );
 }

  // NPC
createNPCs(){
 npcObjects=[];

 (currentStage.npcs||[]).forEach(data=>{
  const npc=new NPC(data);

  const body=this.add.rectangle(
   npc.x,
   npc.y-25,
   42,
   50,
   npc.color,
   1
  );

  body.setStrokeStyle(
   3,
   0xffffff,
   1
  );

  const head=this.add.circle(
   npc.x,
   npc.y-62,
   20,
   0xffd6b3
  );

  const name=this.add.text(
   npc.x,
   npc.y-92,
   npc.name,
   {
    fontFamily:'monospace',
    fontSize:'9px',
    fontStyle:'bold',
    color:'#ffffff',
    stroke:'#000000',
    strokeThickness:3
   }
  ).setOrigin(.5);

  const mark=this.add.text(
   npc.x,
   npc.y-115,
   '!',
   {
    fontFamily:'monospace',
    fontSize:'24px',
    fontStyle:'bold',
    color:'#fbbf24',
    stroke:'#000000',
    strokeThickness:4
   }
  ).setOrigin(.5);

  npc.body=body;
  npc.head=head;
  npc.nameText=name;
  npc.mark=mark;

  npcObjects.push(npc);
 });
}

updateNPCs(){
 if(!player||!npcObjects.length)return;

 let closest=null;
 let distance=Infinity;

 npcObjects.forEach(npc=>{
  if(!npc.body.active)return;

  const d=Phaser.Math.Distance.Between(
   player.x,
   player.y,
   npc.x,
   npc.y
  );

  npc.nameText.setText(
   npc.name
  );

  npc.mark.setVisible(
   d<120
  );

  if(d<120&&d<distance){
   closest=npc;
   distance=d;
  }
 });

 nearbyNPC=closest;

 if(talkButton){
  talkButton.setVisible(!!closest);
  if(talkButton.label)talkButton.label.setVisible(!!closest);
 }

 if(npcTalkText){
  npcTalkText.setText(
   closest?
   `E / TALK : ${closest.name}`:
   ''
  );
 }
}

// NPC SHOP
talkToNPC(){
 if(shopOpen)return;

 if(npcOpen){
  this.nextNPCDialogue();
  return;
 }

 if(!nearbyNPC)return;

 if(nearbyNPC.id==='merchant'){
  shopOpen=true;
  this.showShopPanel();
  return;
 }

 nearbyNPC.reset();
 npcOpen=true;
 this.showNPCPanel();
}

showNPCPanel(){
 if(!nearbyNPC||npcPanel)return;

 npcPanel=this.add.container(
  GAME_WIDTH/2,
  GAME_HEIGHT/2
 ).setScrollFactor(0)
  .setDepth(750);

 const bg=this.add.rectangle(
  0,
  0,
  620,
  250,
  0x111827,
  .98
 );

 bg.setStrokeStyle(
  4,
  nearbyNPC.color,
  1
 );

 bg.setScrollFactor(0);

 npcNameText=this.add.text(
  -270,
  -90,
  nearbyNPC.name,
  {
   fontFamily:'monospace',
   fontSize:'22px',
   fontStyle:'bold',
   color:'#fbbf24',
   stroke:'#000000',
   strokeThickness:4
  }
 );

 npcPageText=this.add.text(
  -270,
  -35,
  nearbyNPC.getText(),
  {
   fontFamily:'monospace',
   fontSize:'15px',
   color:'#ffffff',
   wordWrap:{
    width:520
   },
   lineSpacing:8
   }
  );

 npcNameText.setScrollFactor(0);
 npcPageText.setScrollFactor(0);

 const next=this.add.rectangle(
  190,
  85,
  120,
  40,
  0x2563eb,
  1
 ).setInteractive();

 next.setScrollFactor(0);

 const nextText=this.add.text(
  190,
  85,
  'NEXT',
  {
   fontFamily:'monospace',
   fontSize:'12px',
   fontStyle:'bold',
   color:'#ffffff'
  }
 ).setOrigin(.5);

 nextText.setScrollFactor(0);

 const close=this.add.rectangle(
  260,
  -100,
  70,
  30,
  0x334155,
  1
 ).setInteractive();

 close.setScrollFactor(0);

 const closeText=this.add.text(
  260,
  -100,
  'CLOSE',
  {
   fontFamily:'monospace',
   fontSize:'10px',
   fontStyle:'bold',
   color:'#ffffff'
  }
 ).setOrigin(.5);

 closeText.setScrollFactor(0);

 npcPanel.add([
  bg,
  npcNameText,
  npcPageText,
  next,
  nextText,
  close,
  closeText
 ]);

 next.on(
  'pointerup',
  (pointer,localX,localY,event)=>{
   event?.stopPropagation();
   this.nextNPCDialogue();
  }
 );

 close.on(
  'pointerup',
  (pointer,localX,localY,event)=>{
   event?.stopPropagation();
   this.closeNPCPanel();
  }
 );
}

nextNPCDialogue(){
 if(!nearbyNPC)return;

 if(nearbyNPC.next()){
  npcPageText.setText(
   nearbyNPC.getText()
  );
 }else{
  this.closeNPCPanel();
 }
}

closeNPCPanel(){
 if(npcPanel){
  npcPanel.destroy(true);
  npcPanel=null;
 }

 npcNameText=null;
 npcPageText=null;
 npcOpen=false;
}

  // SHOP
showShopPanel(){
 if(shopPanel||!shop)return;

 shopPanel=this.add.container(
  GAME_WIDTH/2,
  GAME_HEIGHT/2
 ).setScrollFactor(0)
  .setDepth(800);

 const bg=this.add.rectangle(
  0,
  0,
  740,
  500,
  0x111827,
  .98
 ).setStrokeStyle(
  5,
  0xf59e0b,
  1
 );

 const title=this.add.text(
  0,
  -215,
  'SHOP',
  {
   fontFamily:'monospace',
   fontSize:'36px',
   fontStyle:'bold',
   color:'#fbbf24',
   stroke:'#000000',
   strokeThickness:5
  }
 ).setOrigin(.5);

 shopCoinText=this.add.text(
  -330,
  -170,
  `COIN: ${coinCount}`,
  {
   fontFamily:'monospace',
   fontSize:'17px',
   fontStyle:'bold',
   color:'#fff6a0',
   stroke:'#000000',
   strokeThickness:4
  }
 );

 const close=this.add.rectangle(
  305,
  -210,
  120,
  52,
  0x334155,
  1
 );

 const closeText=this.add.text(
  305,
  -210,
  'CLOSE',
  {
   fontFamily:'monospace',
   fontSize:'15px',
   fontStyle:'bold',
   color:'#ffffff'
  }
 ).setOrigin(.5);

 shopPanel.add([
  bg,
  title,
  shopCoinText,
  close,
  closeText
 ]);

 shop.getAll().forEach(
  (item,i)=>{
   const y=-115+i*78;

   const box=this.add.rectangle(
    0,
    y,
    670,
    62,
    0x1f2937,
    1
   ).setStrokeStyle(
    2,
    0x475569,
    1
   );

   const name=this.add.text(
    -305,
    y-10,
    item.name,
    {
     fontFamily:'monospace',
     fontSize:'15px',
     fontStyle:'bold',
     color:'#ffffff'
    }
   );

   const desc=this.add.text(
    -305,
    y+13,
    item.description,
    {
     fontFamily:'monospace',
     fontSize:'11px',
     color:'#cbd5e1'
    }
   );

   const price=this.add.text(
    55,
    y,
    `COIN ${item.price}`,
    {
     fontFamily:'monospace',
     fontSize:'13px',
     fontStyle:'bold',
     color:'#fff6a0'
    }
   ).setOrigin(0,.5);

   const buy=this.add.rectangle(
    275,
    y,
    115,
    48,
    0x16a34a,
    1
   );

   const buyText=this.add.text(
    275,
    y,
    'BUY',
    {
     fontFamily:'monospace',
     fontSize:'15px',
     fontStyle:'bold',
     color:'#ffffff'
    }
   ).setOrigin(.5);

   shopPanel.add([
    box,
    name,
    desc,
    price,
    buy,
    buyText
   ]);
  }
 );

 shopPointerHandler=pointer=>{
  const x=pointer.x-GAME_WIDTH/2;
  const y=pointer.y-GAME_HEIGHT/2;

  if(
   x>245&&
   x<365&&
   y>-236&&
   y<-184
  ){
   this.closeShopPanel();
   return;
  }

  shop.getAll().forEach((item,i)=>{
   const rowY=-115+i*78;

   if(
    x>215&&
    x<335&&
    y>rowY-24&&
    y<rowY+24
   )
    this.buyShopItem(item);
  });
 };

 this.input.on(
  'pointerdown',
  shopPointerHandler
 );
}

 

buyShopItem(item){
 if(
  !item||
  !inventory||
  gameOver||
  stageTransitioning
 )
  return;

 if(coinCount<item.price){
  this.showShopMessage(
   'NOT ENOUGH COIN',
   0xff5555
  );
  return;
 }

 if(!inventory.addItem(item.id,1)){
  this.showShopMessage(
   'INVENTORY FULL',
   0xff5555
  );
  return;
 }

 coinCount-=item.price;

 this.updateCoinUI();
 this.updateShopUI();

 this.showShopMessage(
  `BOUGHT ${item.name}`,
  0x86efac
 );
}

updateShopUI(){
 if(shopCoinText)
  shopCoinText.setText(
   `COIN: ${coinCount}`
  );
}

showShopMessage(text,color){
 const message=this.add.text(
  GAME_WIDTH/2,
  180,
  text,
  {
   fontFamily:'monospace',
   fontSize:'17px',
   fontStyle:'bold',
   color:'#ffffff',
   stroke:'#000000',
   strokeThickness:4
  }
 ).setOrigin(.5)
  .setScrollFactor(0)
  .setDepth(900);

 this.tweens.add({
  targets:message,
  y:145,
  alpha:0,
  duration:700,
  onComplete:()=>message.destroy()
 });
}

// SHOP
closeShopPanel(){
 if(shopPointerHandler){
  this.input.off(
   'pointerdown',
   shopPointerHandler
  );
  shopPointerHandler=null;
 }

 if(shopPanel){
  shopPanel.destroy(true);
  shopPanel=null;
 }

 shopCoinText=null;
 shopOpen=false;
}
  
 // MOBILE CONTROLS
 createMobileControls(){
  controlArea=this.add.rectangle(
   GAME_WIDTH/2,
   CONTROL_AREA_Y,
   GAME_WIDTH,
   150,
   0x111827,
   .42
  ).setScrollFactor(0)
   .setDepth(95);

  controlArea.setStrokeStyle(
   2,
   0x475569,
   .7
  );

  leftButton=this.createControlButton(
   65,
   525,
   75,
   62,
   '◀'
  );

  rightButton=this.createControlButton(
   150,
   525,
   75,
   62,
   '▶'
  );
   
   talkButton=this.createControlButton(
 300,
 475,
 70,
 34,
 'TALK'
);

talkButton.label.setFontSize(11);
talkButton.setVisible(false);
talkButton.label.setVisible(false);

talkButton.on(
 'pointerdown',
 ()=>{
  talkPressed=true;
 }
);

  this.createSkillButton(
   'slash',
   405,
   525,
   '⚔'
  );

  this.createSkillButton(
   'heal',
   485,
   525,
   '+'
  );

  this.createSkillButton(
   'burst',
   565,
   525,
   '✦'
  );

  attackButton=this.createControlButton(
   645,
   525,
   68,
   62,
   '⚔'
  );

  attackButton.label.setFontSize(25);

  jumpButton=this.createControlButton(
   750,
   530,
   82,
   70,
   'โดด'
  );

  jumpButton.label.setFontSize(22);

  powerButton=this.createControlButton(
   700,
   475,
   58,
   34,
   'P'
  );

  powerButton.label.setFontSize(17);

  inventoryButton=this.createControlButton(
   770,
   475,
   58,
   34,
   'BAG'
  );

  inventoryButton.label.setFontSize(10);

  const menuButton=this.createControlButton(
   765,
   38,
   44,
   44,
   '≡'
  );
  menuButton.label.setFontSize(24);

  menuButton.on(
   'pointerdown',
   ()=>this.togglePauseMenu()
  );

  leftButton.on(
   'pointerdown',
   ()=>leftPressed=true
  );

  leftButton.on(
   'pointerup',
   ()=>leftPressed=false
  );

  leftButton.on(
   'pointerupoutside',
   ()=>leftPressed=false
  );

  leftButton.on(
   'pointercancel',
   ()=>leftPressed=false
  );

  leftButton.on(
   'pointerout',
   ()=>leftPressed=false
  );

  rightButton.on(
   'pointerdown',
   ()=>rightPressed=true
  );

  rightButton.on(
   'pointerup',
   ()=>rightPressed=false
  );

  rightButton.on(
   'pointerupoutside',
   ()=>rightPressed=false
  );

  rightButton.on(
   'pointercancel',
   ()=>rightPressed=false
  );

  rightButton.on(
   'pointerout',
   ()=>rightPressed=false
  );

  inventoryButton.on(
   'pointerdown',
   ()=>this.toggleInventory()
  );

  powerButton.on(
   'pointerdown',
   ()=>powerPressed=true
  );

  powerButton.on(
   'pointerup',
   ()=>powerPressed=false
  );

  powerButton.on(
   'pointerupoutside',
   ()=>powerPressed=false
  );

  powerButton.on(
   'pointercancel',
   ()=>powerPressed=false
  );

  jumpButton.on(
   'pointerdown',
   ()=>jumpPressed=true
  );

  jumpButton.on(
   'pointerup',
   ()=>jumpPressed=false
  );

  jumpButton.on(
   'pointerupoutside',
   ()=>jumpPressed=false
  );

  jumpButton.on(
   'pointercancel',
   ()=>jumpPressed=false
  );

  attackButton.on(
   'pointerdown',
   ()=>attackPressed=true
  );

  attackButton.on(
   'pointerup',
   ()=>attackPressed=false
  );

  attackButton.on(
   'pointerupoutside',
   ()=>attackPressed=false
  );

  attackButton.on(
   'pointercancel',
   ()=>attackPressed=false
  );
 }

 // CONTROL BUTTON
 createControlButton(
  x,
  y,
  width,
  height,
  text
 ){
  const button=this.add.rectangle(
   x,
   y,
   width,
   height,
   0x222222,
   .65
  );

  button.setInteractive({
   useHandCursor:false
  });

  button.setScrollFactor(0);
  button.setDepth(100);

  const label=this.add.text(
   x,
   y,
   text,
   {
    fontFamily:'sans-serif',
    fontSize:30,
    fontStyle:'bold',
    color:'#ffffff'
   }
  ).setOrigin(.5)
   .setScrollFactor(0)
   .setDepth(101);

  button.label=label;

  button.on(
   'pointerdown',
   ()=>button.setAlpha(.85)
  );

  button.on(
   'pointerup',
   ()=>{
    button.setAlpha(
     button===powerButton&&
     playerPowered?
     .35:
     .65
    );
   }
  );

  button.on(
   'pointerupoutside',
   ()=>{
    button.setAlpha(
     button===powerButton&&
     playerPowered?
     .35:
     .65
    );
   }
  );

  return button;
 }
}

// MAIN MENU
class MainMenuScene extends Phaser.Scene{
 constructor(){
  super('MainMenuScene');
 }

 create(){
  audio.startMusic();
  this.input.on('pointerdown',()=>audio.unlock());

  this.createBackground();

  this.add.text(GAME_WIDTH/2,80,'MY GAME',{
   fontFamily:'monospace',
   fontSize:'58px',
   fontStyle:'bold',
   color:'#7dd3fc',
   stroke:'#0f172a',
   strokeThickness:8
  }).setOrigin(.5);

  this.add.text(GAME_WIDTH/2,145,'2D ACTION PLATFORMER RPG',{
   fontFamily:'monospace',
   fontSize:'16px',
   fontStyle:'bold',
   color:'#e2e8f0',
   stroke:'#0f172a',
   strokeThickness:3
  }).setOrigin(.5);

  const continueButton=this.createButton(
   GAME_WIDTH/2,
   235,
   300,
   58,
   'CONTINUE',
   0x2563eb
  );

  const newGameButton=this.createButton(
   GAME_WIDTH/2,
   305,
   300,
   58,
   'NEW GAME',
   0x16a34a
  );

  const settingsButton=this.createButton(
   GAME_WIDTH/2,
   375,
   300,
   58,
   'SETTINGS',
   0x475569
  );

  const continueAvailable=this.hasSave();
  continueButton.setAlpha(continueAvailable?1:.4);
  continueButton.label.setAlpha(continueAvailable?1:.55);
  continueButton.input.enabled=continueAvailable;

  continueButton.on('pointerup',()=>{
   if(continueAvailable)this.continueGame();
  });

  newGameButton.on('pointerup',()=>this.startNewGame());
  settingsButton.on('pointerup',()=>this.scene.start('SettingsScene'));

  this.add.text(GAME_WIDTH/2,490,
   continueAvailable?'F6 SAVE  •  F7 LOAD':'NO SAVE DATA',{
    fontFamily:'monospace',
    fontSize:'13px',
    color:continueAvailable?'#86efac':'#94a3b8'
   }).setOrigin(.5);

  this.enterKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.ENTER
  );
 }

 update(){
  if(this.enterKey&&Phaser.Input.Keyboard.JustDown(this.enterKey)){
   if(this.hasSave())this.continueGame();
   else this.startNewGame();
  }
 }

 hasSave(){
  try{
   const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
   return !!data&&data.version===SAVE_VERSION&&[1,2].includes(Number(data.stage));
  }catch(error){
   return false;
  }
 }

 continueGame(){
  try{
   const data=JSON.parse(localStorage.getItem(SAVE_KEY));
   data.keepProgress=true;
   this.scene.start('GameScene',data);
  }catch(error){
   localStorage.removeItem(SAVE_KEY);
   this.scene.start('GameScene');
  }
 }

 startNewGame(){
  localStorage.removeItem(SAVE_KEY);
  this.scene.start('GameScene',{
   stage:1,
   keepProgress:false,
   newGame:true
  });
 }

 createBackground(){
  this.add.rectangle(400,300,800,600,0x0f172a);
  this.add.circle(120,110,90,0x1d4ed8,.18);
  this.add.circle(690,170,130,0x7c3aed,.16);
  this.add.circle(410,560,210,0x0891b2,.12);

  for(let i=0;i<12;i++){
   const x=(i*137)%800;
   const y=180+(i*83)%300;
   this.add.circle(x,y,2+(i%3),0xffffff,.35);
  }
 }

 createButton(x,y,width,height,text,color){
  const button=this.add.rectangle(x,y,width,height,color,.9)
   .setStrokeStyle(2,0x7dd3fc,.65)
   .setInteractive({useHandCursor:false});

  button.label=this.add.text(x,y,text,{
   fontFamily:'monospace',
   fontSize:'18px',
   fontStyle:'bold',
   color:'#ffffff',
   stroke:'#000000',
   strokeThickness:3
  }).setOrigin(.5);

  button.on('pointerdown',()=>{
   audio.unlock();
   audio.play('click');
   button.setAlpha(.7);
  });
  button.on('pointerup',()=>button.setAlpha(1));
  button.on('pointerupoutside',()=>button.setAlpha(1));
  return button;
 }
}

// SETTINGS
class SettingsScene extends Phaser.Scene{
 constructor(){
  super('SettingsScene');
 }

 create(data={}){
  this.fromGame=!!data.fromGame;
  this.settings=getGameSettings();
  this.createBackground();

  this.add.text(GAME_WIDTH/2,70,'SETTINGS',{
   fontFamily:'monospace',
   fontSize:'42px',
   fontStyle:'bold',
   color:'#7dd3fc',
   stroke:'#0f172a',
   strokeThickness:6
  }).setOrigin(.5);

  this.musicButton=this.createToggle(250,'MUSIC',this.settings.music);
  this.soundButton=this.createToggle(315,'SOUND FX',this.settings.sound);
  this.vibrationButton=this.createToggle(380,'VIBRATION',this.settings.vibration);

  this.updateToggle(this.musicButton,'MUSIC',this.settings.music);
  this.updateToggle(this.soundButton,'SOUND FX',this.settings.sound);
  this.updateToggle(this.vibrationButton,'VIBRATION',this.settings.vibration);

  this.musicButton.on('pointerup',()=>{
   this.settings.music=!this.settings.music;
   audio.setMusicEnabled(this.settings.music);
   this.updateToggle(this.musicButton,'MUSIC',this.settings.music);
   this.persistSettings();
  });

  this.soundButton.on('pointerup',()=>{
   this.settings.sound=!this.settings.sound;
   audio.setSoundEnabled(this.settings.sound);
   this.updateToggle(this.soundButton,'SOUND FX',this.settings.sound);
   this.persistSettings();
  });

  this.vibrationButton.on('pointerup',()=>{
   this.settings.vibration=!this.settings.vibration;
   this.updateToggle(this.vibrationButton,'VIBRATION',this.settings.vibration);
   this.persistSettings();
  });

  const resetSave=this.createButton(
   GAME_WIDTH/2,
   455,
   300,
   48,
   'DELETE SAVE DATA',
   0x991b1b
  );

  resetSave.on('pointerup',()=>{
   localStorage.removeItem(SAVE_KEY);
   this.statusText.setText('SAVE DATA DELETED');
  });

  const back=this.createButton(
   GAME_WIDTH/2,
   520,
   180,
   42,
   'BACK',
   0x475569
  );

  back.on('pointerup',()=>{
   if(this.fromGame){
    this.scene.stop();
    const gameScene=this.scene.get('GameScene');
    if(gameScene)gameScene.closeSettingsMenu();
   }else{
    this.scene.start('MainMenuScene');
   }
  });

  this.statusText=this.add.text(GAME_WIDTH/2,555,'SETTINGS SAVED',{
   fontFamily:'monospace',
   fontSize:'12px',
   color:'#86efac'
  }).setOrigin(.5);

  this.escapeKey=this.input.keyboard.addKey(
   Phaser.Input.Keyboard.KeyCodes.ESC
  );
 }

 update(){
  if(this.escapeKey&&Phaser.Input.Keyboard.JustDown(this.escapeKey)){
   if(this.fromGame){
    this.scene.stop();
    const gameScene=this.scene.get('GameScene');
    if(gameScene)gameScene.closeSettingsMenu();
   }else{
    this.scene.start('MainMenuScene');
   }
  }
 }

 persistSettings(){
  saveGameSettings(this.settings);
  if(this.statusText)this.statusText.setText('SETTINGS SAVED');
 }

 createButton(x,y,width,height,text,color){
  const button=this.add.rectangle(x,y,width,height,color,.9)
   .setStrokeStyle(2,0x7dd3fc,.65)
   .setInteractive({useHandCursor:false});

  button.label=this.add.text(x,y,text,{
   fontFamily:'monospace',
   fontSize:'15px',
   fontStyle:'bold',
   color:'#ffffff',
   stroke:'#000000',
   strokeThickness:3
  }).setOrigin(.5);

  button.on('pointerdown',()=>{
   audio.unlock();
   audio.play('click');
   button.setAlpha(.7);
  });
  button.on('pointerup',()=>button.setAlpha(.9));
  button.on('pointerupoutside',()=>button.setAlpha(.9));
  return button;
 }

 createBackground(){
  this.add.rectangle(400,300,800,600,0x0f172a);
  this.add.circle(700,120,160,0x2563eb,.14);
  this.add.circle(100,500,180,0x7c3aed,.12);
 }

 createToggle(y,label,enabled){
  const button=this.add.rectangle(
   GAME_WIDTH/2,
   y,
   360,
   48,
   0x1e293b,
   1
  ).setStrokeStyle(2,0x475569,1)
   .setInteractive({useHandCursor:false});

  button.label=label;
  button.on('pointerdown',()=>{
   audio.unlock();
   audio.play('click');
   button.setAlpha(.7);
  });
  button.on('pointerup',()=>button.setAlpha(1));
  button.on('pointerupoutside',()=>button.setAlpha(1));
  return button;
 }

 updateToggle(button,label,enabled){
  button.setFillStyle(enabled?0x166534:0x334155,1);
  button.setStrokeStyle(2,enabled?0x86efac:0x64748b,1);

  if(button.text)button.text.destroy();
  button.text=this.add.text(
   GAME_WIDTH/2,
   button.y,
   `${label}: ${enabled?'ON':'OFF'}`,
   {
    fontFamily:'monospace',
    fontSize:'16px',
    fontStyle:'bold',
    color:'#ffffff'
   }
  ).setOrigin(.5);
 }
}

// PHASER CONFIG
const config={
 type:Phaser.AUTO,
 width:GAME_WIDTH,
 height:GAME_HEIGHT,
 backgroundColor:'#87CEEB',
 physics:{
  default:'arcade',
  arcade:{
   gravity:{
    y:WORLD_GRAVITY
   },
   debug:false
  }
 },
 scale:{
  mode:Phaser.Scale.FIT,
  autoCenter:Phaser.Scale.CENTER_BOTH
 },
 scene:[MainMenuScene,SettingsScene,GameScene]
};

// START
const game=new Phaser.Game(config);