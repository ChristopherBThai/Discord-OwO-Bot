const Discord = require('discord.js');
const Error = require('../../../../handler/errorHandler.js');
const dateUtil = require('../../../../util/dateUtil.js');
const global = require('../../../../util/global.js');
const teamUtil = require('./teamUtil.js');
const weaponUtil = require('./weaponUtil.js');
const animalUtil = require('./animalUtil.js');
const battleImageUtil = require('../battleImage.js');
const WeaponInterface = require('../WeaponInterface.js');
const imagegenAuth = require('../../../../../tokens/imagegen.json');
const crateUtil = require('./crateUtil.js');

const attack = '👊🏼';
const weapon = '🗡';
const numEmojis = ['1⃣','2⃣','3⃣'];


/* ==================================== Grabs battle from sql ====================================  */
/* Grabs existing battle */
var getBattle = exports.getBattle = async function(p,setting){
	/* And our team */
	let sql = `SELECT pet_team_battle.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat,cphp,cpwp,cehp,cewp
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${p.msg.author.id} 
			AND active = 1
		ORDER BY pos ASC;`;
	/* Query enemy team */
	sql += `SELECT pet_team.censor as ptcensor,animal.offensive as acensor,pet_team_battle.epgid,enemyTeam.tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat,cphp,cpwp,cehp,cewp
		FROM user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.epgid = pet_team_animal.pgid
			INNER JOIN pet_team enemyTeam ON pet_team_battle.epgid = enemyTeam.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid 
		WHERE user.id = ${p.msg.author.id} 
			AND active = 1
		ORDER BY pos ASC;`;

	/* Should we censor? */
	sql += `SELECT young FROM guild WHERE id = ${p.msg.guild.id} AND young = 1;`;

	let result = await p.query(sql);

	let censor = (result[2][0])?true:false;

	/* Grab pgid */
	let pgid = result[0][0]?result[0][0].pgid:undefined;
	let epgid = result[1][0]?result[1][0].epgid:undefined;

	if(!pgid||!epgid) return undefined;

	/* Parse teams */
	let pTeam = teamUtil.parseTeam(p,result[0],result[0]);
	for(let i in pTeam) animalUtil.stats(pTeam[i]);
	let eTeam = teamUtil.parseTeam(p,result[1],result[1],censor);
	for(let i in eTeam) animalUtil.stats(eTeam[i]);

	/* Parse current hp/wp */
	try{
		parseSqlStats(pTeam,result[0][0].cphp,result[0][0].cpwp);
		parseSqlStats(eTeam,result[1][0].cehp,result[1][0].cewp);
	}catch(err){
		console.error(err);
		await finishBattle(null,p,null,6381923,"An error occured",false,false);
		return;
	}

	/* No need to save if instant */
	if(setting.instant){
		await finishBattle(null,p,null,6381923,"Instant battle",false,false);
	}

	/* Combine result */
	let teams = {player:{pgid:pgid,name:result[0][0].tname,team:pTeam},enemy:{pgid:epgid,name:(censor&&result[1][0].ptcensor==1)?"Censored":result[1][0].tname,team:eTeam}};

	return teams;
}

/* Creates a brand new battle */
exports.initBattle = async function(p,setting){
	/* Find random opponent */
	let sql = `SELECT COUNT(pgid) as count FROM pet_team;SELECT pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${p.msg.author.id}`;
	let count = await p.query(sql);
	let pgid = count[1][0];
	if(!pgid){
		p.errorMsg(", You don't have a team! Set one with `owo team add {animal}`!");
		return;
	}
	pgid = pgid.pgid
	count = count[0];

	if(!count[0]) throw new Error("battleUtil sql is broken");

	count = Math.floor(Math.random()*(count[0].count-1));

	/* Query random team */
	sql = `SELECT pet_team.censor as ptcensor,pet_team.pgid,tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE pet_team.pgid = (
			SELECT pgid FROM pet_team WHERE pgid != ${pgid} LIMIT 1 OFFSET ${count}	
		) ORDER BY pos ASC;`;
	sql += `SELECT c.offensive as acensor,a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname 
		FROM 
			user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid 
		WHERE 
			a.pid IN (
				SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE pet_team.pgid = (SELECT pgid FROM pet_team WHERE pgid != ${pgid}  LIMIT 1 OFFSET ${count})
			);`;
	/* And our team */
	sql += `SELECT pet_team.pgid,tname,pos,name,nickname,pid,xp FROM pet_team LEFT JOIN (pet_team_animal NATURAL JOIN animal) ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) ORDER BY pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname FROM user_weapon a LEFT JOIN user_weapon_passive b ON a.uwid = b.uwid LEFT JOIN animal c ON a.pid = c.pid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}) AND a.pid IN (SELECT pid FROM pet_team LEFT JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid WHERE uid = (SELECT uid FROM user WHERE id = ${p.msg.author.id}));`;

	/* Should we censor? */
	sql += `SELECT young FROM guild WHERE id = ${p.msg.guild.id} AND young = 1;`;

	let result = await p.query(sql);

	let censor = (result[4][0])?true:false;

	pgid = result[2][0]?result[2][0].pgid:undefined;
	let epgid = result[0][0]?result[0][0].pgid:undefined;

	if(!pgid||!epgid){
		p.errorMsg(", Create a team with the command `owo team add {animal}`");
		return;
	}

	/* Parse */
	let eTeam = teamUtil.parseTeam(p,result[0],result[1],censor);
	let pTeam = teamUtil.parseTeam(p,result[2],result[3]);

	/* Init stats for sql*/
	let cpstats = initSqlSaveStats(pTeam);
	let cestats = initSqlSaveStats(eTeam);
	
	/* Combine all to one obj */
	let teams = {player:{pgid:pgid,name:result[2][0].tname,team:pTeam},enemy:{pgid:epgid,name:(censor&&result[0][0].ptcensor==1)?"Censored":result[0][0].tname,team:eTeam}};

	/* No need to save if instant */
	if(!setting.instant){
		/* Added the team into team_battle table */
		sql = `INSERT IGNORE INTO pet_team_battle (pgid,epgid,cphp,cpwp,cehp,cewp,active) VALUES (
				${pgid},${epgid},
				'${cpstats.hp}','${cpstats.wp}',
				'${cestats.hp}','${cestats.wp}',
				1
			) ON DUPLICATE KEY UPDATE 
				epgid = ${epgid},
				cphp = '${cpstats.hp}', cpwp = '${cpstats.wp}',
				cehp = '${cestats.hp}', cewp = '${cestats.wp}',
				active = 1,started = NOW();`;
		result = await p.query(sql);
	}

	return teams;
}

/* ==================================== battle display methods ====================================  */

/* Generates a display for the current battle (image mode)*/
var display = exports.display = async function(p,team,logs,display){
	if(display=="text")
		return displayText(p,team,logs);
	else if(display=="compact")
		return displayCompact(p,team,logs);
	let image = await battleImageUtil.generateImage(team);
	let logtext = "";
	let pTeam = "";
	for(var i=0;i<team.player.team.length;i++){
		let player = team.player.team[i];
		pTeam += "L. "+player.stats.lvl+" ";
		pTeam += player.animal.value;
		if(player.weapon){
			pTeam += " - "+player.weapon.rank.emoji+player.weapon.emoji;
			let passives = player.weapon.passives;
			for(var j in passives){
				pTeam += passives[j].emoji;
			}
			//pTeam += " "+player.weapon.avgQuality+"%";
		}else
			pTeam += " - *no weapon*";
		if(logs&&logs.player&&logs.player[i]){
			logtext += "\n";
			logtext += logs.player[i];
		}
		pTeam += "\n";
	}
	let eTeam = "";
	for(var i=0;i<team.enemy.team.length;i++){
		let enemy = team.enemy.team[i];
		eTeam += "L. "+enemy.stats.lvl+" ";
		eTeam += enemy.animal.value;
		if(enemy.weapon){
			eTeam += " - "+enemy.weapon.rank.emoji+enemy.weapon.emoji;
			let passives = enemy.weapon.passives;
			for(var j in passives){
				eTeam+= passives[j].emoji;
			}
			//eTeam += " "+enemy.weapon.avgQuality+"%";
		}else
			eTeam += " - *no weapon*";
		if(logs&&logs.enemy&&logs.enemy[i]){
			logtext += "\n";
			logtext += logs.enemy[i];
		}
		eTeam += "\n";

	}
	let embed = {
		"color":p.config.embed_color,
		"author":{
			"name":p.msg.author.username+" goes into battle!",
			"icon_url":p.msg.author.avatarURL
		},
		"fields":[
		{
			"name":team.player.name?team.player.name:"Player team",
			"value":pTeam,
			"inline":true
		},{
			"name":team.enemy.name?team.enemy.name:"Enemy team",
			"value":eTeam,
			"inline":true
		}
		],
		"image":{
			"url":imagegenAuth.imageGenUrl+"/battleimage/uuid/"+image
		}
	}
	/*
	if(logtext!="")
		embed.description = logtext;
		*/
	return {embed}
}

/* displays the battle as text */
var displayText = exports.displayText = async function(p,team,logs){
	let logtext = "";
	let pTeam = [];
	for(var i=0;i<team.player.team.length;i++){
		let player = team.player.team[i];
		let text = ""
		text += animalDisplayText(player);
		logtext += "\n" + (player.animal.uni?player.animal.uni:player.animal.value) + " ";
		if(logs&&logs.player&&logs.player[i]){
			logtext += logs.player[i];
		}else
			logtext += "is ready to battle!";
		pTeam.push(text);
	}
	let eTeam = [];
	for(var i=0;i<team.enemy.team.length;i++){
		let enemy = team.enemy.team[i];
		let text = "";
		text += animalDisplayText(enemy);
		logtext += "\n" + (enemy.animal.uni?enemy.animal.uni:enemy.animal.value) + " ";
		if(logs&&logs.enemy&&logs.enemy[i]){
			logtext += logs.enemy[i];
		}else
			logtext += "is ready to battle!";
		eTeam.push(text);

	}
	let embed = {
		"color":p.config.embed_color,
		"author":{
			"name":p.msg.author.username+" goes into battle!",
			"icon_url":p.msg.author.avatarURL
		},
		/*
		"description":logtext,
		*/
		"fields":[] 
	}
	if(pTeam.join("\n").length>=1020||eTeam.join("\n").length>=1020){
		for(let i in pTeam){
			embed.fields.push({
				"name":team.player.name?team.player.name:"Player Team",
				"value":pTeam[i],
				"inline":true
			});
		}
		for(let i in pTeam){
			embed.fields.push({
				"name":team.enemy.name?team.enemy.name:"Enemy Team",
				"value":eTeam[i],
				"inline":true
			});
		}
	}
	else{
		embed.fields.push({
			"name":team.player.name?team.player.name:"Player Team",
			"value":pTeam.join('\n'),
			"inline":true
		});
		embed.fields.push({
			"name":team.enemy.name?team.enemy.name:"Enemy Team",
			"value":eTeam.join('\n'),
			"inline":true
		});
	}
	/*
	if(logtext!="")
		embed.description = logtext;
		*/
	return {embed};
}

/* displays the battle as compact mode*/
var displayCompact = exports.displayCompact= async function(p,team,logs){
	let pTeam = [];
	for(var i=0;i<team.player.team.length;i++){
		let player = team.player.team[i];
		let text = ""
		text += animalCompactDisplayText(player);
		pTeam.push(text);
	}
	let eTeam = [];
	for(var i=0;i<team.enemy.team.length;i++){
		let enemy = team.enemy.team[i];
		let text = "";
		text += animalCompactDisplayText(enemy);
		eTeam.push(text);

	}
	let embed = {
		"color":p.config.embed_color,
		"author":{
			"name":p.msg.author.username+" goes into battle!",
			"icon_url":p.msg.author.avatarURL
		},
		"fields":[] 
	}
	if(pTeam.join("\n").length>=1020||eTeam.join("\n").length>=1020){
		for(let i in pTeam){
			embed.fields.push({
				"name":team.player.name?team.player.name:"Player Team",
				"value":pTeam[i],
				"inline":true
			});
		}
		for(let i in pTeam){
			embed.fields.push({
				"name":team.enemy.name?team.enemy.name:"Enemy Team",
				"value":eTeam[i],
				"inline":true
			});
		}
	}
	else{
		embed.fields.push({
			"name":team.player.name?team.player.name:"Player Team",
			"value":pTeam.join('\n'),
			"inline":true
		});
		embed.fields.push({
			"name":team.enemy.name?team.enemy.name:"Enemy Team",
			"value":eTeam.join('\n'),
			"inline":true
		});
	}
	return {embed};
}

/* ==================================== battle execution ====================================  */
/* Creates a reaction collector and executes the turn */
var reactionCollector = exports.reactionCollector = async function(p,msg,battle,auto,actions,setting){
	/* Parse team and first animal choice */
	let team = battle.player.team;
	var current = 0;
	/* Skip if the animal is dead */
	while(team[current]&&team[current].stats.hp[0]<=0)
		current++;
	/* If all animals are dead end it. */
	if(!team[current]){
		await finishBattle(msg,p,battle,6381923,"An error occured",false,false);
		return;
	}

	/* If user input includes actions in args */
	if(actions){
		if(typeof actions === 'object'){
			setTimeout(async function(){
				try{await executeBattle(p,msg,actions,setting);}
				catch(err){console.error(err);}
			},3000);
		}else{
			actions = actions.split('');
			if(actions.length >= team.length){
				action = {};
				for(var i=0;i<actions.length;i++){
					if(actions[i]=='w')
						action[i] = weapon;
					else
						action[i] = attack;
				}
				action.auto = true;
				setTimeout(async function(){
					try{await executeBattle(p,msg,action,setting);}
					catch(err){console.error(err);}
				},2000);
			}else{
				p.errorMsg(", Invalid arguments!");
			}
		}
		return;
	}

	/* Add initial reactions */
	await msg.react(attack);
	await msg.react(weapon);
	/* Add reaction */
	let emoji = numEmojis[current];
	var emojiReaction = await msg.react(emoji);

	/* Construct reaction collector */
	var filter = (reaction,user) => (reaction.emoji.name===attack||reaction.emoji.name===weapon)&&user.id===p.msg.author.id;
	var collector = msg.createReactionCollector(filter,{time:20000});
	var action = {};
	collector.on('collect', async function(r){
		/* Save the animal's action */
		if(r.emoji.name===attack) action[current] = attack;
		else action[current] = weapon;

		/* Gather action for next animal */
		current++;
		await emojiReaction.remove();
		while(team[current]&&team[current].stats.hp[0]<=0)
			current++;

		/* Check if we need to gather more actions */
		if(!team[current]){
			/* If not, execute the actions */
			try{
				await collector.stop();
				await executeBattle(p,msg,action,setting);
			}catch(err){
				console.error(err);
			}
		}else{
			/* Else, gather more actions */
			emoji = numEmojis[current];
			emojiReaction = await msg.react(emoji);
		}
	})

	collector.on('end',collected => {});
}

/* Executes a whole battle sequence */
async function executeBattle(p,msg,action,setting){
	/* Update current battle */
	let battle = await getBattle(p,setting);
	if(!battle){
		await msg.edit("⚠ **|** This battle is inactive!");
		return;
	}

	/* Execute player actions */
	let pLogs = executeTurn(battle.player.team,battle.enemy.team,action);
	/* Decide enemy actions */
	let eaction = [];
	for(var i=0;i<3;i++){eaction[i] = Math.random()>.5?weapon:attack;}
	/* Execute enemy actions */
	let eLogs = executeTurn(battle.enemy.team,battle.player.team,eaction);
	let logs = {player:pLogs,enemy:eLogs};

	/* check if the battle is finished */
	let enemyWin = teamUtil.isDead(battle.player.team);
	let playerWin = teamUtil.isDead(battle.enemy.team);

	/* tie */
	if(enemyWin&&playerWin){
		await finishBattle(msg,p,battle,6381923,"It's a tie!",playerWin,enemyWin,logs,setting);

	/* enemy wins */
	}else if(enemyWin){
		await finishBattle(msg,p,battle,16711680,"You lost!",playerWin,enemyWin,logs,setting);

	/* player wins */
	}else if(playerWin){
		await finishBattle(msg,p,battle,65280,"You won!",playerWin,enemyWin,logs,setting);

	/* continue battle */
	}else{
		/* Save current state */
		let cpstats = initSqlSaveStats(battle.player.team);
		let cestats = initSqlSaveStats(battle.enemy.team);
		let ocpstats = initSqlSaveStats(battle.player.team,2);
		let ocestats = initSqlSaveStats(battle.enemy.team,2);
		sql = `UPDATE IGNORE pet_team_battle SET
				cphp = '${cpstats.hp}', cpwp = '${cpstats.wp}',
				cehp = '${cestats.hp}', cewp = '${cestats.wp}'
			WHERE 
				pgid = ${battle.player.pgid} AND
				epgid = ${battle.enemy.pgid} AND
				active = 1 AND
				cphp = '${ocpstats.hp}' AND cpwp = '${ocpstats.wp}' AND
				cehp = '${ocestats.hp}' AND cewp = '${ocestats.wp}';
			`;
		let result = await p.query(sql);
		if(result.changedRows==0){
			await finishBattle(null,p,null,6381923,"An error occured",false,false);
			await msg.edit("It seems like the enemy team ran away...");
			return;
		}
		let embed = await display(p,battle,logs,setting.display);
		await msg.edit(embed);
		await reactionCollector(p,msg,battle,setting.auto,(setting.auto?"www":undefined),setting);
	}

}

/* Calculates all the steps required to finish the battle in recursion */
var calculateAll = exports.calculateAll = function(p,battle,logs = []){

	/* check if the battle is finished */
	let enemyWin = teamUtil.isDead(battle.player.team);
	let playerWin = teamUtil.isDead(battle.enemy.team);
	if(enemyWin||playerWin){

		/* tie */
		let color=6381923;
		let text="It's a tie!";

		/* enemy wins */
		if(enemyWin){
			color = 16711680;
			text = "You lost!";

		/* player wins */
		}else if(playerWin){
			color = 65280;
			text = "You won!";
		}

		/* Last event in log is winning result */
		logs.push({enemy:enemyWin,player:playerWin,color,text});
		return logs;
	}

	/* Battle is way too long */
	if(logs.length>=15){
		logs.push({enemy:true,player:true,color:6381923,text:"Battle was too long! It's a tie!"});
		return logs;
	}

	/* Update previous hp before turn execution */
	updatePreviousStats(battle);
	/* Execute player actions */
	executeTurn(battle.player.team,battle.enemy.team,[weapon,weapon,weapon]);
	/* Decide enemy actions */
	let eaction = [];
	for(var i=0;i<3;i++){eaction[i] = Math.random()>.5?weapon:attack;}
	/* Execute enemy actions */
	executeTurn(battle.enemy.team,battle.player.team,eaction);

	/* Save only the HP and WP states (will need to save buff status later) */
	logs.push(saveStates(battle));

	/* recursive call */
	return calculateAll(p,battle,logs);
}

/* Displays all the battle results according to setting */
exports.displayAllBattles = async function(p,battle,logs,setting){
	let endResult = logs[logs.length-1];
	/* Instant mode sends just one message */
	if(setting.speed=="instant"){
		await finishBattle(null,p,battle,endResult.color,endResult.text,endResult.player,endResult.enemy,null,setting);
		return;
	}

	/* This should never happen. you probably dun goofed somewhere*/
	if(logs.length<=1) return;

	/* we should distribute the rewards first */
	setting.noMsg = true;
	await finishBattle(null,p,battle,endResult.color,endResult.text,endResult.player,endResult.enemy,null,setting);
	setting.noMsg = false;
	setting.noReward = true;

	/* Lets see which battle step we should display */
	let logLength = logs.length-1;
	let logTimeline = [];
	if(logLength<=3){
		for(let i=0;i<logLength;i++)
			logTimeline.push(i);
	}else{
		let diff = (logLength+1)/2;
		/* beginning log */
		logTimeline.push(Math.round(diff)-1);
		/* final log */
		logTimeline.push(logLength-1);
	}

	/* short mode should send 4 msgs */
	/* send initial message */
	updateTeamStats(battle.player.team,100);
	updateTeamStats(battle.enemy.team,100);
	updatePreviousStats(battle);
	let embed = await display(p,battle,undefined,setting.display);
	embed.embed.footer = {"text":"Turn 0/"+(logs.length-1)};
	let msg = await p.msg.channel.send(embed);

	/* Update the message for each log in log timeline */
	const gap = 2000;
	let i = 0;
	let msgEdit = async function(){
		let currentLog = logs[logTimeline[i]];
		let player = currentLog.player;
		let enemy = currentLog.enemy;
		updateTeamStats(battle.player.team,player);
		updateTeamStats(battle.enemy.team,enemy);
		if(i==logTimeline.length-1){
			await finishBattle(msg,p,battle,endResult.color,endResult.text,endResult.player,endResult.enemy,null,setting).catch(console.error);;
		}else{
			let embed = await display(p,battle,undefined,setting.display);
			embed.embed.footer = {"text":"Turn "+(logTimeline[i]+1)+"/"+(logs.length-1)};
			await msg.edit(embed);
			i++;
			setTimeout(msgEdit,gap);
		}
	}
	setTimeout(msgEdit,gap);
}


/* ==================================== Extra Helpers ====================================  */

/* Creates string to save in sql */
function initSqlSaveStats(team,offset=0){
	hp = "";
	wp = "";
	for(let i in team){
		if(!team[i].stats) animalUtil.stats(team[i]);
		hpN = Math.trunc(team[i].stats.hp[offset]);
		wpN = Math.trunc(team[i].stats.wp[offset]);
		if(global.isInt(hpN)) hp += hpN+",";
		else hp += "0,";
		if(global.isInt(wpN)) wp += wpN+",";
		else wp += "0,";
	}
	return {hp:hp.slice(0,-1),wp:wp.slice(0,-1)};
}

/* Parses string from sql */
function parseSqlStats(team,hp,wp){
	hp = hp.split(',');
	wp = wp.split(',');
	
	for(let i=0;i<team.length;i++){
		team[i].stats.hp[0] = parseInt(hp[i]?hp[i]:0);
		team[i].stats.hp[2] = parseInt(hp[i]?hp[i]:0);
		team[i].stats.wp[0] = parseInt(wp[i]?wp[i]:0);
		team[i].stats.wp[2] = parseInt(wp[i]?wp[i]:0);
	}
}

/* Calculates a turn for a team */
function executeTurn(team,enemy,action){
	let logs = {};
	for(var i in team){
		let animal= team[i];
		/* Check if animal has weapon */
		if(animal.weapon){
			if(action[i]==weapon)
				logs[i] = animal.weapon.attackWeapon(animal,team,enemy);
			else
				logs[i] = animal.weapon.attackPhysical(animal,team,enemy);
		}else{
			logs[i] = WeaponInterface.basicAttack(animal,team,enemy);
		}
	}
	return logs;
}

/* finish battle */
async function finishBattle(msg,p,battle,color,text,playerWin,enemyWin,logs,setting){
	/* Check if the battle is still active and if the player should receive rewards */
	let sql = "";
	if(!battle) sql = `UPDATE pet_team_battle SET active = 0 WHERE active = 1 and pgid = (SELECT pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${p.msg.author.id});`;
	else if(!setting.instant) sql = `UPDATE pet_team_battle SET active = 0 WHERE active = 1 and pgid = ${battle.player.pgid};`;
	sql +=  `SELECT * FROM user INNER JOIN crate ON user.uid = crate.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	if((!setting||!setting.instant)&&result[0].changedRows == 0) return;

	let crate = undefined;
	/* Calculate and distribute xp */
	let pXP = 0;
	let eXP = 0;
	if(!setting||!setting.noReward||!setting.noMsg){
		pXP = calculateXP({team:battle.player,win:playerWin},{team:battle.enemy,win:enemyWin});
		eXP = calculateXP({team:battle.enemy,win:enemyWin},{team:battle.player,win:playerWin});
	}

	/* Don't distribute reward if it says not to */
	if(!setting||!setting.noReward){
		/* Decide if user receives a crate */
		let crateQuery = (setting&&setting.instant)?result[0]:result[1][0];
		crate = dateUtil.afterMidnight((crateQuery)?crateQuery.claim:undefined);
		if((playerWin&&!enemyWin)&&(!crateQuery||crateQuery.claimcount<3||crate.after)){
			crate = crateUtil.crateFromBattle(p,crateQuery,crate);
			if(crate.sql) await p.query(crate.sql);
		}

		/* battle quests */
		p.quest("battle");

		/* An error occured */
		if(!playerWin&&!enemyWin) return;

		await teamUtil.giveXP(p,battle.player,pXP);
		await teamUtil.giveXP(p,battle.enemy,eXP);
	}


	if(!setting||!setting.noMsg){
		/* Send result message */
		let embed = await display(p,battle,logs,setting.display);
		embed.embed.color = color;
		text += ` Your team gained ${pXP}xp!`;
		embed.embed.footer = {text};
		if(msg) await msg.edit(embed);
		else p.send(embed);
	}

	/* send message for crate reward */
	if(crate&&crate.text) p.send(crate.text);
}

/* Calculate xp depending on win/loss/tie */
function calculateXP(team,enemy){
	/* Find the avg level diff for xp multipliers */
	let lvlDiff = 1;
	for(let i in team.team.team) lvlDiff -= team.team.team[i].stats.lvl;
	for(let i in enemy.team.team) lvlDiff += enemy.team.team[i].stats.lvl;
	if(lvlDiff<=0) lvlDiff = 1;

	/* Calculate xp */
	let xp = 50;
	if(team.win&&enemy.win) xp = 100;
	else if(team.win) xp = 200*lvlDiff;

	return xp;
}

/* Returns if the player is in battle or not */
exports.inBattle = async function(p){
	let sql = `SELECT pet_team_battle.pgid FROM user INNER JOIN pet_team ON user.uid = pet_team.uid INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid WHERE id = ${p.msg.author.id} AND active = 1;`;
	return ((await p.query(sql))[0])
}

/* converts animal info to readable string */
function animalDisplayText(animal){
	let text = "";
	text += "\nLvl."+animal.stats.lvl+" "+animal.animal.value + " ";
	text += animal.nickname?animal.nickname:animal.animal.name;
	text += "\n`"+animalUtil.bar(animal.stats)+"`\n";
	let hp = Math.ceil(animal.stats.hp[0]);
	if(hp<0) hp = 0;
	let wp = Math.ceil(animal.stats.wp[0]);
	if(wp<0) wp = 0;
	let att = Math.ceil(animal.stats.att[0]+animal.stats.att[1]);
	let mag = Math.ceil(animal.stats.mag[0]+animal.stats.mag[1]);
	let pr = Math.ceil(animal.stats.pr[0]+animal.stats.pr[1]);
	let mr = Math.ceil(animal.stats.mr[0]+animal.stats.mr[1]);
	text += `\`${hp} HP\` <:att:531616155450998794> \`${att}\` <:pr:531616156222488606> \`${pr}\`\n`;
	text += `\`${wp} WP\` <:mag:531616156231139338> \`${mag}\` <:mr:531616156226945024> \`${mr}\``;
	if(animal.weapon){
		text += "\n"+animal.weapon.rank.emoji+animal.weapon.emoji;
		let passives = animal.weapon.passives;
		for(var j in passives){
			text += passives[j].emoji;
		}
		text += " "+animal.weapon.avgQuality+"%";
	}
	return text;
}

/* converts animal info to readable string */
function animalCompactDisplayText(animal){
	let text = "";
	text += "L."+animal.stats.lvl+" "+animal.animal.value + " ";
	text += animal.nickname?animal.nickname:animal.animal.name;
	let hp = Math.ceil(animal.stats.hp[0]);
	if(hp<0) hp = 0;
	let wp = Math.ceil(animal.stats.wp[0]);
	if(wp<0) wp = 0;
	text += `\n\`${hp} HP\` `;
	text += `\`${wp} WP\` `;
	if(animal.weapon){
		text += "\n"+animal.weapon.rank.emoji+animal.weapon.emoji;
		let passives = animal.weapon.passives;
		for(var j in passives){
			text += passives[j].emoji;
		}
	}
	return text;
}

/* Update's pet team's stats */
function updateTeamStats(team,stats){
	let percent = undefined;
	if(Number.isFinite(stats)) percent = stats/100;
	for(let i=0;i<team.length;i++){
		if(percent){
			team[i].stats.hp[0] = (team[i].stats.hp[1]+team[i].stats.hp[3])*percent;
			team[i].stats.wp[0] = (team[i].stats.wp[1]+team[i].stats.wp[3])*percent;
		}else{
			team[i].stats.hp = stats[i].hp
			team[i].stats.wp = stats[i].wp
		}
	}
}

/* Saves both team's status */
function saveStates(battle){
	let player = [];
	for(let i in battle.player.team)
		player.push({
			hp:battle.player.team[i].stats.hp.slice(),
			wp:battle.player.team[i].stats.wp.slice()
		});
	let enemy = [];
	for(let i in battle.enemy.team)
		enemy.push({
			hp:battle.enemy.team[i].stats.hp.slice(),
			wp:battle.enemy.team[i].stats.wp.slice()
		});
	return {player,enemy};
}

/* Updates the previous hp/wp */
function updatePreviousStats(battle){
	for(let i in battle.player.team){
		battle.player.team[i].stats.hp[2] = battle.player.team[i].stats.hp[0];
		battle.player.team[i].stats.wp[2] = battle.player.team[i].stats.wp[0];
	}
	for(let i in battle.enemy.team){
		battle.enemy.team[i].stats.hp[2] = battle.enemy.team[i].stats.hp[0];
		battle.enemy.team[i].stats.wp[2] = battle.enemy.team[i].stats.wp[0];
	}
}
