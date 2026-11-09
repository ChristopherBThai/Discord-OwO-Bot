/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const request = require('request');
const alterBattle = require('../../patreon/alterBattle.js');
const battleImageUtil = require('../battleImage.js');
const battleUtil = require('./battleUtil.js');
const animalUtil = require('./animalUtil.js');
const WeaponInterface = require('../WeaponInterface.js');

/* Displays all the battle results according to setting */
exports.displayAllBattles = async function (battleEvent) {
	/* Battle setting is instant, just display the final result */
	if (await isInstant(battleEvent)) {
		return;
	}

	/* This should never happen. you probably dun goofed somewhere*/
	if (battleEvent.logs.length <= 1) return;

	if (await isShort(battleEvent)) {
		return;
	}

	if (await isLengthy(battleEvent)) {
		return;
	}

	battleEvent.p.errorMsg(', there was an error showing you the battle...', 3000);
};

exports.getLogLink = async function (battleEvent) {
	if (battleEvent.setting.showLogs == 'link') {
		let uuid = await createLogUUID(battleEvent);
		if (uuid) {
			return `${process.env.SITE_URL}/battle-log?uuid=${uuid}`;
		}
	}
};

async function isInstant(battleEvent) {
	/* Instant mode sends just one message */
	if (!battleEvent.isInstant) {
		return false;
	}

	await getDisplay(null, battleEvent, battleEvent.getLength());
	return true;
}

async function isShort(battleEvent) {
	if (!battleEvent.isShort) {
		return false;
	}

	// Decide which turns to display
	const length = battleEvent.getLength();
	let turns = [];
	if (length <= 2) {
		for (let i = 0; i <= length; i++) turns.push(i);
	} else {
		turns = [0, Math.floor(length / 2), length];
	}

	let msg;
	for (let i = 0; i < turns.length; i++) {
		const turn = turns[i];
		msg = await getDisplay(msg, battleEvent, turn);
		await battleEvent.p.global.delay(2000);
	}
	return true;
}

async function isLengthy(battleEvent) {
	if (!battleEvent.isLengthy) {
		return false;
	}

	const createEmbed = function (page) {
		return getDisplay(null, battleEvent, page, true);
	};
	new battleEvent.p.PagedMessage(battleEvent.p, createEmbed, battleEvent.getLength(), {
		idle: 120000,
	});
	return true;
}

const getDisplay = (exports.getDisplay = async function (msg, battleEvent, turn, dontSend = false) {
	let newMsg;
	if (turn === battleEvent.getLength()) {
		// Last turn
		const currentLog = battleEvent.logs[turn - 1];
		updateTeamStats(battleEvent.player.team, currentLog.player);
		updateTeamStats(battleEvent.enemy.team, currentLog.enemy);
		newMsg = await getLastDisplay(battleEvent);
	} else if (turn === 0) {
		// First turn
		updateTeamStats(battleEvent.player.team, 100);
		updateTeamStats(battleEvent.enemy.team, 100);
		battleUtil.updatePreviousStats(battleEvent);
		let embed = await getTurnDisplay(battleEvent, turn);
		embed.embed.footer = { text: 'Turn 1/' + (battleEvent.getLength() + 1) };
		embed.embed = await alterBattle.alter(
			battleEvent.p,
			battleEvent.p.msg.author,
			embed.embed,
			battleEvent
		);
		newMsg = embed;
	} else {
		// In the middle
		const currentLog = battleEvent.logs[turn - 1];
		updateTeamStats(battleEvent.player.team, currentLog.player);
		updateTeamStats(battleEvent.enemy.team, currentLog.enemy);
		let embed = await getTurnDisplay(battleEvent, turn);
		embed.embed.footer = {
			text: 'Turn ' + (turn + 1) + '/' + (battleEvent.getLength() + 1),
		};
		newMsg = embed;
	}

	if (dontSend) {
		return newMsg;
	} else if (msg) {
		return msg.edit(newMsg);
	} else {
		return battleEvent.p.send(newMsg);
	}
});

/* finish battle */
async function getLastDisplay(battleEvent) {
	const { p, endResult, player } = battleEvent;
	const { color, pXP } = endResult;
	let { text } = endResult;
	/* Send result message */
	let embed = await getTurnDisplay(battleEvent, battleEvent.getLength());
	embed.embed.color = color;
	if (!battleEvent.friendly && pXP) {
		text += ` Your team gained ${pXP.xp} xp`;
		if (battleUtil.shouldStopStreak()) {
			if (pXP.bonus) {
				text += ` + ${pXP.bonus} bonus xp`;
			}
			const timeUntil = p.global.getTimeUntil(battleUtil.getStopStreak().end);
			let timeUntilString = `${timeUntil.minutes}M`;
			if (timeUntil.hours) {
				timeUntilString = `${timeUntil.hours}H${timeUntilString}`;
			}
			if (timeUntil.days) {
				timeUntilString = `${timeUntil.days}D${timeUntilString}`;
			}
			text += `! Streaks are currently frozen until ${timeUntilString}`;
		} else if (pXP.resetStreak) {
			text += `! You lost your streak of ${player.streak} wins...`;
		} else if (pXP.addStreak) {
			if (pXP.bonus) {
				text += ` + ${pXP.bonus} bonus xp! Streak: ${player.streak + 1}`;
			} else text += `! Streak: ${player.streak + 1}`;
		} else {
			text += `! Streak: ${player.streak}`;
		}
	}
	embed.embed.footer = { text };
	embed.embed = await alterBattle.alter(p, p.msg.author, embed.embed, battleEvent);
	if (battleEvent.friendly) {
		embed.embed.footer = { text };
	}
	return embed;
}

/* Generates a display for the current battle (image mode)*/
async function getTurnDisplay(battleEvent, turn, title) {
	const { p, logLink, logs } = battleEvent;
	const { showLogs } = battleEvent.setting;
	let { display } = battleEvent.setting;
	const team = {
		player: battleEvent.player,
		enemy: battleEvent.enemy,
	};

	display = alterBattle.overrideDisplay(p, display);
	if (display == 'text') return displayText(p, team, logs, { title, showLogs, logLink });
	else if (display == 'compact') return displayCompact(p, team, logs, { title, showLogs, logLink });

	let image = battleEvent.images[turn];
	if (!image) {
		image = await battleImageUtil.generateImage(team);
		battleEvent.images[turn] = image;
	}
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
			name: title ? title : p.getName() + ' goes into battle!',
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
}

/* displays the battle as text */
async function displayText(p, team, logs, { title, showLogs, logLink }) {
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
			name: title ? title : p.getName() + ' goes into battle!',
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
}

/* displays the battle as compact mode*/
async function displayCompact(p, team, logs, { title, showLogs, logLink }) {
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
			name: title ? title : p.getName() + ' goes into battle!',
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

/* Creates a uuid for battle logs website */
async function createLogUUID(battleEvent) {
	let info = {
		battle: {
			player: battleEvent.player,
			enemy: battleEvent.enemy,
		},
		logs: battleEvent.logs,
		password: process.env.GEN_PASS,
	};
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
