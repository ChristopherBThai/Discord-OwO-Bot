const CommandInterface = require('../../commandinterface.js');

const food = require('../../../json/food.json');
const shopUtil = require('./shopUtil.js');
const cowoncy = "<:cowoncy:416043450337853441>";

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

		p.send("**🛒 | "+item.key+" "+item.name+"**\n"+
			"**<:blank:427371936482328596> | ID:** `"+item.id+"`\n"+
			"**<:blank:427371936482328596> | Price:** `"+item.price+"`\n"+
			"__**<:blank:427371936482328596> | Used For:** `owo battle`                __\n"+
			"**<:blank:427371936482328596> |** `"+item.desc.replace(/(?:\r\n|\r|\n)/g, "`\n**<:blank:427371936482328596> |** `")+"`");
	}

})
