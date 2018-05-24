const CommandInterface = require('../../commandinterface.js');

const foodjs = require('./food.js');
const shopUtil = require('./shopUtil.js');

module.exports = new CommandInterface({
	
	alias:["buy","purchase"],

	args:"",

	desc:"Buy an item from the OwO Shop!",

	example:["owo buy 2"],

	related:["owo shop","owo inv","owo equip"],

	cooldown:1000,
	half:80,
	six:500,

	execute: function(p){
		var item = shopUtil.getItem(p.args);
		if(typeof item === 'string' || item instanceof String){
			p.send("**🚫 | "+p.msg.author.username+"**, "+item,3000);
			return;
		}

		foodjs.buy(p.con,p.msg,item);
	}

})
