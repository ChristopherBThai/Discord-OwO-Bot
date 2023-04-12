/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const dateUtil = require('../../../../utils/dateUtil.js');
const global = require('../../../../utils/global.js');
const mysql = require('../../../../utils/mysql.js');
const teamUtil = require('./teamUtil.js');
const animalUtil = require('./animalUtil.js');
const battleImageUtil = require('../battleImage.js');
const WeaponInterface = require('../WeaponInterface.js');
let allBuffs = WeaponInterface.allBuffs;
const request = require('request');
const crateUtil = require('./crateUtil.js');
const alterBattle = require('../../patreon/alterBattle.js');

const maxAnimals = 6;
const attack = '👊🏼';
exports.attack = attack;
const weapon = '🗡';
exports.weapon = weapon;
const numEmojis = ['1⃣', '2⃣', '3⃣'];
const stopStreak = {
	start: 1678435200000,
	end: 1679122800000,
};

function teamFilter(userId) {
	return `SELECT pt2.pgid FROM user u2
		INNER JOIN pet_team pt2
			ON pt2.uid = u2.uid
		LEFT JOIN pet_team_active pt_act
			ON pt2.pgid = pt_act.pgid
	WHERE u2.id = ${userId}
	ORDER BY pt_act.pgid DESC, pt2.pgid ASC
	LIMIT 1`;
}

let minPgid = 0;
mysql.con.query('SELECT pgid FROM pet_team ORDER BY pgid ASC LIMIT 1', (err, result) => {
	if (err) throw err;
	minPgid = result[0]?.pgid || 0;
});

/* ==================================== Grabs battle from sql ====================================  */
/* Grabs existing battle */
let getBattle = (exports.getBattle = async function (p, setting) {
	/* And our team */
	let sql = `SELECT pet_team_battle.pgid,tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat,cphp,cpwp,cehp,cewp,pet_team.streak,pet_team.highest_streak
		FROM pet_team
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE pet_team.pgid = (${teamFilter(p.msg.author.id)})
			AND active = 1
		ORDER BY pos ASC;`;
	/* Query enemy team */
	sql += `SELECT pet_team.censor as ptcensor,animal.offensive as acensor,pet_team_battle.epgid,enemyTeam.tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat,cphp,cpwp,cehp,cewp
		FROM pet_team
			INNER JOIN pet_team_battle ON pet_team.pgid = pet_team_battle.pgid
			INNER JOIN pet_team_animal ON pet_team_battle.epgid = pet_team_animal.pgid
			INNER JOIN pet_team enemyTeam ON pet_team_battle.epgid = enemyTeam.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE pet_team.pgid = (${teamFilter(p.msg.author.id)})
			AND active = 1
		ORDER BY pos ASC;`;
	sql += `SELECT pet_team_battle_buff.*
		FROM pet_team
			INNER JOIN pet_team_battle_buff ON pet_team.pgid = pet_team_battle_buff.pgid
		WHERE pet_team.pgid = (${teamFilter(p.msg.author.id)});`;
	sql += teamFilter(p.msg.author.id) + ';';

	let result = await p.query(sql);

	let censor = true;

	/* Grab pgid */
	let pgid = result[0][0] ? result[0][0].pgid : undefined;
	let epgid = result[1][0] ? result[1][0].epgid : undefined;

	if (!pgid || !epgid) return undefined;

	/* Parse teams */
	let pTeam = teamUtil.parseTeam(p, result[0], result[0]);
	for (let i in pTeam) animalUtil.stats(pTeam[i]);
	let eTeam = teamUtil.parseTeam(p, result[1], result[1], censor);
	for (let i in eTeam) animalUtil.stats(eTeam[i]);

	/* Parse current hp/wp */
	try {
		parseSqlStats(pTeam, result[0][0].cphp, result[0][0].cpwp);
		parseSqlStats(eTeam, result[1][0].cehp, result[1][0].cewp);
		parseSqlBuffs(pTeam, result[2], eTeam);
		parseSqlBuffs(eTeam, result[2], pTeam);
	} catch (err) {
		console.error(err);
		await finishBattle(null, p, null, 6381923, 'An error occured', false, false);
		return;
	}

	/* No need to save if instant */
	if (setting.instant) {
		await finishBattle(null, p, null, 6381923, 'Instant battle', false, false);
	}

	/* Combine result */
	let player = {
		pgid: pgid,
		name: result[0][0].tname,
		streak: result[0][0].streak,
		highestStreak: result[0][0].highest_streak,
		team: pTeam,
	};
	let enemy = {
		pgid: epgid,
		name: censor && result[1][0].ptcensor == 1 ? 'Censored' : result[1][0].tname,
		team: eTeam,
	};
	let teams = { player, enemy };

	return teams;
});

/* Creates a brand new battle */
exports.initBattle = async function (p, setting) {
	/* Find random opponent */
	let sql = `SELECT pgid AS count FROM pet_team ORDER BY pgid DESC LIMIT 1;SELECT pgid FROM user LEFT JOIN pet_team ON user.uid = pet_team.uid WHERE id = ${p.msg.author.id}`;
	let count = await p.query(sql);
	let pgid = count[1][0];
	if (!pgid) {
		p.errorMsg(", You don't have a team! Set one with `owo team add {animal}`!");
		return;
	}
	pgid = pgid.pgid;
	count = count[0];

	if (!count[0]) throw 'battleUtil sql is broken';

	count = minPgid + Math.floor(Math.random() * (count[0].count - minPgid));

	/* Query random team */
	sql = `SELECT pet_team.censor as ptcensor, pet_team.pgid, animal.offensive as acensor, tname, pos, animal.name, animal.nickname, animal.pid, animal.xp, user_weapon.uwid, user_weapon.wid, user_weapon.stat, user_weapon_passive.pcount, user_weapon_passive.wpid, user_weapon_passive.stat as pstat
		FROM pet_team
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE pet_team.pgid = (
			SELECT temp1.pgid FROM pet_team temp1 INNER JOIN pet_team_animal temp2 ON temp1.pgid = temp2.pgid WHERE temp1.pgid > ${count} limit 1
		)
		ORDER BY pos ASC;`;
	/* And our team */
	sql += `SELECT pet_team.censor as ptcensor, streak, highest_streak, animal.offensive as acensor,pet_team.pgid, tname,pos,animal.name,animal.nickname,animal.pid,animal.xp,user_weapon.uwid,user_weapon.wid,user_weapon.stat,user_weapon_passive.pcount,user_weapon_passive.wpid,user_weapon_passive.stat as pstat
		FROM pet_team
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN user_weapon ON user_weapon.pid = pet_team_animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
		WHERE pet_team.pgid = (${teamFilter(p.msg.author.id)})
		ORDER BY pos ASC;`;

	let result = await p.query(sql);

	let censor = true;

	pgid = result[1][0] ? result[1][0].pgid : undefined;
	let epgid = result[0][0] ? result[0][0].pgid : undefined;

	if (!pgid || !epgid) {
		p.errorMsg(', Create a team with the command `owo team add {animal}`');
		return;
	}

	/* Parse */
	let eTeam = teamUtil.parseTeam(p, result[0], result[0], censor);
	let pTeam = teamUtil.parseTeam(p, result[1], result[1]);

	/* Init stats for sql*/
	let cpstats = initSqlSaveStats(pTeam);
	let cestats = initSqlSaveStats(eTeam);

	/* Combine all to one obj */
	let player = {
		pgid: pgid,
		name: result[1][0].tname,
		streak: result[1][0].streak,
		highestStreak: result[1][0].highest_streak,
		team: pTeam,
	};
	let enemy = {
		pgid: epgid,
		name: censor && result[0][0].ptcensor == 1 ? 'Censored' : result[0][0].tname,
		team: eTeam,
	};
	let teams = { player, enemy };

	/* No need to save if instant */
	if (!setting.instant) {
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
};

/* ==================================== battle display methods ====================================  */

/* Generates a display for the current battle (image mode)*/
let display = (exports.display = async function (
	p,
	team,
	logs,
	{ display, title, showLogs, logLink }
) {
	display = alterBattle.overrideDisplay(p, display);
	if (display == 'text') return displayText(p, team, logs, { title, showLogs, logLink });
	else if (display == 'compact') return displayCompact(p, team, logs, { title, showLogs, logLink });
	let image = await battleImageUtil.generateImage(team);
	if (!image || image == '') return displayCompact(p, team, logs, { title, showLogs, logLink });
	let pTeam = '';
	for (let i = 0; i < team.player.team.length; i++) {
		let player = team.player.team[i];
		pTeam += 'L. ' + player.stats.lvl + ' ';
		pTeam += player.animal.value;
		if (player.weapon) {
			pTeam += ' - ' + player.weapon.rank.emoji + player.weapon.emoji;
			let passives = player.weapon.passives;
			for (let j in passives) {
				pTeam += passives[j].emoji;
			}
			//pTeam += " "+player.weapon.avgQuality+"%";
		} else pTeam += ' - *no weapon*';
		pTeam += '\n';
	}
	let eTeam = '';
	for (let i = 0; i < team.enemy.team.length; i++) {
		let enemy = team.enemy.team[i];
		eTeam += 'L. ' + enemy.stats.lvl + ' ';
		eTeam += enemy.animal.value;
		if (enemy.weapon) {
			eTeam += ' - ' + enemy.weapon.rank.emoji + enemy.weapon.emoji;
			let passives = enemy.weapon.passives;
			for (let j in passives) {
				eTeam += passives[j].emoji;
			}
			//eTeam += " "+enemy.weapon.avgQuality+"%";
		} else eTeam += ' - *no weapon*';
		eTeam += '\n';
	}
	let embed = {
		color: p.config.embed_color,
		author: {
			name: title ? title : p.msg.author.username + ' goes into battle!',
			icon_url: p.msg.author.avatarURL,
		},
		fields: [
			{
				name: team.player.name ? team.player.name : 'Player team',
				value: pTeam,
				inline: true,
			},
			{
				name: team.enemy.name ? team.enemy.name : 'Enemy team',
				value: eTeam,
				inline: true,
			},
		],
		image: {
			url: `${process.env.GEN_HOST}/image/${image}`,
		},
	};

	if (logLink) embed.description = '[Log Link](' + logLink + ')';
	else if (showLogs) embed.description = parseLogs(logs);

	return { embed };
});

/* displays the battle as text */
let displayText = (exports.displayText = async function (
	p,
	team,
	logs,
	{ title, showLogs, logLink }
) {
	let pTeam = [];
	for (let i = 0; i < team.player.team.length; i++) {
		let player = team.player.team[i];
		let text = '';
		text += animalDisplayText(player);
		pTeam.push(text);
	}
	let eTeam = [];
	for (let i = 0; i < team.enemy.team.length; i++) {
		let enemy = team.enemy.team[i];
		let text = '';
		text += animalDisplayText(enemy);
		eTeam.push(text);
	}
	let embed = {
		color: p.config.embed_color,
		author: {
			name: title ? title : p.msg.author.username + ' goes into battle!',
			icon_url: p.msg.author.avatarURL,
		},
		fields: [],
	};
	if (pTeam.join('\n').length >= 1020 || eTeam.join('\n').length >= 1020) {
		for (let i in pTeam) {
			if (pTeam[i])
				embed.fields.push({
					name: team.player.name ? team.player.name : 'Player Team',
					value: pTeam[i],
					inline: true,
				});
		}
		for (let i in pTeam) {
			if (eTeam[i])
				embed.fields.push({
					name: team.enemy.name ? team.enemy.name : 'Enemy Team',
					value: eTeam[i],
					inline: true,
				});
		}
	} else {
		embed.fields.push({
			name: team.player.name ? team.player.name : 'Player Team',
			value: pTeam.join('\n'),
			inline: true,
		});
		embed.fields.push({
			name: team.enemy.name ? team.enemy.name : 'Enemy Team',
			value: eTeam.join('\n'),
			inline: true,
		});
	}
	if (logLink) embed.description = '[Log Link](' + logLink + ')';
	else if (showLogs) embed.description = parseLogs(logs);
	return { embed };
});

/* displays the battle as compact mode*/
let displayCompact = (exports.displayCompact = async function (
	p,
	team,
	logs,
	{ title, showLogs, logLink }
) {
	let pTeam = [];
	for (let i = 0; i < team.player.team.length; i++) {
		let player = team.player.team[i];
		let text = '';
		text += animalCompactDisplayText(player);
		pTeam.push(text);
	}
	let eTeam = [];
	for (let i = 0; i < team.enemy.team.length; i++) {
		let enemy = team.enemy.team[i];
		let text = '';
		text += animalCompactDisplayText(enemy);
		eTeam.push(text);
	}
	let embed = {
		color: p.config.embed_color,
		author: {
			name: title ? title : p.msg.author.username + ' goes into battle!',
			icon_url: p.msg.author.avatarURL,
		},
		fields: [],
	};
	if (pTeam.join('\n').length >= 1020 || eTeam.join('\n').length >= 1020) {
		for (let i in pTeam) {
			embed.fields.push({
				name: team.player.name ? team.player.name : 'Player Team',
				value: pTeam[i],
				inline: true,
			});
		}
		for (let i in pTeam) {
			embed.fields.push({
				name: team.enemy.name ? team.enemy.name : 'Enemy Team',
				value: eTeam[i],
				inline: true,
			});
		}
	} else {
		embed.fields.push({
			name: team.player.name ? team.player.name : 'Player Team',
			value: pTeam.join('\n'),
			inline: true,
		});
		embed.fields.push({
			name: team.enemy.name ? team.enemy.name : 'Enemy Team',
			value: eTeam.join('\n'),
			inline: true,
		});
	}
	if (logLink) embed.description = '[Log Link](' + logLink + ')';
	else if (showLogs) embed.description = parseLogs(logs);
	return { embed };
});

/* ==================================== battle execution ====================================  */
/* Creates a reaction collector and executes the turn */
let reactionCollector = (exports.reactionCollector = async function (
	p,
	msg,
	battle,
	auto,
	actions,
	setting
) {
	/* Parse team and first animal choice */
	let team = battle.player.team;
	let current = 0;
	/* Skip if the animal is dead */
	while (team[current] && team[current].stats.hp[0] <= 0) current++;
	/* If all animals are dead end it. */
	if (!team[current]) {
		await finishBattle(msg, p, battle, 6381923, 'An error occured', false, false);
		return;
	}

	/* If user input includes actions in args */
	if (actions) {
		if (typeof actions === 'object') {
			setTimeout(async function () {
				try {
					await executeBattle(p, msg, actions, setting);
				} catch (err) {
					console.error(err);
				}
			}, 3000);
		} else {
			actions = actions.split('');
			if (actions.length >= team.length) {
				action = {};
				for (let i = 0; i < actions.length; i++) {
					if (actions[i] == 'w') action[i] = weapon;
					else action[i] = attack;
				}
				action.auto = true;
				setTimeout(async function () {
					try {
						await executeBattle(p, msg, action, setting);
					} catch (err) {
						console.error(err);
					}
				}, 2000);
			} else {
				p.errorMsg(', Invalid arguments!');
			}
		}
		return;
	}

	/* Add initial reactions */
	await msg.react(attack);
	await msg.react(weapon);
	/* Add reaction */
	let emoji = numEmojis[current];
	let emojiReaction = await msg.react(emoji);

	/* Construct reaction collector */
	let filter = (reaction, user) =>
		(reaction.emoji.name === attack || reaction.emoji.name === weapon) &&
		user.id === p.msg.author.id;
	let collector = msg.createReactionCollector(filter, { time: 20000 });
	let action = {};
	collector.on('collect', async function (r) {
		/* Save the animal's action */
		if (r.emoji.name === attack) action[current] = attack;
		else action[current] = weapon;

		/* Gather action for next animal */
		current++;
		await emojiReaction.users.remove();
		while (team[current] && team[current].stats.hp[0] <= 0) current++;

		/* Check if we need to gather more actions */
		if (!team[current]) {
			/* If not, execute the actions */
			try {
				await collector.stop();
				await executeBattle(p, msg, action, setting);
			} catch (err) {
				console.error(err);
			}
		} else {
			/* Else, gather more actions */
			emoji = numEmojis[current];
			emojiReaction = await msg.react(emoji);
		}
	});

	collector.on('end', (_collected) => {});
});

/* Executes a whole battle sequence */
async function executeBattle(p, msg, action, setting) {
	/* Update current battle */
	let battle = await getBattle(p, setting);
	if (!battle) {
		await msg.edit('⚠ **|** This battle is inactive!');
		return;
	}

	/* Decide enemy actions */
	let eaction = [weapon, weapon, weapon];
	/* Pre turn */
	preTurn(battle.player.team, battle.enemy.team, action);
	preTurn(battle.enemy.team, battle.player.team, eaction);
	/* Execute actions */
	let pLogs = executeTurn(battle.player.team, battle.enemy.team, {
		ally: action,
		enemy: eaction,
	});
	let eLogs = [];
	let logs = { player: pLogs, enemy: eLogs };
	/* Post turn */
	postTurn(battle.player.team, battle.enemy.team, action);
	postTurn(battle.enemy.team, battle.player.team, eaction);
	/* Remove marked buffs */
	removeBuffs(battle.player.team, battle.enemy.team);

	/* check if the battle is finished */
	let enemyWin = teamUtil.isDead(battle.player.team);
	let playerWin = teamUtil.isDead(battle.enemy.team);

	/* tie */
	if (enemyWin && playerWin) {
		await finishBattle(msg, p, battle, 6381923, "It's a tie!", playerWin, enemyWin, null, setting);

		/* enemy wins */
	} else if (enemyWin) {
		await finishBattle(msg, p, battle, 16711680, 'You lost!', playerWin, enemyWin, null, setting);

		/* player wins */
	} else if (playerWin) {
		await finishBattle(msg, p, battle, 65280, 'You won!', playerWin, enemyWin, null, setting);

		/* continue battle */
	} else {
		/* Save current state */
		let cpstats = initSqlSaveStats(battle.player.team);
		let cestats = initSqlSaveStats(battle.enemy.team);
		let ocpstats = initSqlSaveStats(battle.player.team, 2);
		let ocestats = initSqlSaveStats(battle.enemy.team, 2);
		let sql = `UPDATE IGNORE pet_team_battle SET
				cphp = '${cpstats.hp}', cpwp = '${cpstats.wp}',
				cehp = '${cestats.hp}', cewp = '${cestats.wp}'
			WHERE
				pgid = ${battle.player.pgid} AND
				epgid = ${battle.enemy.pgid} AND
				active = 1 AND
				cphp = '${ocpstats.hp}' AND cpwp = '${ocpstats.wp}' AND
				cehp = '${ocestats.hp}' AND cewp = '${ocestats.wp}';
			DELETE FROM pet_team_battle_buff WHERE pgid = ${battle.player.pgid};`;
		let sqlBuffs = initSqlSaveBuffs(battle);
		sql += sqlBuffs;
		let result = await p.query(sql);
		if (result[0].changedRows == 0) {
			await finishBattle(null, p, null, 6381923, 'An error occured', false, false);
			await msg.edit('It seems like the enemy team ran away...');
			return;
		}
		let embed = await display(p, battle, logs, setting);
		await msg.edit(embed);
		await reactionCollector(
			p,
			msg,
			battle,
			setting.auto,
			setting.auto ? 'www' : undefined,
			setting
		);
	}
}

/* Calculates all the steps required to finish the battle in recursion */
let calculateAll = (exports.calculateAll = function (p, battle, logs = []) {
	/* check if the battle is finished */
	let enemyWin = teamUtil.isDead(battle.player.team);
	let playerWin = teamUtil.isDead(battle.enemy.team);
	if (enemyWin || playerWin) {
		/* tie */
		let color = 6381923;
		let text = "It's a tie in " + logs.length + ' turns!';

		/* enemy wins */
		if (enemyWin && !playerWin) {
			color = 16711680;
			text = 'You lost in ' + logs.length + ' turns!';

			/* player wins */
		} else if (playerWin && !enemyWin) {
			color = 65280;
			text = 'You won in ' + logs.length + ' turns!';
		}

		/* Last event in log is winning result */
		logs.push({ enemy: enemyWin, player: playerWin, color, text });
		return logs;
	}

	/* Battle is way too long */
	if (logs.length >= 24) {
		logs.push({
			enemy: true,
			player: true,
			color: 6381923,
			text: "Battle was too long! It's a tie!",
		});
		return logs;
	}

	/* Update previous hp before turn execution */
	updatePreviousStats(battle);

	let battleLogs = [];

	/* Decide enemy actions */
	let eaction = [weapon, weapon, weapon];
	/* Pre turn */
	battleLogs = battleLogs.concat(
		preTurn(battle.player.team, battle.enemy.team, [weapon, weapon, weapon])
	);
	battleLogs = battleLogs.concat(preTurn(battle.enemy.team, battle.player.team, eaction));
	/* Execute actions */
	battleLogs = battleLogs.concat(
		executeTurn(battle.player.team, battle.enemy.team, {
			ally: [weapon, weapon, weapon],
			enemy: eaction,
		})
	);
	/* Post turn */
	battleLogs = battleLogs.concat(
		postTurn(battle.player.team, battle.enemy.team, [weapon, weapon, weapon])
	);
	battleLogs = battleLogs.concat(postTurn(battle.enemy.team, battle.player.team, eaction));
	/* Remove marked buffs */
	removeBuffs(battle.player.team, battle.enemy.team);

	/* Save only the HP and WP states (will need to save buff status later) */
	let state = saveStates(battle);
	if (battleLogs.length > 0) state.battleLogs = battleLogs;
	logs.push(state);

	/* recursive call */
	return calculateAll(p, battle, logs);
});

/* Displays all the battle results according to setting */
exports.displayAllBattles = async function (p, battle, logs, setting) {
	let endResult = logs[logs.length - 1];
	let logLink;
	if (setting.showLogs == 'link') {
		let uuid = await createLogUUID(logs.slice(0, -1), battle);
		if (uuid) logLink = `${process.env.SITE_URL}/battle-log?uuid=${uuid}`;
	}
	setting.logLink = logLink;
	/* Instant mode sends just one message */
	if (setting.speed == 'instant') {
		let battleLogs = [];
		for (let i = 0; i < logs.length; i++)
			if (logs[i].battleLogs) battleLogs.push(logs[i].battleLogs);
		if (setting.friendlyBattle)
			await finishFriendlyBattle(
				null,
				p,
				battle,
				endResult.color,
				endResult.text,
				endResult.player,
				endResult.enemy,
				battleLogs,
				setting
			).catch(console.error);
		else
			await finishBattle(
				null,
				p,
				battle,
				endResult.color,
				endResult.text,
				endResult.player,
				endResult.enemy,
				battleLogs,
				setting
			);
		return;
	}

	/* This should never happen. you probably dun goofed somewhere*/
	if (logs.length <= 1) return;

	/* we should distribute the rewards first */
	setting.noMsg = true;
	if (!setting.friendlyBattle)
		await finishBattle(
			null,
			p,
			battle,
			endResult.color,
			endResult.text,
			endResult.player,
			endResult.enemy,
			null,
			setting
		);
	setting.noMsg = false;
	setting.noReward = true;

	/* Lets see which battle step we should display */
	let logLength = logs.length - 1;
	let logTimeline = [];
	if (logLength <= 3) {
		for (let i = 0; i < logLength; i++) logTimeline.push(i);
	} else {
		let diff = (logLength + 1) / 2;
		/* beginning log */
		logTimeline.push(Math.round(diff) - 1);
		/* final log */
		logTimeline.push(logLength - 1);
	}

	/* short mode should send 4 msgs */
	/* send initial message */
	updateTeamStats(battle.player.team, 100);
	updateTeamStats(battle.enemy.team, 100);
	updatePreviousStats(battle);
	let embed = await display(p, battle, undefined, setting);
	embed.embed.footer = { text: 'Turn 0/' + (logs.length - 1) };
	embed.embed = await alterBattle.alter(p, p.msg.author, embed.embed, null, setting);
	let msg = await p.send(embed);

	/* Update the message for each log in log timeline */
	const gap = 2000;
	let i = 0;
	let msgEdit = async function () {
		let currentLog = logs[logTimeline[i]];
		let player = currentLog.player;
		let enemy = currentLog.enemy;
		updateTeamStats(battle.player.team, player);
		updateTeamStats(battle.enemy.team, enemy);
		if (i == logTimeline.length - 1) {
			if (setting.friendlyBattle) {
				await finishFriendlyBattle(
					msg,
					p,
					battle,
					endResult.color,
					endResult.text,
					endResult.player,
					endResult.enemy,
					null,
					setting
				).catch(console.error);
			} else {
				await finishBattle(
					msg,
					p,
					battle,
					endResult.color,
					endResult.text,
					endResult.player,
					endResult.enemy,
					null,
					setting
				).catch(console.error);
			}
		} else {
			let embed = await display(p, battle, undefined, setting);
			embed.embed.footer = {
				text: 'Turn ' + (logTimeline[i] + 1) + '/' + (logs.length - 1),
			};
			await msg.edit(embed);
			i++;
			setTimeout(msgEdit, gap);
		}
	};
	setTimeout(msgEdit, gap);
};

/* ==================================== Extra Helpers ====================================  */

/* Creates string to save in sql */
function initSqlSaveStats(team, offset = 0) {
	let hp = '';
	let wp = '';
	for (let i in team) {
		if (!team[i].stats) animalUtil.stats(team[i]);
		let hpN = Math.trunc(team[i].stats.hp[offset]);
		let wpN = Math.trunc(team[i].stats.wp[offset]);
		if (global.isInt(hpN)) hp += hpN + ',';
		else hp += '0,';
		if (global.isInt(wpN)) wp += wpN + ',';
		else wp += '0,';
	}
	return { hp: hp.slice(0, -1), wp: wp.slice(0, -1) };
}

/* creates string to save buffs in sql */
function initSqlSaveBuffs(team) {
	let result = [];
	let pgid = team.player.pgid;
	for (let i in team.player.team) {
		let animal = team.player.team[i];
		let pid = animal.pid;
		for (let j in animal.buffs) {
			let buff = animal.buffs[j];
			result.push(
				`(${pgid},${pid},${buff.id},${buff.duration},'${buff.sqlStat}',${buff.from.pid})`
			);
		}
	}
	for (let i in team.enemy.team) {
		let animal = team.enemy.team[i];
		let pid = animal.pid;
		for (let j in animal.buffs) {
			let buff = animal.buffs[j];
			result.push(
				`(${pgid},${pid},${buff.id},${buff.duration},'${buff.sqlStat}',${buff.from.pid})`
			);
		}
	}
	return result.length == 0
		? ''
		: `INSERT INTO pet_team_battle_buff (pgid,pid,bfid,duration,qualities,pfrom) VALUES ${result.join(
				','
		  )} ON DUPLICATE KEY UPDATE duration=VALUES(duration),qualities=VALUES(qualities);`;
}

/* Parses string from sql */
function parseSqlStats(team, hp, wp) {
	hp = hp.split(',');
	wp = wp.split(',');

	for (let i = 0; i < team.length; i++) {
		team[i].stats.hp[0] = parseInt(hp[i] ? hp[i] : 0);
		team[i].stats.hp[2] = parseInt(hp[i] ? hp[i] : 0);
		team[i].stats.wp[0] = parseInt(wp[i] ? wp[i] : 0);
		team[i].stats.wp[2] = parseInt(wp[i] ? wp[i] : 0);
	}
}

/* parse buffs */
function parseSqlBuffs(team, buffs, otherTeam) {
	for (let i in team) {
		let animal = team[i];
		for (let j in buffs) {
			if (buffs[j].pid == animal.pid) {
				let buff = allBuffs[buffs[j].bfid];
				if (buff) {
					let qualities = buffs[j].qualities.split(',').map((x) => parseInt(x));
					if (!buffs[j].qualities || buffs[j].qualities == '') qualities = [];
					let owner = null;
					for (let k in team) {
						if (team[k].pid == buffs[j].pfrom) owner = team[k];
					}
					for (let k in otherTeam) {
						if (otherTeam[k].pid == buffs[j].pfrom) owner = otherTeam[k];
					}
					if (owner) {
						buff = new buff(owner, qualities, buffs[j].duration);
						animal.buffs.push(buff);
					}
				}
			}
		}
	}
}

/* Do stuff before the turn starts (usually for buffs) */
function preTurn(team, enemy, action) {
	let logs = [];

	for (let i in team) {
		let animal = team[i];
		let check = WeaponInterface.canAttack(animal, team, enemy, action);
		animal.disabled = check;
		for (let j in animal.buffs) {
			let log = animal.buffs[j].preTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
		}
		for (let j in animal.debuffs) {
			let log = animal.debuffs[j].preTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
		}
		if (animal.weapon) {
			let log = animal.weapon.preTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
			for (let j in animal.weapon.passives) {
				let log2 = animal.weapon.passives[j].preTurn(animal, team, enemy, action[i]);
				if (log2) logs = logs.concat(log2.logs);
			}
		}
	}

	return logs;
}

/* Calculates a turn for a team */
function executeTurn(team, enemy, action) {
	let logs = [];
	let teamPos = 0;
	let enemyPos = 0;
	for (let i = 0; i < maxAnimals; i++) {
		let animal;
		let tempEnemy;
		let tempAlly;
		let tempAction;

		if (teamPos <= enemyPos) {
			animal = team[teamPos];
			tempEnemy = enemy;
			tempAlly = team;
			tempAction = action.ally[teamPos];
			teamPos++;
		} else {
			animal = enemy[enemyPos];
			tempEnemy = team;
			tempAlly = enemy;
			tempAction = action.enemy[enemyPos];
			enemyPos++;
		}

		let log;

		if (animal) {
			// Animal is not allowed to attack
			if (animal.disabled && !animal.disabled.canAttack) {
				if (animal.disabled.logs && animal.disabled.logs.logs.length > 0)
					logs = logs.concat(animal.disabled.logs.logs);

				// Animal has a weapon
			} else if (animal.weapon) {
				if (tempAction == weapon) log = animal.weapon.attackWeapon(animal, tempAlly, tempEnemy);
				else log = animal.weapon.attackPhysical(animal, tempAlly, tempEnemy);

				// Animal has no weapon
			} else {
				log = WeaponInterface.basicAttack(animal, tempAlly, tempEnemy);
			}
		}

		// Combine all the logs
		if (log) logs = logs.concat(log.logs);
	}

	return logs;
}

/* Do stuff after the turn ends (usually for buffs) */
function postTurn(team, enemy, action) {
	let logs = [];
	for (let i in team) {
		let animal = team[i];
		let j = animal.buffs.length;
		while (j--) {
			let log = animal.buffs[j].postTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
		}
		j = animal.debuffs.length;
		while (j--) {
			let log = animal.debuffs[j].postTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
		}
		if (animal.weapon) {
			let log = animal.weapon.postTurn(animal, team, enemy, action[i]);
			if (log) logs = logs.concat(log.logs);
			for (let j in animal.weapon.passives) {
				let log2 = animal.weapon.passives[j].postTurn(animal, team, enemy, action[i]);
				if (log2) logs = logs.concat(log2.logs);
			}
		}
	}

	return logs;
}

/* strip buffs after turn fully processed */
function removeBuffs(team, enemy) {
	for (let i in team) {
		let animal = team[i];
		let j = animal.buffs.length;
		while (j--) {
			if (animal.buffs[j].markedForDeath) {
				animal.buffs.splice(j, 1);
			}
		}
		j = animal.debuffs.length;
		while (j--) {
			if (animal.debuffs[j].markedForDeath) {
				animal.debuffs.splice(j, 1);
			}
		}
	}
	for (let i in enemy) {
		let animal = enemy[i];
		let j = animal.buffs.length;
		while (j--) {
			if (animal.buffs[j].markedForDeath) {
				animal.buffs.splice(j, 1);
			}
		}
		j = animal.debuffs.length;
		while (j--) {
			if (animal.debuffs[j].markedForDeath) {
				animal.debuffs.splice(j, 1);
			}
		}
	}
}

/* finish battle */
async function finishBattle(msg, p, battle, color, text, playerWin, enemyWin, logs, setting) {
	/* Check if the battle is still active and if the player should receive rewards */
	let sql = '';
	if (!battle)
		sql = `UPDATE pet_team_battle SET active = 0 WHERE active = 1 and pgid = (${teamFilter(
			p.msg.author.id
		)});`;
	else if (!setting.instant)
		sql = `UPDATE pet_team_battle SET active = 0 WHERE active = 1 and pgid = ${battle.player.pgid};`;
	sql += `SELECT * FROM user INNER JOIN crate ON user.uid = crate.uid WHERE id = ${p.msg.author.id};`;
	sql += `DELETE FROM pet_team_battle_buff WHERE pgid = (${teamFilter(p.msg.author.id)});`;
	let result = await p.query(sql);
	if ((!setting || !setting.instant) && result[0].changedRows == 0) return;

	let crate = undefined;
	/* Calculate and distribute xp */
	let pXP, eXP;
	if (battle && (!setting || !setting.noReward || !setting.noMsg)) {
		pXP = calculateXP(
			{ team: battle.player, win: playerWin },
			{ team: battle.enemy, win: enemyWin },
			battle.player.streak
		);
		eXP = calculateXP(
			{ team: battle.enemy, win: enemyWin },
			{ team: battle.player, win: playerWin }
		);
	}

	/* Don't distribute reward if it says not to */
	if (!setting || !setting.noReward) {
		/* Decide if user receives a crate */
		let crateQuery = setting && setting.instant ? result[0][0] : result[1][0];
		crate = dateUtil.afterMidnight(crateQuery ? crateQuery.claim : undefined);
		if (!crateQuery || crateQuery.claimcount < 3 || crate.after) {
			crate = crateUtil.crateFromBattle(p, crateQuery, crate);
			if (crate.sql) await p.query(crate.sql);
		}

		/* battle quests */
		p.quest('battle');

		/* An error occured */
		if (!playerWin && !enemyWin) return;

		await teamUtil.giveXP(p, battle.player, pXP);
		/* xp quest */
		p.quest('xp', pXP.total);

		await teamUtil.giveXP(p, battle.enemy, eXP.xp);
	}

	const opt = { turns: logs ? logs.length : 0, user: p.msg.author };
	if (!setting || !setting.noMsg) {
		/* Send result message */
		let embed = await display(p, battle, logs, setting);
		embed.embed.color = color;
		text += ` Your team gained ${pXP.xp} xp`;
		if (pXP) {
			opt.xp = pXP.xp;
			if (shouldStopStreak()) {
				if (pXP.bonus) {
					text += ` + ${pXP.bonus} bonus xp`;
				}
				const timeUntil = p.global.getTimeUntil(stopStreak.end);
				let timeUntilString = `${timeUntil.minutes}M`;
				if (timeUntil.hours) {
					timeUntilString = `${timeUntil.hours}H${timeUntilString}`;
				}
				if (timeUntil.days) {
					timeUntilString = `${timeUntil.days}D${timeUntilString}`;
				}
				text += `! Streaks are currently frozen until ${timeUntilString}`;
				opt.streak = battle.player.streak;
			} else if (pXP.resetStreak) {
				text += `! You lost your streak of ${battle.player.streak} wins...`;
				opt.streak = battle.player.streak;
			} else if (pXP.addStreak) {
				if (pXP.bonus) {
					text += ` + ${pXP.bonus} bonus xp! Streak: ${battle.player.streak + 1}`;
					opt.xp += ` + ${pXP.bonus}`;
				} else text += `! Streak: ${battle.player.streak + 1}`;
				opt.streak = battle.player.streak + 1;
			} else {
				text += `! Streak: ${battle.player.streak}`;
				opt.streak = battle.player.streak;
			}
		} else text += '!';
		embed.embed.footer = { text };
		embed.embed = await alterBattle.alter(p, p.msg.author, embed.embed, opt, setting);
		if (msg) await msg.edit(embed);
		else await p.send(embed);
	}

	/* send message for crate reward */
	if (crate && crate.text) await p.send(crate.text);
	p.event.getEventItem.bind(p)();
}

/* finish friendly battle */
async function finishFriendlyBattle(
	msg,
	p,
	battle,
	color,
	text,
	playerWin,
	enemyWin,
	logs,
	setting
) {
	/* Send result message */
	let embed = await display(p, battle, logs, setting);
	embed.embed.color = color;
	embed.embed.footer = { text };
	embed.embed = await alterBattle.alter(p, p.msg.author, embed.embed, null, setting);
	if (msg) await msg.edit(embed);
	else await p.send(embed);
}

/* Calculate xp depending on win/loss/tie */
function calculateXP(team, enemy, currentStreak = 0) {
	/* Find the avg level diff for xp multipliers */
	let playeravg = 0;
	for (let i in team.team.team) playeravg += team.team.team[i].stats.lvl;
	playeravg /= team.team.team.length;

	let enemyavg = 0;
	for (let i in enemy.team.team) enemyavg += enemy.team.team[i].stats.lvl;
	enemyavg /= enemy.team.team.length;

	let lvlDiff = enemyavg - playeravg;
	if (lvlDiff < 0) lvlDiff = 0;

	/* Calculate xp and streak */
	/* lose */
	let xp = 50;
	let resetStreak = true;
	let addStreak = false;
	let bonus = 0;
	/* tie */
	if (team.win && enemy.win) {
		resetStreak = false;
		addStreak = false;
		xp = 100;
		/* win */
	} else if (team.win) {
		resetStreak = false;
		addStreak = true;
		xp = 200;
		bonus = Math.round(600 * lvlDiff);
		/* Calculate bonus */
		currentStreak++;
		bonus += bonusXP(currentStreak);
	}

	if (shouldStopStreak()) {
		addStreak = false;
		resetStreak = false;
	}

	return { total: xp + bonus, bonus, xp, resetStreak, addStreak };
}

/* Bonus xp depending on the streak */
function bonusXP(streak) {
	if (shouldStopStreak()) {
		return 100;
	}
	let bonus = 0;
	if (streak % 1000 === 0) bonus = 25 * (Math.sqrt(streak / 100) * 100 + 500);
	else if (streak % 500 === 0) bonus = 10 * (Math.sqrt(streak / 100) * 100 + 500);
	else if (streak % 100 === 0) bonus = 5 * (Math.sqrt(streak / 100) * 100 + 500);
	else if (streak % 50 === 0) bonus = 3 * (Math.sqrt(streak / 100) * 100 + 500);
	else if (streak % 10 === 0) bonus = Math.sqrt(streak / 100) * 100 + 500;
	else bonus = 0;
	bonus = Math.round(bonus);
	if (bonus > 100000) bonus = 100000;
	return bonus;
}

/* Test bonus xp */
/*
let totalxp = 0;
let pxp = 0;
for(let i = 35000;i<=40000;i+=10){
	pxp += 10*200;
	let currentxp = bonusXP(i);
	totalxp += currentxp;
	console.log(`[${i}] ${currentxp} | ${totalxp} | ${pxp}`);
}
*/

/* Returns if the player is in battle or not */
exports.inBattle = async function (p) {
	let sql = `SELECT pgid FROM pet_team_battle WHERE pgid = (${teamFilter(
		p.msg.author.id
	)}) AND active = 1;`;
	return (await p.query(sql))[0];
};

/* converts animal info to readable string */
function animalDisplayText(animal) {
	let text = '';
	text += '\nLvl.' + animal.stats.lvl + ' ' + animal.animal.value + ' ';
	text += animal.nickname ? animal.nickname : animal.animal.name;
	if (animal.buffs.length > 0) {
		text += ' ';
		for (let i in animal.buffs) text += animal.buffs[i].emoji;
	}
	text += '\n`' + animalUtil.bar(animal.stats) + '`\n';
	let hp = Math.ceil(animal.stats.hp[0]);
	if (hp < 0) hp = 0;
	let wp = Math.ceil(animal.stats.wp[0]);
	if (wp < 0) wp = 0;
	let att = Math.ceil(animal.stats.att[0] + animal.stats.att[1]);
	let mag = Math.ceil(animal.stats.mag[0] + animal.stats.mag[1]);
	let pr = WeaponInterface.resToPrettyPercent(animal.stats.pr);
	let mr = WeaponInterface.resToPrettyPercent(animal.stats.mr);
	text += `\`${hp} HP\` <:att:531616155450998794> \`${att}\` <:pr:531616156222488606> \`${pr}\`\n`;
	text += `\`${wp} WP\` <:mag:531616156231139338> \`${mag}\` <:mr:531616156226945024> \`${mr}\``;
	if (animal.weapon) {
		text += '\n' + animal.weapon.rank.emoji + animal.weapon.emoji;
		let passives = animal.weapon.passives;
		for (let j in passives) {
			text += passives[j].emoji;
		}
		text += ' ' + animal.weapon.avgQuality + '%';
	}
	return text;
}

/* converts animal info to readable string */
function animalCompactDisplayText(animal) {
	let text = '';
	text += 'L.' + animal.stats.lvl + ' ' + animal.animal.value + ' ';
	text += animal.nickname ? animal.nickname : animal.animal.name;
	if (animal.buffs.length > 0) {
		text += ' ';
		for (let i in animal.buffs) text += animal.buffs[i].emoji;
	}
	let hp = Math.ceil(animal.stats.hp[0]);
	if (hp < 0) hp = 0;
	let wp = Math.ceil(animal.stats.wp[0]);
	if (wp < 0) wp = 0;
	text += `\n\`${hp} HP\` `;
	text += `\`${wp} WP\` `;
	if (animal.weapon) {
		text += ' ' + animal.weapon.rank.emoji + animal.weapon.emoji;
		let passives = animal.weapon.passives;
		for (let j in passives) {
			text += passives[j].emoji;
		}
	}
	return text;
}

/* Update's pet team's stats */
function updateTeamStats(team, stats) {
	let percent = undefined;
	if (Number.isFinite(stats)) percent = stats / 100;
	for (let i = 0; i < team.length; i++) {
		if (percent) {
			team[i].stats.hp[0] = (team[i].stats.hp[1] + team[i].stats.hp[3]) * percent;
			team[i].stats.wp[0] = (team[i].stats.wp[1] + team[i].stats.wp[3]) * percent;
			team[i].buffs = [];
		} else {
			team[i].stats.hp = stats[i].hp;
			team[i].stats.wp = stats[i].wp;
			team[i].buffs = stats[i].buffs;
		}
	}
}

/* Saves both team's status */
function saveStates(battle) {
	let player = [];
	for (let i in battle.player.team) {
		let info = parseAnimalInfo(battle.player.team[i]);
		let result = {
			info,
			hp: battle.player.team[i].stats.hp.slice(),
			wp: battle.player.team[i].stats.wp.slice(),
			buffs: [],
		};
		for (let j in battle.player.team[i].buffs) {
			result.buffs.push({ emoji: battle.player.team[i].buffs[j].emoji });
		}
		player.push(result);
	}
	let enemy = [];
	for (let i in battle.enemy.team) {
		let info = parseAnimalInfo(battle.enemy.team[i]);
		let result = {
			info,
			hp: battle.enemy.team[i].stats.hp.slice(),
			wp: battle.enemy.team[i].stats.wp.slice(),
			buffs: [],
		};
		for (let j in battle.enemy.team[i].buffs) {
			result.buffs.push({ emoji: battle.enemy.team[i].buffs[j].emoji });
		}
		enemy.push(result);
	}
	return { player, enemy };
}

/* parses animal info for logs */
function parseAnimalInfo(animal) {
	let info = animal;
	return info;
}

/* Updates the previous hp/wp */
function updatePreviousStats(battle) {
	for (let i in battle.player.team) {
		battle.player.team[i].stats.hp[2] = battle.player.team[i].stats.hp[0];
		battle.player.team[i].stats.wp[2] = battle.player.team[i].stats.wp[0];
	}
	for (let i in battle.enemy.team) {
		battle.enemy.team[i].stats.hp[2] = battle.enemy.team[i].stats.hp[0];
		battle.enemy.team[i].stats.wp[2] = battle.enemy.team[i].stats.wp[0];
	}
}

/* parses logs into string */
function parseLogs(logs) {
	let text = '```ini\n';
	let over = false;
	for (let i in logs) {
		for (let j in logs[i]) {
			if (text.length < 1950) {
				text += logs[i][j] + '\n';
			} else if (!over) {
				text += '\n; Log is too long...';
				over = true;
			}
		}
		text += '\n';
	}
	text += '```';
	return text;
}

/* Creates a uuid for battle logs website */
async function createLogUUID(logs, battle) {
	let info = { battle, logs, password: process.env.GEN_PASS };
	try {
		return new Promise((resolve, _reject) => {
			request(
				{
					method: 'POST',
					uri: `${process.env.GEN_API_HOST}/savelog`,
					json: true,
					body: info,
				},
				(error, res, body) => {
					if (error) {
						resolve('');
						return;
					}
					if (res.statusCode == 200) resolve(body);
					else resolve('');
				}
			);
		});
	} catch (err) {
		return;
	}
}

function shouldStopStreak() {
	const now = Date.now();
	if (!stopStreak || !stopStreak.start || !stopStreak.end) {
		return;
	}
	return stopStreak.start < now && now < stopStreak.end;
}
