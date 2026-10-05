// QUEST
const QUESTS=[
{id:'slime_hunter',name:'SLIME HUNTER',description:'กำจัด SLIME 3 ตัว',type:'kill',target:3,enemyType:'slime',reward:{exp:100,coin:5}},
{id:'coin_collector',name:'COIN COLLECTOR',description:'เก็บ COIN 10 เหรียญ',type:'coin',target:10,reward:{exp:120,coin:10}},
{id:'checkpoint_runner',name:'CHECKPOINT RUNNER',description:'เปิด CHECKPOINT 2 จุด',type:'checkpoint',target:2,reward:{exp:150,coin:15}},
{id:'monster_hunter',name:'MONSTER HUNTER',description:'กำจัดศัตรู 5 ตัว',type:'kill',target:5,reward:{exp:200,coin:20}}
];

export default class Quest{
constructor(data=[]){
this.quests=QUESTS.map(q=>{
const old=(data||[]).find(x=>x&&x.id===q.id);
return{...q,progress:Math.min(q.target,Math.max(0,old?.progress|0)),completed:!!old?.completed};
});
}
get(id){return this.quests.find(q=>q.id===id)||null;}
getActive(){return this.quests.find(q=>!q.completed)||null;}
getCompletedCount(){return this.quests.filter(q=>q.completed).length;}
getAll(){return this.quests;}
getData(){return this.quests.map(q=>({id:q.id,progress:q.progress,completed:q.completed}));}
add(type,value=1,filter=null){
const done=[];
if(value<=0)return done;
this.quests.forEach(q=>{
if(q.completed||q.type!==type)return;
if(type==='kill'&&q.enemyType&&q.enemyType!==filter)return;
q.progress=Math.min(q.target,q.progress+value);
if(q.progress>=q.target){
q.completed=true;
done.push(q.id);
}
});
return done;
}
onEnemyKill(type){return this.add('kill',1,type);}
onCoin(value=1){return this.add('coin',value);}
onCheckpoint(){return this.add('checkpoint',1);}
getReward(id){
const q=this.get(id);
return q?q.reward:{exp:0,coin:0};
}
}