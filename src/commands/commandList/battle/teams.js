/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const teamUtil = require('./util/teamUtil.js');
const maxTeams = 2;

module.exports = new CommandInterface({

	alias:["teams","setteam","squads","useteams"],

	args:"{teamNumber}",

	desc:"Select a different team!",

	example:["owo teams","owo setteam 2"],

	related:["owo battle","owo team"],

	permissions:["sendMessages","embedLinks","addReactions"],

	cooldown:5000,
	half:80,
	six:500,

	execute: async function(p){
		if (p.args.length < 1) {
			displayTeams(p);
		} else if (p.global.isInt(p.args[0])) {
			setTeam(p);
		} else {
			p.errorMsg(", the correct syntax is `owo teams use {teamNumber}`",3000);
		}
	}
})

async function displayTeams (p) {
	let sql = `SELECT pet_team.pgid,tname,pos,name,nickname,animal.pid,xp,pet_team.streak,highest_streak, pet_team_active.pgid AS active_team
		FROM user
			INNER JOIN pet_team
				ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal
				ON pet_team.pgid = pet_team_animal.pgid 
			INNER JOIN animal
				ON pet_team_animal.pid = animal.pid
			LEFT JOIN pet_team_active
				ON pet_team.pgid = pet_team_active.pgid
		WHERE user.id = ${p.msg.author.id}
		ORDER BY pgid ASC, pos ASC;`;
	sql += `SELECT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname
		FROM user u
			INNER JOIN pet_team pt
				ON u.uid = pt.uid
			INNER JOIN pet_team_animal pta
				ON pt.pgid = pta.pgid
			INNER JOIN animal c
				ON pta.pid = c.pid
			INNER JOIN user_weapon a
				ON pta.pid = a.pid
			LEFT JOIN user_weapon_passive b
				ON a.uwid = b.uwid
		WHERE u.id = ${p.msg.author.id};`
	let result = await p.query(sql);

	const teamsObj = {};
	const animalMap = {};
	for (let i in result[0]) {
		let animal = result[0][i];
		let pgid = animal.pgid;

		if (!animalMap[animal.pid]) animalMap[animal.pid] = [];
		animalMap[animal.pid].push(pgid);
		if (!teamsObj[pgid]) teamsObj[pgid] = {animals:[],weapons:[]};
		teamsObj[pgid].animals.push(animal);
	}

	for (let i in result[1]) {
		let weapon = result[1][i];
		let pgids = animalMap[weapon.pid];
		if (pgids) {
			for (let j in pgids) {
				let pgid = pgids[j];
				teamsObj[pgid].weapons.push(weapon);
			}
		}
	}

	const teams = [];
	for (let i in teamsObj) {
		let team = teamsObj[i];
		const other = {
			streak: team.animals[0].streak,
			highestStreak: team.animals[0].highest_streak,
			tname: team.animals[0].tname
		}
		team = teamUtil.parseTeam(p,team.animals,team.weapons);
		const embed = teamUtil.createTeamEmbed(p,team,other);
		embed.description = "";
		teams.push(embed);

		p.send({embed});
	}

}

async function setTeam(p) {
	let teamNum = +p.args[0];
	if (!teamNum || teamNum < 1 || teamNum > maxTeams) {
		p.errorMsg(", invalid team number!",3000);
		return;
	}

	let sql = `SELECT uid FROM user WHERE id = ${p.msg.author.id};
		SELECT pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${p.msg.author.id} ORDER BY pgid LIMIT 1 OFFSET ${teamNum-1}`;
	let result = await p.query(sql);

	if (!result[0]) {
		p.errorMsg(", you don't have any anymals! Get some with `owo hunt`!",3000);
		return;
	}

	let pgid = result[1][0];
	let uid = result[0][0].uid;
	if (!pgid) {
		sql = `INSERT INTO pet_team (uid) VALUES (${uid});`;
		result = await p.query(sql);
		console.log(result);
		pgid = result.insertId;
	} else pgid = pgid.pgid;

	sql = `INSERT INTO pet_team_active (uid,pgid) VALUES (${uid},${pgid}) ON DUPLICATE KEY UPDATE pgid = ${pgid};`;
	await p.query(sql);
	displayTeams(p);
}
