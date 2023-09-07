/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const BattleEvent = require('./util/BattleEvent.js');

module.exports = new CommandInterface({
	alias: ['ab', 'acceptbattle'],

	args: '[bet]',

	desc: 'Accept a battle request! If a bet was added, you will have to add the amount to accept it in addition to the battle.',

	example: [''],

	related: ['owo battle'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: async function (p) {
		const author = p.opt?.member || p.opt?.author || p.msg.member || p.msg.author;
		const uid = await p.global.getUid(author.id);
		let sql = `SELECT (SELECT id FROM user WHERE uid = sender) AS sender,bet,flags,channel
			FROM user_battle
			WHERE
				TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
					user1 = ${uid} OR
					user2 = ${uid}
				) AND (
					sender != ${uid} OR
					user1 = user2
				);`;
		sql += `UPDATE user_battle 
			SET time = '2018-01-01' WHERE
			TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
				user1 = ${uid} OR
				user2 = ${uid}
			);`;
		let result = await p.query(sql);

		if (!result[0][0] || result[1].changedRows == 0) {
			p.errorturnMsg(', You do not have any pending battles!', 3000);
			return;
		}

		if (result[0][0].channel != p.msg.channel.id) {
			p.errorMsg(', You can only accept battle requests from the same channel!', 3000);
			return;
		}

		/* Parse flags */
		let flags = result[0][0].flags.split(',');
		flags = parseFlags(flags);

		/* Get opponent name */
		let sender = result[0][0].sender;
		sender = await p.fetch.getMember(p.msg.channel.guild.id, sender);
		if (!sender) {
			p.errorMsg(', I could not find your opponent!', 3000);
			return;
		}

		const settingOverride = {
			friendlyBattle: true,
			display: flags.display ? flags.display : 'image',
			speed: flags.log ? 'instant' : 'short',
			instant: flags.log ? true : false,
			title: this.getName(author) + ' vs ' + this.getName(sender),
			showLogs: flags.link ? 'link' : flags.log ? true : false,
		};

		const battleEvent = new BattleEvent(this, true);
		await battleEvent.init({
			setting: settingOverride,
			player: sender,
			enemy: author,
			levelOverride: flags.level,
		});
		battleEvent.simulateBattle();

		let user1 = author.id;
		let user2 = sender.id;
		if (author.id > sender.id) {
			user1 = sender.id;
			user2 = author.id;
		}
		let winColumn = 'tie';
		if (battleEvent.endResult.playerWin && !battleEvent.endResult.enemyWin) {
			if (user1 == author.id) winColumn = 'win1';
			else winColumn = 'win2';
		} else if (battleEvent.endResult.enemyWin && !battleEvent.endResult.playerWin) {
			if (user1 == sender.id) winColumn = 'win1';
			else winColumn = 'win2';
		}

		/* distribute the winning cowoncy */
		let winSql = `UPDATE user_battle SET ${winColumn} = ${winColumn} + 1 WHERE user1 = (SELECT uid FROM user WHERE id = ${user1}) AND user2 = (SELECT uid FROM user WHERE id = ${user2});`;
		await p.query(winSql);

		if (sender && sender.id != author.id) {
			p.quest('friendlyBattle', 1, author);
			p.quest('friendlyBattleBy', 1, sender);
		}

		await battleEvent.displayBattles();
	},
});

function parseFlags(flags) {
	let result = {};
	for (let i in flags) {
		let flag = flags[i];
		if (flag == 'link') {
			result.link = true;
			result.log = true; // lazy force instant
		} else if (flag == 'log') {
			result.log = true;
		} else if (flag == 'compact' || flag == 'image' || flag == 'text') {
			result.display = flag;
		} else if (/^l[0-9]+$/.test(flag)) {
			result.level = parseInt(flag.substring(1));
		}
	}
	return result;
}
