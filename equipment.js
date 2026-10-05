// EQUIPMENT
const SLOTS={
 weapon:'WEAPON',
 armor:'ARMOR',
 accessory:'ACCESSORY'
};

export default class Equipment{
 constructor(data=[]){
  this.slots={
   weapon:null,
   armor:null,
   accessory:null
  };
  (data||[]).forEach(x=>{
   if(x&&this.slots[x.slot]!==undefined)
    this.slots[x.slot]={...x,count:1};
  });
 }

 get(slot){
  return this.slots[slot]||null;
 }

 equip(item){
  if(!item||!item.slot||this.slots[item.slot]===undefined)return null;
  const old=this.slots[item.slot];
  this.slots[item.slot]={...item,count:1};
  return old;
 }

 unequip(slot){
  if(this.slots[slot]===undefined)return null;
  const old=this.slots[slot];
  this.slots[slot]=null;
  return old;
 }

 getStats(){
  const stats={atk:0,def:0,maxHP:0};
  Object.values(this.slots).forEach(x=>{
   if(!x)return;
   stats.atk+=x.atk||0;
   stats.def+=x.def||0;
   stats.maxHP+=x.maxHP||0;
  });
  return stats;
 }

 getData(){
  return Object.values(this.slots).filter(Boolean).map(x=>({
   id:x.id,
   slot:x.slot,
   atk:x.atk||0,
   def:x.def||0,
   maxHP:x.maxHP||0
  }));
 }
}