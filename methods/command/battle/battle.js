const CommandInterface = require('../../commandinterface.js');

const battleUtil = require('./util/battleUtil.js');
const battleEmoji = '⚔';
const battleSettings = require('./battleSetting.js');

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

		/* Parse arguments */
		if(p.args[0]=="text"||p.args[0]=="image"){
			await changeType(p,p.args[0]);
			return;
		}

		/* Grab user settings for battle */
		let setting = await parseSettings(p);

		/* Get battle info */
		let resume = true;
		let battle = await battleUtil.getBattle(p,setting);
		if(!battle){
			resume = false;
			battle = await battleUtil.initBattle(p,setting);
		}

		/* If no team */
		if(!battle) return;

		/* whether it should  calculate the whole battle or step by step */
		/* Instant */
		if(setting.instant){
			let logs = await battleUtil.calculateAll(p,battle);
			await battleUtil.displayAllBattles(p,battle,logs,setting);

		/* turn by turn */
		}else{
			/* Display the first message */
			let embed = await battleUtil.display(p,battle,undefined,setting.display);
			let msg = await p.msg.channel.send(embed);
			await battleUtil.reactionCollector(p,msg,battle,setting.auto,(setting.auto?"www":undefined),setting);
		}
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

async function parseSettings(p){
	let sql = `SELECT auto,display,speed from user INNER JOIN battle_settings ON user.uid = battle_settings.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	return parseSetting(result);
}

function parseSetting(query){
	let auto = true;
	let display = "image";
	let speed = "short";
	let instant = false;

	if(query[0]){
		if(query[0].auto==1)
			auto = false;
		if(query[0].display=="text")
			display = "text";
		else if(query[0].display=="compact")
			display = "compact";
		if(query[0].speed==0)
			speed = "instant";
		else if(query[0].speed==2)
			speed = "lengthy";
	}

	if(auto&&(speed=="short"||speed=="instant")){
		instant = true;
	}

	return {auto,display,speed,instant};
}
