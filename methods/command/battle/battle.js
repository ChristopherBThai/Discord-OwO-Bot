const CommandInterface = require('../../commandinterface.js');

const battleUtil = require('./util/battleUtil.js');
const battleEmoji = '⚔';

module.exports = new CommandInterface({

	alias:["battle","b","fight"],

	args:"",

	desc:"",

	example:[""],

	related:["owo zoo","owo pet","owo team","owo weapon"],

	cooldown:10000,
	half:80,
	six:500,
	bot:true,

	execute: async function(p){

		/* Parse arguments */
		if(p.args[0]=="text"||p.args[0]=="image"){
			await changeType(p,p.args[0]);
			return;
		}

		let auto = false;
		let actions = undefined;
		if(p.args[0]){
			if(p.args[0]=="a"||p.args[0]=="auto")
				auto =  true;
			let tempMatch = p.args[0].match(/[aw]/gi);
			if(tempMatch&&p.args[0].match(/[aw]/gi).length==p.args[0].length)
				actions = p.args[0];
			if(p.global.isUser(p.args[0])){
				p.errorMsg(", battles with other users are not implemented yet! Sorry :(",3000);
				return;
			}
		}

		let resume = true;
		/* Get battle info */
		let battle = await battleUtil.getBattle(p);
		if(!battle){
			resume = false;
			battle = await battleUtil.initBattle(p);
		}

		let embed = await battleUtil.display(p,battle);
		let msg = await p.msg.channel.send(embed);
		await battleUtil.reactionCollector(p,msg,battle,auto,actions);
	}

})

/* Change the display type */
async function changeType(p,type){
	let sql = "";
	let text = "";
	if(type=="text"){
		sql = `INSERT INTO battle_type (uid,type) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),1) ON DUPLICATE KEY UPDATE type = 1`;
		text = ", your battles will now display as **text**!";
	}else{
		sql = `INSERT INTO battle_type (uid,type) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),0) ON DUPLICATE KEY UPDATE type = 0`;
		text = ", your battles will now display as an **image**!";
	}
	try{
		await p.query(sql);
	}catch(error){
		await p.query(`INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);+sql`);
	}
	p.replyMsg(battleEmoji,text);
}
