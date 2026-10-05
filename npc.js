// NPC
const NPCS={
guide:{
id:'guide',
name:'FOREST GUIDE',
color:0x38bdf8,
dialogue:[
'ยินดีต้อนรับสู่ FOREST ADVENTURE!',
'กำจัดศัตรูและเก็บ COIN เพื่อเพิ่มพลังของเจ้า',
'อย่าลืมเปิด CHECKPOINT ก่อนเดินทางต่อ!'
]
},
merchant:{
id:'merchant',
name:'TRAVELER',
color:0xf59e0b,
dialogue:[
'ข้าคือนักเดินทางที่เดินทางผ่านป่าแห่งนี้',
'ข้างหน้ามีศัตรูที่แข็งแกร่งกว่าเดิม',
'เตรียมอาวุธและไอเทมของเจ้าให้พร้อม!'
]
},
cave:{
id:'cave',
name:'CAVE GUIDE',
color:0xa855f7,
dialogue:[
'เจ้ามาถึงถ้ำแล้ว',
'ที่นี่อันตรายกว่า Forest มาก',
'จงระวังศัตรูและอย่าลืม CHECKPOINT!'
]
}
};

export default class NPC{
constructor(data={}){
 const def=NPCS[data.id]||NPCS.guide;
 this.id=def.id;
 this.name=def.name;
 this.color=def.color;
 this.dialogue=[...def.dialogue];
 this.x=data.x||0;
 this.y=data.y||0;
 this.page=0;
}
getText(){
 return this.dialogue[this.page]||'...';
}
next(){
 if(this.page<this.dialogue.length-1){
  this.page++;
  return true;
 }
 return false;
}
reset(){
 this.page=0;
}
}
