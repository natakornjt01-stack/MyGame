// SKILLS
const SKILLS={
 slash:{
  id:'slash',
  name:'POWER SLASH',
  description:'โจมตีด้านหน้า',
  damage:60,
  cooldown:3000
 },
 heal:{
  id:'heal',
  name:'HEAL',
  description:'ฟื้น HP 40',
  heal:40,
  cooldown:5000
 },
 burst:{
  id:'burst',
  name:'POWER BURST',
  description:'โจมตีรอบตัว',
  damage:80,
  cooldown:8000
 }
};

export default class Skills{
 constructor(){
  this.data=SKILLS;
  this.cooldowns={};
 }

 get(id){
  return this.data[id]||null;
 }

 getRemaining(id){
  const end=this.cooldowns[id]||0;
  return Math.max(0,end-Date.now());
 }

 use(id){
  const skill=this.get(id);

  if(!skill)return null;

  if(this.getRemaining(id)>0)
   return null;

  this.cooldowns[id]=
   Date.now()+skill.cooldown;

  return skill;
 }

 reset(id){
  if(id)
   delete this.cooldowns[id];
  else
   this.cooldowns={};
 }
}