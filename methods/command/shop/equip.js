const CommandInterface = require('../../commandinterface.js');

const shopUtil = require('./shopUtil.js');
const lootbox = require('../zoo/lootbox.js');
const gemUtil = require('../zoo/gemUtil.js');
const weapon = require('../battle/weapon.js');
const crate = require('../battle/crate.js');

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
		}else if(!item){
			p.errorMsg(", I could not find that item",3000);
			return;
		}

		if(item.name=="lootbox"){
			lootbox.execute(p);
		}else if(item.name=="gem"){
			gemUtil.use(p,item.id);
		}else if(item.name=="crate"){
			crate.execute(p);
		}else if(item.name=="weapon"){
			weapon.execute(p);
		}else{
			p.errorMsg(", Could not find that item",3000);
		}
	}

})
