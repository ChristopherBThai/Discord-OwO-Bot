/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const animalUtil = require('./util/animalUtil.js');
const teamUtil = require('./util/teamUtil.js');
const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({

	alias:["ab","acceptbattle"],

	args:"[bet]",

	desc:"Accept a battle request! If a bet was added, you will have to add the amount to accept it in addition to the battle.",

	example:[""],

	related:["owo battle"],

	permissions:["sendMessages","embedLinks","addReactions"],

	cooldown:5000,
	half:80,
	six:500,

	execute: async function(p){
		let sql = `SELECT (SELECT id FROM user WHERE uid = sender) AS sender,bet,flags,channel
			FROM user_battle JOIN
				(SELECT uid FROM user WHERE id = ${p.msg.author.id}) AS user
			WHERE
				TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
					user1 = user.uid OR
					user2 = user.uid
				) AND (
					sender != user.uid OR
					user1 = user2
				);`;
		sql += `UPDATE user_battle JOIN
				(SELECT uid FROM user WHERE id = ${p.msg.author.id}) AS user
			SET time = '2018-01-01' WHERE
			TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
				user1 = user.uid OR
				user2 = user.uid
			);`;
		let result = await p.query(sql);

		if(!result[0][0]||result[1].changedRows==0){
			p.errorMsg(", You do not have any pending battles!",3000);
			return;
		}

		if(result[0][0].channel!=p.msg.channel.id){
			p.errorMsg(", You can only accept battle requests from the same channel!",3000);
			return;
		}

		/* Parse flags */
		let flags = result[0][0].flags.split(",");
		flags = parseFlags(flags);

		/* Get opponent name */
		let sender = result[0][0].sender;
		sender = await p.fetch.getUser(sender);
		if(!sender){
			p.errorMsg(", I could not find your opponent!",3000);
			return;
		}

		/* Grab teams */
		let teams = await parseTeams(p, p.msg.author,sender,flags);
		if(!teams) return;

		/* Handle bet */
		let bet = result[0][0].bet;
		if(!p.global.isInt(bet)) bet = 0;

		let acceptedBet = 0;
		if(p.global.isInt(p.args[0])) acceptedBet = parseInt(p.args[0]);
		if (bet !== acceptedBet) bet = 0;

		/* calculate battle */
		let logs = await battleUtil.calculateAll(p,teams);

		/* take bets if one person won*/
		let outcome = logs[logs.length-1];
		let user1 = p.msg.author.id;
		let user2 = sender.id;
		if(p.msg.author.id>sender.id){
			user1 = sender.id;
			user2 = p.msg.author.id;
		}
		let winColumn = "tie";
		let msg = "There are no winners!";
		let winner;
		if(outcome.player&&!outcome.enemy){
			if(bet>0)
				msg = p.msg.author.username+" wins "+bet+" cowoncy!";
			else
				msg = p.msg.author.username+" wins!";
			if(user1==p.msg.author.id)
				winColumn = "win1";
			else
				winColumn = "win2";
			winner = p.msg.author.id;
			loser = sender.id;
		}else if(outcome.enemy&&!outcome.player){
			if(bet>0)
				msg = sender.username+" wins "+bet+" cowoncy!";
			else
				msg = sender.username+" wins!";
			if(user1==sender.id)
				winColumn = "win1";
			else
				winColumn = "win2";
			winner = sender.id;
			loser = p.msg.author.id;
		}
		outcome.text = msg;

		/* distribute the winning cowoncy */
		let winSql = `UPDATE user_battle SET ${winColumn} = ${winColumn} + 1 WHERE user1 = (SELECT uid FROM user WHERE id = ${user1}) AND user2 = (SELECT uid FROM user WHERE id = ${user2});`;
		if(winner&&bet>0){
			sql = `UPDATE cowoncy c
				SET c.money = c.money - ${bet}
				WHERE c.id IN (${p.msg.author.id},${sender.id}) AND
					(SELECT * FROM (SELECT COUNT(id) FROM cowoncy c2 WHERE c2.id IN (${p.msg.author.id},${sender.id}) AND c2.money >= ${bet}) c3) >= 2`
			result = await p.query(sql);
			if(result.changedRows<2){
				p.errorMsg(", looks like someone doesn't have enough money!",3000);
				return;
			}
			sql = `UPDATE cowoncy SET money = money + ${bet*2} WHERE id = ${winner}; ${winSql}`
			await p.query(sql);
			p.logger.value('cowoncy',(bet),['command:battleWin','id:'+winner,'by:'+loser]);
			p.logger.value('cowoncy',(bet*-1),['command:battleLost','id:'+loser,'to:'+winner]);
		}else
			await p.query(winSql);

		/* Display the battle */
		let setting = {
			friendlyBattle:true,
			display:flags.display?flags.display:"image",
			speed:flags.log?"instant":"short",
			instant:flags.log?true:false,
			title:p.msg.author.username+" vs "+sender.username,
			showLogs:flags.log?true:false
		}

		if(sender&&sender.id!=p.msg.author.id){
			p.quest("friendlyBattle");
			p.quest("friendlyBattleBy",1,sender);
		}
		await battleUtil.displayAllBattles(p,teams,logs,setting);

	}
});

/* user1 should be challengee, user2 is challenger */
async function parseTeams(p, user, sender,flags){
	let sql = `SELECT pet_team.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE user.id = ${user.id}
		ORDER BY pos ASC;`;
	sql += `SELECT pet_team.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM user
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE user.id = ${sender.id}
		ORDER BY pos ASC;`;

	let result = await p.query(sql);

	if(!result[0][0]||!result[1][0]){
		p.errorMsg(", Could not grab the team!");
		return;
	}

	/* Parse teams */
	let pTeam = teamUtil.parseTeam(p,result[0],result[0]);
	for(let i in pTeam) animalUtil.stats(pTeam[i],flags);
	let eTeam = teamUtil.parseTeam(p,result[1],result[1]);
	for(let i in eTeam) animalUtil.stats(eTeam[i],flags);
	let player = {username:user.username,
		name:result[0][0].tname,
		team:pTeam};
	let enemy = {username:sender.username,
		name:result[1][0].tname,
		team:eTeam};

	return {player,enemy}
}

function parseFlags(flags){
	let result = {};
	for(let i in flags){
		let flag = flags[i];
		if(flag=="log"){
			result.log = true;
		}else if(flag=="compact"||flag=="image"||flag=="text"){
			result.display = flag;
		}else if(/^l[0-9]+$/.test(flag)){
			result.level = parseInt(flag.substring(1));
		}
	}
	return result;
}
