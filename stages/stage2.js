// STAGE 2
const stage2={
 id:2,
 name:'Cave',
 worldWidth:4200,
 worldHeight:450,
 platforms:[
  {x:400,y:425,width:800,height:50},
  {x:1200,y:425,width:800,height:50},
  {x:2000,y:425,width:800,height:50},
  {x:2800,y:425,width:800,height:50},
  {x:3600,y:425,width:800,height:50},
  {x:600,y:320,width:180,height:25},
  {x:950,y:250,width:180,height:25},
  {x:1350,y:300,width:180,height:25},
  {x:1750,y:240,width:180,height:25},
  {x:2150,y:310,width:180,height:25},
  {x:2550,y:250,width:180,height:25},
  {x:2950,y:300,width:180,height:25},
  {x:3350,y:230,width:180,height:25},
  {x:3750,y:300,width:180,height:25}
 ],
 // ENEMY
 enemies:[
  {x:600,y:370,type:'slime'},
  {x:1000,y:370,type:'bat'},
  {x:1400,y:365,type:'tank'},
  {x:1800,y:370,type:'slime'},
  {x:2200,y:370,type:'bat'},
  {x:2600,y:365,type:'tank'},
  {x:3000,y:370,type:'slime'},
  {x:3400,y:370,type:'bat'},
  {x:3800,y:365,type:'tank'}
 ],
 // COIN
 coins:[
  {x:350,y:350},{x:750,y:350},{x:1150,y:350},{x:1550,y:350},
  {x:1950,y:350},{x:2350,y:350},{x:2750,y:350},{x:3150,y:350},
  {x:3550,y:350},{x:3950,y:350},
  {x:600,y:275},{x:950,y:205},{x:1350,y:255},{x:1750,y:195},
  {x:2150,y:265},{x:2550,y:205},{x:2950,y:255},{x:3350,y:185},
  {x:3750,y:255}
 ],
 // CHECKPOINT
 checkpoints:[
  {x:1000,index:1},
  {x:2100,index:2},
  {x:3200,index:3}
 ],
 // EXIT
 exit:{x:4150,y:350},
 // BACKGROUND
 treePositions:[
  100,400,700,1000,1300,1600,1900,
  2200,2500,2800,3100,3400,3700,4000
 ]
};
export default stage2;