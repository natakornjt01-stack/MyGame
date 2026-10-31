import Phaser from 'phaser';
import DailyQuest from './dailyQuest.js';

const TILE = 48;
const MAIN = { w: 48, h: 30, spawn: { x: 24 * TILE, y: 27 * TILE } };
const ROOMS = {
  training: { key: 'TrainingRoomScene', title: 'TRAINING ROOM', w: 36, h: 24, spawn: { x: 18 * TILE, y: 20 * TILE } },
  rest: { key: 'RestRoomScene', title: 'REST ROOM', w: 24, h: 16, spawn: { x: 12 * TILE, y: 11 * TILE } },
  secret: { key: 'SecretRoomScene', title: 'SECRET ROOM', w: 24, h: 16, spawn: { x: 12 * TILE, y: 11 * TILE } },
};

function textStyle(size = '16px', color = '#fff') {
  return { fontFamily: 'monospace', fontSize: size, fontStyle: 'bold', color, stroke: '#000', strokeThickness: 4 };
}

function baseState(data = {}) {
  return { ...data, dailyQuest: data.dailyQuest || null };
}

class GuildBaseScene extends Phaser.Scene {
  constructor(key, title, room) { super(key); this.title = title; this.room = room; }

  init(data = {}) {
    this.returnData = baseState(data.returnData || data);
    this.daily = new DailyQuest(this.returnData.dailyQuest);
    this.spawn = data.spawn || this.room.spawn;
    this.fromMain = data.fromMain !== false;
  }

  preload() {
    this.load.spritesheet('guildPlayer', '/assets/guild/player-guild.png', { frameWidth: 48, frameHeight: 96 });
    this.load.spritesheet('guildNpc', '/assets/guild/npc-guild.png', { frameWidth: 48, frameHeight: 96 });
    this.load.image('guildTiles', '/assets/guild/guild-tiles.png');
    this.load.image('guildObjects', '/assets/guild/guild-objects.png');
  }

  create() {
    this.physics.world.setBounds(0, 0, this.room.w * TILE, this.room.h * TILE);
    this.cameras.main.setBounds(0, 0, this.room.w * TILE, this.room.h * TILE);
    this.drawRoom();
    this.createAnimations();
    this.createPlayer();
    this.createExit();
    this.createHud();
    this.createControls();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,ESC');
    this.cameras.main.startFollow(this.player, true, .12, .12);
    this.cameras.main.setZoom(.9);
  }

  createAnimations() {
    const directions = [['down', 0], ['left', 4], ['right', 8], ['up', 12]];
    directions.forEach(([dir, start]) => {
      this.createSafeAnimation(`guild-player-${dir}`, 'guildPlayer', start, start + 3, 8);
      this.createSafeAnimation(`guild-npc-${dir}`, 'guildNpc', start, start + 3, 5);
    });
  }

  createSafeAnimation(key, texture, start, end, frameRate) {
    if (!this.textures.exists(texture) || this.anims.exists(key)) return;
    const frames = this.anims.generateFrameNumbers(texture, { start, end });
    if (!frames.length) return;
    this.anims.create({ key, frames, frameRate, repeat: -1 });
  }

  drawRoom() {
    const width = this.room.w * TILE; const height = this.room.h * TILE;
    this.add.rectangle(width / 2, height / 2, width, height, 0x211927).setDepth(-10);
    for (let y = 0; y < this.room.h; y++) for (let x = 0; x < this.room.w; x++) {
      const c = (x + y) % 2 ? 0x503b35 : 0x5d4439;
      this.add.rectangle(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE - 2, TILE - 2, c).setDepth(-5);
    }
    this.add.rectangle(width / 2, 28, width, 56, 0x171827).setStrokeStyle(4, 0xd6a25e);
    this.add.text(width / 2, 28, this.title, textStyle('24px', '#f5d49b')).setOrigin(.5);
    this.add.rectangle(width / 2, height - 24, width, 48, 0x171827).setStrokeStyle(4, 0xd6a25e);
  }

  createPlayer() {
    this.player = this.add.sprite(this.spawn.x, this.spawn.y, 'guildPlayer', 0).setDisplaySize(48, 96).setDepth(20);
    if (this.anims.exists('guild-player-down')) this.player.play('guild-player-down');
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(30, 40).setOffset(9, 52);
  }

  createExit() {
    const exit = this.add.rectangle(this.room.w * TILE / 2, this.room.h * TILE - 58, 150, 48, 0x28445d).setStrokeStyle(3, 0x9ddcff).setDepth(5);
    exit.setData('action', 'main');
    this.add.text(exit.x, exit.y, 'BACK TO MAIN HALL', textStyle('10px', '#d8f3ff')).setOrigin(.5).setDepth(6);
    this.exit = exit;
  }

  createHud() {
    this.hud = this.add.text(16, 16, `${this.title}\nE / TALK / USE`, textStyle('15px', '#fff')).setScrollFactor(0).setDepth(100);
    this.prompt = this.add.text(640, 670, '', textStyle('17px', '#ffe09b')).setOrigin(.5).setScrollFactor(0).setDepth(100);
  }

  createControls() {
    this.controls = { left: false, right: false, up: false, down: false };
    const button = (x, y, glyph, key) => {
      const b = this.add.rectangle(x, y, 62, 62, 0x172033, .9).setStrokeStyle(2, 0x9bdcff).setScrollFactor(0).setDepth(100).setInteractive();
      this.add.text(x, y, glyph, textStyle('28px')).setOrigin(.5).setScrollFactor(0).setDepth(101);
      b.on('pointerdown', () => { this.controls[key] = true; });
      ['pointerup', 'pointerout', 'pointerupoutside'].forEach(e => b.on(e, () => { this.controls[key] = false; }));
    };
    button(90, 635, '◀', 'left'); button(230, 635, '▶', 'right'); button(160, 565, '▲', 'up'); button(160, 705, '▼', 'down');
    this.useButton = this.add.rectangle(1120, 635, 180, 58, 0x9a5b25, .95).setStrokeStyle(3, 0xffd18c).setScrollFactor(0).setDepth(100).setInteractive();
    this.useLabel = this.add.text(1120, 635, 'TALK / USE', textStyle('15px')).setOrigin(.5).setScrollFactor(0).setDepth(101);
    this.useButton.on('pointerup', () => this.interact());
  }

  update() {
    if (this.dialog) return;
    const vx = (this.keys.A.isDown || this.keys.LEFT.isDown || this.controls.left ? -1 : 0) + (this.keys.D.isDown || this.keys.RIGHT.isDown || this.controls.right ? 1 : 0);
    const vy = (this.keys.W.isDown || this.keys.UP.isDown || this.controls.up ? -1 : 0) + (this.keys.S.isDown || this.keys.DOWN.isDown || this.controls.down ? 1 : 0);
    const length = Math.hypot(vx, vy) || 1;
    this.player.body.setVelocity(vx / length * 230, vy / length * 230);
    if (vx || vy) {
      const dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : (vy < 0 ? 'up' : 'down');
      const animationKey = `guild-player-${dir}`;
      if (this.anims.exists(animationKey)) this.player.play(animationKey, true);
    } else this.player.anims.pause();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) this.interact();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.scene.start('MainMenuScene');
    this.updateNearby();
  }

  updateNearby() {
    const candidates = [this.exit, ...(this.npcs || []), ...(this.gates || [])].filter(Boolean);
    let near = null; let distance = Infinity;
    candidates.forEach(obj => { const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y); if (d < distance) { near = obj; distance = d; } });
    this.nearby = distance < 135 ? near : null;
    this.useButton.setAlpha(this.nearby ? 1 : .35);
    this.prompt.setText(this.nearby ? `E / TALK / USE : ${this.nearby.getData('label') || 'ประตู'}` : '');
  }

  interact() {
    if (!this.nearby) return;
    const action = this.nearby.getData('action');
    if (action === 'main') { this.returnToMain(); return; }
    if (action === 'stage') { this.confirmStageReturn(); return; }
    if (action === 'room') { this.scene.start(this.nearby.getData('scene'), { returnData: this.getReturnData(), fromMain: true }); return; }
    if (action === 'daily') { this.showDailyDialog(); return; }
    this.showDialog(this.nearby.getData('name') || 'NPC', ['ยินดีต้อนรับสู่กิลด์นักผจญภัย', 'กด NEXT เพื่ออ่านต่อ หรือ CLOSE เพื่อกลับไปสำรวจ']);
  }

  getReturnData() { return { ...this.returnData, dailyQuest: this.daily.getData() }; }

  returnToMain() { this.scene.start('GuildScene', { returnData: this.getReturnData(), spawn: MAIN.spawn, fromMain: false }); }

  confirmStageReturn() {
    this.showDialog('RETURN TO STAGE?', ['กลับไปยัง Checkpoint ล่าสุดใช่ไหม?'], {
      label: 'CONFIRM', callback: () => this.scene.start('GameScene', { ...this.getReturnData(), keepProgress: true, fromGuild: true, returnToCheckpoint: true })
    });
  }

  showDailyDialog() {
    const q = this.daily.getCurrent();
    const pending = this.daily.getPending();
    if (q.status === 'AVAILABLE') this.daily.accept();
    let lines = [`สถานะ: ${q.status}`, `${q.description} (${q.progress}/${q.target})`, `รางวัล: ${q.reward.coin} Coin + ${q.reward.exp} EXP`];
    if (pending.length) lines.push(`มีรางวัลเก่าที่ทำสำเร็จค้างรับ ${pending.length} รายการ`);
    const reward = q.status === 'COMPLETED' ? this.daily.claim() : null;
    if (reward) { this.returnData.coinCount = Number(this.returnData.coinCount || 0) + reward.coin; this.returnData.playerEXP = Number(this.returnData.playerEXP || 0) + reward.exp; lines.push(`รับรางวัลแล้ว: +${reward.coin} Coin +${reward.exp} EXP`); }
    this.showDialog('DAILY QUEST', lines);
  }

  showDialog(title, lines, action = null) {
    this.dialog = this.add.container(640, 360).setScrollFactor(0).setDepth(1000);
    this.dialog.add(this.add.rectangle(0, 0, 760, 285, 0x0b1020, .98).setStrokeStyle(3, 0x8bd5ff));
    this.dialog.add(this.add.text(0, -105, title, textStyle('22px', '#ffe19c')).setOrigin(.5));
    this.dialog.add(this.add.text(-330, -65, lines.join('\n\n'), { ...textStyle('15px'), wordWrap: { width: 660 } }));
    const close = this.add.rectangle(action ? 205 : 0, 105, 160, 42, 0x475569).setInteractive();
    this.dialog.add(close); this.dialog.add(this.add.text(action ? 205 : 0, 105, 'CLOSE', textStyle('14px')).setOrigin(.5));
    close.on('pointerup', () => { this.dialog.destroy(); this.dialog = null; });
    if (action) { const btn = this.add.rectangle(-205, 105, 160, 42, 0x16803c).setInteractive(); this.dialog.add(btn); this.dialog.add(this.add.text(-205, 105, action.label, textStyle('14px')).setOrigin(.5)); btn.on('pointerup', action.callback); }
  }
}

export class GuildScene extends GuildBaseScene {
  constructor() { super('GuildScene', 'ADVENTURER\'S GUILD • MAIN HALL', { w: MAIN.w, h: MAIN.h, spawn: MAIN.spawn }); }
  create() {
    super.create();
    this.createMainDecor(); this.createNpcs(); this.createGates();
  }
  createMainDecor() {
    const width = MAIN.w * TILE;
    this.add.rectangle(width / 2, 210, width - 240, 130, 0x3b2830).setStrokeStyle(5, 0xd6a25e);
    this.add.text(120, 210, 'COUNTER', textStyle('15px', '#ffe2ad')).setOrigin(.5);
    this.add.rectangle(2200, 540, 360, 620, 0x4c3031).setStrokeStyle(5, 0xd6a25e);
    this.add.text(2200, 540, 'SHOP', textStyle('24px', '#ffe2ad')).setOrigin(.5);
    for (let x = 700; x < 1900; x += 300) this.add.rectangle(x, 650, 180, 72, 0x8a5639).setStrokeStyle(3, 0xd5a16b);
    this.add.circle(380, 930, 95, 0x7244aa, .22).setStrokeStyle(5, 0xcab4ff);
    this.add.text(380, 1040, 'MOONLIGHT ALTAR', textStyle('13px', '#e0ceff')).setOrigin(.5);
  }
  createNpcs() {
    const defs = [
      ['Guild Master', 760, 330, 0], ['Receptionist', 300, 330, 16], ['Merchant', 2200, 760, 32],
      ['Trainer', 1850, 1080, 48], ['Iris', 380, 930, 64], ['Secret Guard', 2200, 1250, 80],
    ];
    this.npcs = defs.map(([name, x, y, frame]) => {
      const key = `guild-npc-${frame}`;
      this.createSafeAnimation(key, 'guildNpc', frame, frame + 3, 5);
      const npc = this.add.sprite(x, y, 'guildNpc', frame).setDisplaySize(48, 96).setDepth(20).setData({ name, label: name, action: name === 'Guild Master' || name === 'Receptionist' ? 'daily' : 'talk' });
      if (this.anims.exists(key)) npc.play(key); return npc;
    });
  }
  createGates() {
    const gate = (name, x, y, scene) => { const g = this.add.rectangle(x, y, 150, 55, 0x28445d).setStrokeStyle(3, 0x9ddcff).setData({ label: name, action: 'room', scene }); this.add.text(x, y, name, textStyle('11px', '#d8f3ff')).setOrigin(.5); return g; };
    this.gates = [gate('TRAINING ROOM', 1850, 1320, 'TrainingRoomScene'), gate('REST ROOM', 1200, 1320, 'RestRoomScene'), gate('SECRET ROOM', 2450, 1320, 'SecretRoomScene')];
    const stage = this.add.rectangle(1100, 150, 170, 55, 0x8d5427).setStrokeStyle(3, 0xffd18c).setData({ label: 'RETURN TO STAGE', action: 'stage' });
    this.add.text(stage.x, stage.y, 'RETURN TO STAGE', textStyle('11px', '#fff0c8')).setOrigin(.5); this.gates.push(stage);
  }
}

export class TrainingRoomScene extends GuildBaseScene { constructor() { super('TrainingRoomScene', 'TRAINING ROOM', ROOMS.training); } }
export class RestRoomScene extends GuildBaseScene { constructor() { super('RestRoomScene', 'REST ROOM', ROOMS.rest); } }
export class SecretRoomScene extends GuildBaseScene { constructor() { super('SecretRoomScene', 'SECRET ROOM', ROOMS.secret); } }

export default GuildScene;