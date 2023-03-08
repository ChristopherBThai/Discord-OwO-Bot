/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const battleUtil = require('./util/battleUtil.js');
const battleFriendUtil = require('./util/battleFriendUtil.js');
const battleEmoji = '⚔';

module.exports = new CommandInterface({
	alias: ['battle', 'b', 'fight'],

	args: '',

	desc: '',

	example: [''],

	related: ['owo zoo', 'owo pet', 'owo team', 'owo weapon'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 15000,
	half: 80,
	six: 500,
	bot: true,

	execute: async function (p) {
		/* If its a friendly battle... */
		if (p.global.isUser(p.args[0])) {
			let id = p.args[0].match(/[0-9]+/)[0];
			let opponent = p.msg.mentions[0];
			if (!opponent) {
				p.errorMsg(', That is not a valid id!');
				return;
			}
			let bet = 0;
			/* Bets are removed
			if(p.global.isInt(p.args[1])) bet = parseInt(p.args[1]);
			if(bet>1000000) bet = 1000000;
			*/
			if (!id) {
				await p.errorMsg(', The correct command is `owo battle @user`!', 3000);
			} else if (id == p.msg.author.id) {
				battleFriendUtil.challenge(p, p.msg.author);
			} else {
				battleFriendUtil.challenge(p, opponent, bet);
			}
			return;
		} else if (p.options.user) {
			if (p.options.user.id == p.msg.author.id) {
				battleFriendUtil.challenge(p, p.msg.author);
			} else {
				battleFriendUtil.challenge(p, p.options.user);
			}
			return;
		}

		/* Grab user settings for battle */
		let setting = await parseSettings(p);

		/* Get battle info */
		let battle = await battleUtil.getBattle(p, setting);
		if (!battle) {
			battle = await battleUtil.initBattle(p, setting);
		}

		/* If no team */
		if (!battle) return;

		/* whether it should  calculate the whole battle or step by step */
		/* Instant */
		if (setting.instant) {
			let logs = await battleUtil.calculateAll(p, battle);
			await battleUtil.displayAllBattles(p, battle, logs, setting);

			/* turn by turn */
		} else {
			/* Display the first message */
			let embed = await battleUtil.display(p, battle, undefined, setting);
			let msg = await p.send(embed);
			await battleUtil.reactionCollector(
				p,
				msg,
				battle,
				setting.auto,
				setting.auto ? 'www' : undefined,
				setting
			);
		}
	},
});

/* Change the display type */
/* eslint-disable-next-line */
async function changeType(p, type) {
	let sql = '';
	let text = '';
	if (type == 'text') {
		sql = `INSERT INTO battle_type (uid,type) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),1) ON DUPLICATE KEY UPDATE type = 1`;
		text = ', your battles will now display as **text**!';
	} else {
		sql = `INSERT INTO battle_type (uid,type) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),0) ON DUPLICATE KEY UPDATE type = 0`;
		text = ', your battles will now display as an **image**!';
	}
	try {
		await p.query(sql);
	} catch (error) {
		await p.query(`INSERT IGNORE INTO user (id,count) VALUES (${p.msg.author.id},0);+sql`);
	}
	p.replyMsg(battleEmoji, text);
}

async function parseSettings(p) {
	let sql = `SELECT logs,auto,display,speed from user INNER JOIN battle_settings ON user.uid = battle_settings.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	return parseSetting(result);
}

function parseSetting(query) {
	let auto = true;
	let display = 'image';
	let speed = 'short';
	let showLogs = false;
	let instant = false;

	if (query[0]) {
		//if(query[0].auto==1)
		//auto = false;
		if (query[0].speed == 0) speed = 'instant';
		else if (query[0].speed == 2) speed = 'lengthy';
		if (query[0].display == 'text') display = 'text';
		else if (query[0].display == 'compact') display = 'compact';
		if (query[0].logs == 1) {
			showLogs = true;
			auto = true;
			speed = 'instant';
		} else if (query[0].logs == 2) {
			showLogs = 'link';
			auto = true;
			speed = 'instant';
		}
	}

	if (auto && (speed == 'short' || speed == 'instant')) {
		instant = true;
	}

	return { auto, display, speed, instant, showLogs };
}
