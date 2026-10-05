// INVENTORY
const ITEMS={
 potion:{id:'potion',name:'POTION',type:'consumable',heal:30},
 wood_sword:{id:'wood_sword',name:'WOOD SWORD',type:'equipment',slot:'weapon',atk:10},
 leather_armor:{id:'leather_armor',name:'LEATHER ARMOR',type:'equipment',slot:'armor',def:5},
 lucky_ring:{id:'lucky_ring',name:'LUCKY RING',type:'equipment',slot:'accessory',maxHP:20}
};

export default class Inventory{
 constructor(size=20,data=[]){
  this.size=size;
  this.slots=Array.from({length:size},()=>null);
  (data||[]).forEach((x,i)=>{
   const item=ITEMS[x.id];
   if(i<size&&item)
    this.slots[i]={...item,count:Math.max(0,x.count|0)};
  });
 }

 getSlot(i){
  return this.slots[i]||null;
 }

 setSlot(i,item){
  if(i<0||i>=this.size)return false;
  this.slots[i]=item||null;
  return true;
 }

 addItem(id,count=1){
  if(!ITEMS[id]||count<=0)return false;
  const old=this.slots.find(x=>x&&x.id===id);
  if(old){
   old.count+=count;
   return true;
  }
  const i=this.slots.findIndex(x=>!x);
  if(i<0)return false;
  this.slots[i]={...ITEMS[id],count};
  return true;
 }

 removeItem(id,count=1){
  const x=this.slots.find(x=>x&&x.id===id);
  if(!x||count<=0)return false;
  x.count-=count;
  if(x.count<=0)this.slots[this.slots.indexOf(x)]=null;
  return true;
 }

 use(i){
  const x=this.slots[i];
  if(!x||x.count<=0)return null;
  this.removeItem(x.id,1);
  return x;
 }

 getData(){
  return this.slots.filter(Boolean).map(x=>({id:x.id,count:x.count}));
 }
}