const CommandInterface = require('../../commandinterface.js');

const food = require('../../../json/food.json');
const shopUtil = require('./shopUtil.js');
const cowoncy = "<:cowoncy:416043450337853441>";
const lootboxUtil = require('../zoo/lootboxUtil.js');
const weaponUtil = require('../battle/util/weaponUtil.js');
const gemUtil = require('../zoo/gemUtil.js');

module.exports = new CommandInterface({
	
	alias:["describe","desc"],

	args:"",

	desc:"Describe an item from the shop!",

	example:["owo describe 2"],

	related:["owo shop","owo inv","owo equip"],

	cooldown:15000,
	half:80,
	six:500,

	execute: function(p){
		var item = shopUtil.getItem(p.args);

		if(typeof item === 'string' || item instanceof String){
			p.send("**🚫 | "+p.msg.author.username+"**, "+item,3000);
			return;
		}

		if(item.name=="lootbox"){
			lootboxUtil.desc(p);
		}else if(item.name=="gem"){
			gemUtil.desc(p,item.id);
		}else{
			weaponUtil.describe(p,item.id);
		}
	}

})
