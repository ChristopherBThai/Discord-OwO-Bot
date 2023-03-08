/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['vote'],

	args: '',

	desc: 'Vote on Discord Bot List to gain daily cowoncy!',

	example: [],

	related: ['owo daily', 'owo money'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['utility'],

	cooldown: 5000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let id = p.msg.author.id;
		const voted = await p.dbl.hasVoted('' + p.msg.author.id);
		if (!voted) {
			let text = '**☑ | Your daily vote is available!**\n';
			text += '**<:blank:427371936482328596> |** You can vote every 12 hours!\n';
			//text += "**⚠ |** Automatic votes are currently broken!\n";
			//text += "**<:blank:427371936482328596> |** Please retype `owo vote` 1-10min after you vote!\n";
			text += '**<:blank:427371936482328596> |** https://top.gg/bot/408785106942164992/vote';
			p.send(text);
			return;
		}
		let weekend = await p.dbl.isWeekend();
		let patreon = await hasPatreon.bind(this)();

		let sql = `SELECT count,TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = ${id};`;
		let result = await this.query(sql);

		if (result[0] == undefined) {
			let box = getRandomBox.bind(this)();
			let reward = 100;
			let patreonBonus = patreon ? reward : 0;
			let weekendBonus = weekend ? reward : 0;

			sql =
				`INSERT IGNORE INTO vote (id,date,count) VALUES (${id}, NOW(), 1);` +
				`UPDATE IGNORE cowoncy SET money = money + ${
					reward + patreonBonus + weekendBonus
				} WHERE id = ${id};` +
				box.sql;
			await this.query(sql);

			let text =
				'**☑ |** You have received **' +
				reward +
				'** cowoncy for voting!' +
				patreonMsg(patreonBonus) +
				'\n';
			if (weekend)
				text +=
					"**⛱ |** It's the weekend! You also earned a bonus of **" +
					weekendBonus +
					'** cowoncy!\n';
			text += box.text;
			text += '**<:blank:427371936482328596> |** https://top.gg/bot/408785106942164992/vote';
			p.send(text);

			p.logger.incr('votecount', 1, {}, p.msg);
			p.logger.incr('cowoncy', reward + patreonBonus + weekendBonus, { type: 'vote' }, p.msg);
		} else if (result[0].time >= 12) {
			let box = getRandomBox.bind(this)();
			let bonus = 100 + result[0].count * 3;
			let patreonBonus = 0;
			let weekendBonus = weekend ? bonus : 0;
			if (patreon) patreonBonus = bonus;

			sql =
				`UPDATE vote SET date = NOW(),count = count+1 WHERE id = ${id};` +
				`UPDATE IGNORE cowoncy SET money = money + ${
					bonus + patreonBonus + weekendBonus
				} WHERE id = ${id};` +
				box.sql;
			await this.query(sql);

			let text =
				'**☑ |** You have received **' +
				bonus +
				'** cowoncy for voting!' +
				patreonMsg(patreonBonus) +
				'\n';
			if (weekend)
				text +=
					"**⛱ |** It's the weekend! You also earned a bonus of **" +
					weekendBonus +
					'** cowoncy!\n';
			text += box.text;
			text += '**<:blank:427371936482328596> |** https://top.gg/bot/408785106942164992/vote';
			p.send(text);

			p.logger.incr('votecount', 1, {}, p.msg);
			p.logger.incr('cowoncy', bonus + patreonBonus + weekendBonus, { type: 'vote' }, p.msg);
		} else {
			let text = '**☑ |** Click the link to vote and gain 100+ cowoncy!\n';
			text += '**<:blank:427371936482328596> |** You can vote every 12 hours!\n';
			text +=
				'**<:blank:427371936482328596> |** Your daily vote is available in **' +
				(12 - result[0].time) +
				' H**\n';
			text += '**<:blank:427371936482328596> |** https://top.gg/bot/408785106942164992/vote';
			p.send(text);
		}
	},
});

function patreonMsg(amount) {
	if (!amount || amount == 0) return '';
	return (
		'\n**<:blank:427371936482328596> |** And **' +
		amount +
		'** cowoncy for being a <:patreon:449705754522419222> Patreon!'
	);
}

async function hasPatreon() {
	let sql = `SELECT IF(
				patreonDaily = 1
				OR ((TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths) AND patreons.patreonType = 3)
				OR (endDate > NOW() AND patreon_wh.patreonType = 3)
			,1,0) as patreon
			FROM user
				LEFT JOIN patreons ON user.uid = patreons.uid
				LEFT JOIN patreon_wh ON user.uid = patreon_wh.uid
			WHERE user.id = ${this.msg.author.id};`;
	let result = this.query(sql);

	return result[0] && result[0].patreon == 1;
}

function getRandomBox() {
	let box = {};
	if (Math.random() < 0.5) {
		box.sql =
			'INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES (' +
			this.msg.author.id +
			",1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
		box.text = '**<:box:427352600476647425> |** You received a lootbox!\n';
	} else {
		box.sql =
			'INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = ' +
			this.msg.author.id +
			"),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;";
		box.text = '**<:crate:523771259302182922> |** You received a weapon crate!\n';
	}
	return box;
}
