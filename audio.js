// AUDIO MANAGER
// Procedural BGM/SFX for the beta build.
// Replace the oscillator patterns with audio assets later without changing main.js.

const AUDIO_SETTINGS_KEY='mygame-settings-v1';

export default class AudioManager{
 constructor(){
  this.context=null;
  this.masterGain=null;
  this.musicGain=null;
  this.sfxGain=null;
  this.musicTimer=null;
  this.musicStep=0;
  this.musicEnabled=true;
  this.soundEnabled=true;
  this.loadSettings();
 }

 loadSettings(){
  try{
   const data=JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY)||'{}');
   this.musicEnabled=data.music!==false;
   this.soundEnabled=data.sound!==false;
  }catch(error){
   this.musicEnabled=true;
   this.soundEnabled=true;
  }
 }

 saveSettings(){
  try{
   const data=JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY)||'{}');
   data.music=this.musicEnabled;
   data.sound=this.soundEnabled;
   localStorage.setItem(AUDIO_SETTINGS_KEY,JSON.stringify(data));
  }catch(error){
   console.warn('AUDIO SETTINGS SAVE FAILED',error);
  }
 }

 ensureContext(){
  if(this.context){
   if(this.context.state==='suspended')this.context.resume();
   return true;
  }

  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return false;

  this.context=new Context();
  this.masterGain=this.context.createGain();
  this.musicGain=this.context.createGain();
  this.sfxGain=this.context.createGain();

  this.musicGain.gain.value=.22;
  this.sfxGain.gain.value=.55;
  this.masterGain.gain.value=.8;

  this.musicGain.connect(this.masterGain);
  this.sfxGain.connect(this.masterGain);
  this.masterGain.connect(this.context.destination);

  return true;
 }

 unlock(){
  if(this.ensureContext()&&this.context.state==='suspended')this.context.resume();
 }

 setMusicEnabled(enabled){
  this.musicEnabled=!!enabled;
  this.saveSettings();
  if(!this.musicEnabled)this.stopMusic();
  else this.startMusic();
 }

 setSoundEnabled(enabled){
  this.soundEnabled=!!enabled;
  this.saveSettings();
 }

 startMusic(){
  if(!this.musicEnabled||this.musicTimer)return;
  if(!this.ensureContext())return;

  this.unlock();
  this.musicStep=0;
  this.musicTimer=window.setInterval(()=>this.playMusicStep(),520);
  this.playMusicStep();
 }

 stopMusic(){
  if(this.musicTimer){
   window.clearInterval(this.musicTimer);
   this.musicTimer=null;
  }
 }

 playMusicStep(){
  if(!this.musicEnabled||!this.ensureContext())return;

  const notes=[220,277.18,329.63,277.18,196,246.94,293.66,246.94];
  const frequency=notes[this.musicStep%notes.length];
  this.musicStep++;
  this.tone(frequency,.28,'sine',.055,this.musicGain,0);
 }

 play(name){
  if(!this.soundEnabled||!this.ensureContext())return;
  this.unlock();

  const sounds={
   click:{frequency:520,duration:.055,type:'square',volume:.12},
   jump:{frequency:420,duration:.11,type:'square',volume:.16,slide:680},
   attack:{frequency:150,duration:.09,type:'sawtooth',volume:.18,slide:80},
   hit:{frequency:95,duration:.13,type:'square',volume:.2,slide:55},
   coin:{frequency:880,duration:.12,type:'sine',volume:.16,slide:1320},
   power:{frequency:260,duration:.3,type:'sawtooth',volume:.16,slide:760},
   levelup:{frequency:660,duration:.24,type:'sine',volume:.18,slide:990},
   checkpoint:{frequency:520,duration:.28,type:'sine',volume:.16,slide:1040},
   enemyDown:{frequency:180,duration:.2,type:'sawtooth',volume:.16,slide:65},
   error:{frequency:120,duration:.16,type:'square',volume:.15,slide:80}
  };

  const sound=sounds[name]||sounds.click;
  this.tone(
   sound.frequency,
   sound.duration,
   sound.type,
   sound.volume,
   this.sfxGain,
   sound.slide||0
  );
 }

 tone(frequency,duration,type,volume,gain,slide){
  if(!this.context||!gain)return;

  const now=this.context.currentTime;
  const oscillator=this.context.createOscillator();
  const envelope=this.context.createGain();

  oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,now);
  if(slide){
   oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20,slide),
    now+duration
   );
  }

  envelope.gain.setValueAtTime(.0001,now);
  envelope.gain.exponentialRampToValueAtTime(volume,now+.012);
  envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);

  oscillator.connect(envelope);
  envelope.connect(gain);
  oscillator.start(now);
  oscillator.stop(now+duration+.03);
 }
}