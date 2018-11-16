const CommandInterface = require('../../commandinterface.js');

const food = require('./food.js');
const lootboxUtil = require('../zoo/lootboxUtil.js');
const gemUtil = require('../zoo/gemUtil.js');
const shopUtil = require('./shopUtil.js');

module.exports = new CommandInterface({
	
	alias:["inventory","inv"],

	args:"",

	desc:"Displays your inventory! Use 'owo equip' to use them!",

	example:[],

	related:["owo equip"],

	cooldown:10000,
	half:80,
	six:500,

	execute: function(p){
		var con=p.con,msg=p.msg;
		food.getItems(con,msg.author.id,function(foodItems){
		lootboxUtil.getItems(con,msg.author.id,function(lootboxItems){
		gemUtil.getItems(con,msg.author.id,function(gemItems){
			
			var text = addToString([foodItems,lootboxItems,gemItems]);

			if(text=="") text = "Your inventory is empty :c";
			text = "**====== "+msg.author.username+"'s Inventory ======**\n"+text;
			p.send(text);

		});
		});
		});
	}

})

/* Converts an array of items to strings */
function addToString(items){
	var sorted = [];
	var itemsID = {};
	var maxCount = 0;
	/* Sort items by id and get largest count*/
	for(var i=0;i<items.length;i++){
		var itemList = items[i];
		for(var key in itemList){
			sorted.push(itemList[key].id);
			itemsID[itemList[key].id] = itemList[key];
			if(itemList[key].count > maxCount) maxCount = itemList[key].count;
		}
	}
	sorted.sort((a,b) => a-b);
	items = [];
	for(var i=0;i<sorted.length;i++){
		items.push(itemsID[sorted[i]]);
	}
	var digits = Math.trunc(Math.log10(maxCount)+1);
	
	/* Add to text */
	var text = "";
	var count = 0;
	for(var i=0;i<items.length;i++){
		var item = items[i];
		text += "`"+((item.id<9)?"0":"")+item.id+"`"+item.key + shopUtil.toSmallNum(item.count,digits);
		count++;
		if(count==4){
			text += "\n";
			count=0;
		}else
			text += "    ";
	}

	return text;
}
