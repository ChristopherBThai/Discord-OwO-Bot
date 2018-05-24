const CommandInterface = require('../../commandinterface.js');

const foodUtil = require('./food.js');
const shopUtil = require('./shopUtil.js');

module.exports = new CommandInterface({
	
	alias:["equip","use"],

	args:"{id}",

	desc:"Use an item from your inventory!",

	example:["owo equip 2"],

	related:["owo inv","owo shop","owo buy"],

	cooldown:1000,
	half:80,
	six:500,

	execute: function(p){
		var con=p.con,msg=p.msg,args=p.args;
		var item = shopUtil.getItem(args);
		if(typeof item === 'string' || item instanceof String){
			p.send("**🚫 | "+msg.author.username+"**, "+item,3000);
			return;
		}

		if(item.name=="Pill"){
			foodUtil.throwup(con,msg);
		}else
			foodUtil.equip(con,msg,item);
	}

})
