const CommandInterface = require('../../commandinterface.js');

var sender = require('../../../util/sender.js');

module.exports = new CommandInterface({
	
	alias:["resetcowoncy"],

	admin:true,
	mod:true,
	dm:true,

	execute: async function(p){
		if(p.args.length<=1){
			p.errorMsg(", Please include a reset reason",3000);
			return;
		}

		if(!p.global.isUser("<@"+p.args[0]+">")){
			p.errorMsg(", Invalid user id",3000);
			return;
		}

		let sql = `SELECT money FROM cowoncy WHERE id = ${p.args[0]};
			   UPDATE cowoncy SET money = 0 WHERE id = ${p.args[0]};`
		let result = await p.query(sql);
		let cowoncy = (result[0][0])?result[0][0].money:undefined;

		let warn = p.args.slice(2).join(" ");
		let user = await sender.msgUser(p.args[0],"**⚠ |** Your cowoncy has been reset due to: **"+warn+"**");
		if(user&&cowoncy){
			p.send(`📨 **|** Successfully reset cowoncy for **${user.tag}**\n${p.config.emoji.blank} **|** Previously had: ${cowoncy} cowoncy`);
		}else if(cowoncy){
			p.send(`⚠ **|** Failed to send msg for that user\n${p.config.emoji.blank} **|** Previously had: ${cowoncy} cowoncy`);
		}else{
			p.send(`⚠ **|** Failed to reset cowoncy`);
		}
	}

})

