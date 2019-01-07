const CommandInterface = require('../../commandinterface.js');

const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({

	alias:["battle","b","fight"],

	args:"",

	desc:"",

	example:[""],

	related:["owo zoo","owo pet","owo team","owo weapon"],

	cooldown:15000,
	half:80,
	six:500,
	bot:true,

	execute: async function(p){

		let resume = true;
		/* Get battle info */
		let battle = await battleUtil.getBattle(p);
		if(!battle){
			resume = false;
			battle = await battleUtil.initBattle(p);
		}

		let embed = await battleUtil.display(p,battle);
		p.send(embed);

	}

})
