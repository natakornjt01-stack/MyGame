// STAGE 1
const stage1={
 id:1,
 name:'Forest',
 worldWidth:3600,
 worldHeight:450,
 platforms:[
  {x:400,y:425,width:800,height:50},
  {x:1200,y:425,width:800,height:50},
  {x:2000,y:425,width:800,height:50},
  {x:2800,y:425,width:800,height:50},
  {x:550,y:330,width:180,height:25},
  {x:900,y:270,width:180,height:25},
  {x:1300,y:330,width:180,height:25},
  {x:1700,y:270,width:180,height:25},
  {x:2100,y:330,width:180,height:25},
  {x:2450,y:280,width:180,height:25},
  {x:2750,y:330,width:180,height:25},
  {x:3050,y:260,width:180,height:25},
  {x:3350,y:320,width:180,height:25}
 ],
 // ENEMY
 enemies:[
  {x:650,y:370,type:'slime'},
  {x:1000,y:370,type:'bat'},
  {x:1450,y:365,type:'tank'},
  {x:1800,y:370,type:'slime'},
  {x:2200,y:370,type:'bat'},
  {x:2550,y:365,type:'tank'},
  {x:2900,y:370,type:'slime'},
  {x:3300,y:370,type:'bat'}
 ],
 // COIN
 coins:[
  {x:350,y:350},{x:700,y:350},{x:1050,y:350},{x:1450,y:350},
  {x:1850,y:350},{x:2250,y:350},{x:2550,y:350},{x:2950,y:350},
  {x:3250,y:350},{x:3500,y:350},
  {x:550,y:285},{x:900,y:225},{x:1300,y:285},{x:1700,y:225},
  {x:2100,y:285},{x:2450,y:235},{x:2750,y:285},{x:3050,y:215},
  {x:3350,y:275}
 ],
 // CHECKPOINT
 checkpoints:[
  {x:850,index:1},
  {x:1700,index:2},
  {x:2550,index:3},
  {x:3300,index:4}
 ],
 // EXIT
 exit:{x:3550,y:350},
 // BACKGROUND
 treePositions:[
  100,350,600,850,1100,1350,1600,1850,
  2100,2350,2600,2850,3100,3350,3550
 ]
};
export default stage1;