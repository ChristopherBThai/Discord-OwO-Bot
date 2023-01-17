/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const teamUtil = require('./util/teamUtil.js');
const battleUtil = require('./util/battleUtil.js');
const battleFriendUtil = require('./util/battleFriendUtil.js');
const maxTeams = 2;
const starEmoji = '⭐';

module.exports = new CommandInterface({
	alias: ['teams', 'setteam', 'squads', 'useteams'],

	args: '{teamNumber}',

	desc: 'Select a different team!',

	example: ['owo teams', 'owo setteam 2'],

	related: ['owo battle', 'owo team'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: async function (p) {
		if (p.args.length < 1) {
			displayTeams(p);
		} else if (p.global.isInt(p.args[0])) {
			setTeam(p, +p.args[0]);
		} else {
			p.errorMsg(', the correct syntax is `owo setteam {teamNumber}`', 3000);
		}
	},
});

async function displayTeams(p) {
	// Fetch all teams and weapons
	let sql = `SELECT pet_team.pgid,tname,pos,name,nickname,animal.pid,xp,pet_team.streak,highest_streak
		FROM user
			INNER JOIN pet_team
				ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal
				ON pet_team.pgid = pet_team_animal.pgid 
			INNER JOIN animal
				ON pet_team_animal.pid = animal.pid
		WHERE user.id = ${p.msg.author.id}
		ORDER BY pgid ASC, pos ASC;`;
	sql += `SELECT DISTINCT a.pid,a.uwid,a.wid,a.stat,b.pcount,b.wpid,b.stat as pstat,c.name,c.nickname
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
		WHERE u.id = ${p.msg.author.id};`;
	sql += `SELECT pet_team.pgid, pet_team_active.pgid AS active FROM user
		INNER JOIN pet_team
			ON user.uid = pet_team.uid
		LEFT JOIN pet_team_active
			ON pet_team.pgid = pet_team_active.pgid
		WHERE user.id = ${p.msg.author.id}
		ORDER BY pgid ASC;`;
	let result = await p.query(sql);

	// group animals by pgid
	const teamsObj = {};
	const animalMap = {};
	for (let i in result[0]) {
		let animal = result[0][i];
		let pgid = animal.pgid;

		if (!animalMap[animal.pid]) animalMap[animal.pid] = [];
		animalMap[animal.pid].push(pgid);
		if (!teamsObj[pgid]) teamsObj[pgid] = { animals: [], weapons: [] };
		teamsObj[pgid].animals.push(animal);
	}

	// group weapons by pgid
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

	// Check if we even have 1 team
	let activeTeam = 0;
	const teamsOrder = {};
	if (!result[2].length) {
		p.errorMsg(", you don't have a team! Create one with `owo team add {animalName}`!", 5000);
		return;
	}
	// Find current active team
	for (let i in result[2]) {
		teamsOrder[result[2][i].pgid] = i;
		if (result[2][i].active) activeTeam = i;
	}

	// Parse all teams and weapons
	const teams = [];
	for (let i in teamsObj) {
		let team = teamsObj[i];
		const pgid = team.animals[0].pgid;
		const other = {
			streak: team.animals[0].streak,
			highest_streak: team.animals[0].highest_streak,
			tname: team.animals[0].tname || 'team',
		};
		team = teamUtil.parseTeam(p, team.animals, team.weapons);
		const embed = teamUtil.createTeamEmbed(p, team, other);
		const teamOrder = teamsOrder[pgid];
		if (teamOrder == null) {
			p.errorMsg(", I couldn't parse your team... something went terribly wrong!", 3000);
			return;
		}
		teams[teamOrder] = embed;
	}

	// Construct embed array to display message
	for (let i = 0; i < maxTeams; i++) {
		if (!teams[i]) {
			teams[i] = {
				author: {
					name: p.msg.author.username + "'s team",
					icon_url: p.msg.author.avatarURL,
				},
				description:
					'`owo team add {animal} {pos}` Add an animal to your team\n`owo team remove {pos}` Removes an animal from your team\n`owo team rename {name}` Renames your team\n`owo rename {animal} {name}` Rename an animal\n`owo setteam {teamNum}` to set multiple teams',
				color: p.config.embed_color,
				footer: {
					text: `Current Streak: 0 | Highest Streak: 0 | Page ${i + 1}/${maxTeams}`,
				},
				fields: [],
			};
			for (let j = 1; j <= 3; j++) {
				teams[i].fields.push({
					name: 'none',
					value: '*`owo team add {animal} ' + j + '`*',
					inline: true,
				});
			}
		} else {
			teams[i].footer.text += ` | Page ${i + 1}/${maxTeams}`;
		}
		if (activeTeam == i) {
			teams[i].footer.text += ' ' + starEmoji;
		}
	}

	const createEmbed = (curr) => {
		return teams[curr];
	};
	const additionalButtons = [
		{
			type: 2,
			style: 1,
			custom_id: 'star',
			emoji: {
				id: null,
				name: starEmoji,
			},
		},
	];
	const additionalFilter = (componentName, user) =>
		componentName === 'star' && user.id == p.msg.author.id;
	const pagedMsg = new p.PagedMessage(p, createEmbed, teams.length - 1, {
		startingPage: activeTeam,
		idle: 120000,
		additionalFilter,
		additionalButtons,
	});

	/* eslint-disable-next-line */
	pagedMsg.on('button', async (component, user, ack, { currentPage, maxPage }) => {
		if (component === 'star') {
			await setTeam(p, currentPage + 1, true);
			for (let i in teams) {
				teams[i].footer.text = teams[i].footer.text.replace(` ${starEmoji}`, '');
			}
			teams[currentPage].footer.text += ` ${starEmoji}`;
			await ack({ embed: teams[currentPage] });
		}
	});
}

async function setTeam(p, teamNum, dontDisplay) {
	// argument validation
	if (!teamNum || teamNum < 1 || teamNum > maxTeams) {
		p.errorMsg(', invalid team number!', 3000);
		return;
	}

	// You cant change teams if in battle
	if (await battleUtil.inBattle(p)) {
		p.errorMsg(
			", You cannot change your team while you're in battle! Please finish your `owo battle`!",
			3000
		);
		return;
	} else if (await battleFriendUtil.inBattle(p)) {
		p.errorMsg(
			', You cannot change your team while you have a pending battle! Use `owo db` to decline',
			3000
		);
		return;
	}

	// Fetch uid and pgid
	let sql = `SELECT uid FROM user WHERE id = ${p.msg.author.id};
		SELECT pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${
			p.msg.author.id
		} ORDER BY pgid LIMIT 1 OFFSET ${teamNum - 1}`;
	let result = await p.query(sql);

	if (!result[0]) {
		p.errorMsg(", you don't have any animals! Get some with `owo hunt`!", 3000);
		return;
	}

	let pgid = result[1][0];
	let uid = result[0][0].uid;
	// Insert it to db if it doesn't exist
	if (!pgid) {
		sql = `INSERT INTO pet_team (uid) VALUES (${uid});`;
		result = await p.query(sql);
		pgid = result.insertId;
	} else pgid = pgid.pgid;

	// insert as the current active team
	sql = `INSERT INTO pet_team_active (uid,pgid) VALUES (${uid},${pgid}) ON DUPLICATE KEY UPDATE pgid = ${pgid};`;
	await p.query(sql);
	if (!dontDisplay) displayTeams(p);
}
