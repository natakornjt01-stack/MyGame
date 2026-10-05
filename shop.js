// SHOP
const SHOP_ITEMS=[
{id:'potion',name:'POTION',price:5,description:'ฟื้น HP 30'},
{id:'wood_sword',name:'WOOD SWORD',price:30,description:'ATK +10'},
{id:'leather_armor',name:'LEATHER ARMOR',price:40,description:'DEF +5'},
{id:'lucky_ring',name:'LUCKY RING',price:50,description:'MAX HP +20'}
];

export default class Shop{
constructor(){
 this.items=SHOP_ITEMS.map(x=>({...x}));
}
getAll(){
 return this.items;
}
get(id){
 return this.items.find(x=>x.id===id)||null;
}
}