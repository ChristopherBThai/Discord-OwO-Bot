/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const patreonUtil = require('../../../utils/patreon.js');

module.exports = new CommandInterface({
	alias: ['patreon', 'donate'],

	args: '',

	desc: 'Donate to OwO Bot to help support its growth! Any donations will come with special benefits!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['utility'],

	cooldown: 10000,
	half: 80,
	six: 500,

	execute: async function (p) {
		patreonUtil.checkPatreon(p, p.msg.author.id);

		let animalPerk, dailyPerk;
		let sql = `SELECT patreonDaily, patreonAnimal FROM user WHERE id = ${p.msg.author.id};`;
		sql += `SELECT
				patreonMonths,
				patreonTimer,
				TIMESTAMPDIFF(MONTH, patreonTimer, NOW()) AS monthsPassed,
				patreonType
			FROM user INNER JOIN patreons ON user.uid = patreons.uid
			WHERE id = ${p.msg.author.id};`;
		sql += `SELECT patreonType, endDate FROM patreon_wh INNER JOIN user ON user.uid = patreon_wh.uid WHERE id = ${p.msg.author.id};`;
		let result = await p.query(sql);

		if (result[0][0]) {
			animalPerk = result[0][0].patreonAnimal;
			dailyPerk = result[0][0].patreonDaily;
		}

		let stat = 'Join today for special animals and benefits!';
		if (animalPerk && !dailyPerk) stat = 'You are currently a **Patreon**!';
		else if (dailyPerk) stat = 'You are currently a **Patreon+**!';
		else if (result[1][0]) {
			let parsed = patreonUtil.parsePatreon(result[1][0]);
			if (parsed) {
				if (parsed.animal && !parsed.cowoncy) stat = 'You are currently a **Patreon**';
				else stat = 'You are currently a **Patreon+**';
				const timestamp = this.global.toDiscordTimestamp(parsed.expireDate, 'f');
				stat += '\n**<:blank:427371936482328596> |** until: **' + timestamp + '**';
			}
		} else if (result[2][0]) {
			let parsed = patreonUtil.parseSecondPatreon(result[2][0]);
			if (parsed) {
				if (parsed.animal && !parsed.cowoncy) stat = 'You are currently a **Patreon**';
				else stat = 'You are currently a **Patreon+**';
				const timestamp = this.global.toDiscordTimestamp(parsed.expireDate, 'f');
				stat += '\n**<:blank:427371936482328596> |** until: **' + timestamp + '**';
			}
		}

		let text = '**<:patreon:449705754522419222> |** Donate to OwO Bot for special benefits!\n';
		text += '**<:blank:427371936482328596> |** ' + stat + '\n';
		text += '**<:blank:427371936482328596> |** https://www.patreon.com/OwOBot';
		p.send(text);
	},
});
