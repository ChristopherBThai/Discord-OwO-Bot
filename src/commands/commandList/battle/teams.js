/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const maxTeams = 2;

module.exports = new CommandInterface({

	alias:["teams","squads"],

	args:"use {teamNumber}",

	desc:"Select a different team!",

	example:["owo teams","owo teams use 2"],

	related:["owo battle","owo team"],

	permissions:["sendMessages","embedLinks","addReactions"],

	cooldown:5000,
	half:80,
	six:500,

	execute: async function(p){
		if (p.args.length <= 1) {
			displayTeams(p);
		} else if (["use", "set", "change"].includes(p.args[0])) {
			setTeam(p);
		} else {
			p.errorMsg(", the correct syntax is `owo teams use {teamNumber}`",3000);
		}
	}
})

async function displayTeams (p) {
}

async function setTeam(p) {
	let teamNum = +p.args[1];
	if (!teamNum || teamNum < 1 || teamNum > maxTeams) {
		p.errorMsg(", invalid team number!",3000);
		return;
	}

	let sql = `SELECT user.uid,pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${p.msg.author.id} ORDER BY pgid LIMIT 1 OFFSET ${teamNum-1}`;
	let result = await p.query(sql);
	let pgid = result[0].pgid;
	console.log(result);
	if (!pgid) {
		let uid = result[0].uid;
		sql = `INSERT INTO pet_team (uid) VALUES (${uid});`;
		result = await.p.query(sql);
		console.log(result);
		pgid = result.insertId;
	}
	console.log(pgid);
}
