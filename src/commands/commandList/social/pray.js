/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const prayLines = [
	'May luck be in your favor.',
	'You feel lucky!',
	'You feel very lucky!',
	'You can feel the luck within you!',
	'Fortune favors you!',
	'Luck is on your side!',
];
const curseLines = [
	'You feel unlucky...',
	'You feel very unlucky.',
	'Oh no.',
	'You should be careful...',
	"I've got a bad feeling about this...",
	'oh boy.',
	'rip',
];
const alterPray = require('../patreon/alterPray.js');

module.exports = new CommandInterface({
	alias: ['pray', 'curse'],

	args: '{@user}',

	desc: 'Pray or curse yourself or other users!!',

	example: ['owo pray', 'owo pray @scuttler'],

	related: [],

	permissions: ['sendMessages'],

	group: ['social'],

	cooldown: 300000,
	half: 22,
	six: 200,
	bot: true,

	execute: async function (p) {
		let user = undefined;
		if (p.args.length > 0) {
			user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
				if (!user) {
					p.errorMsg(', I could not find that user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
		}
		if (user && user.id == p.msg.author.id) user = undefined;
		let quest;

		let text = '';
		let authorPoints = 0,
			opponentPoints = 0;
		if (p.command == 'pray') {
			let prayLine = prayLines[Math.floor(Math.random() * prayLines.length)];
			if (user) {
				text =
					'**🙏 | ' + p.msg.author.username + '** prays for **' + user.username + '**! ' + prayLine;
				authorPoints = -1;
				opponentPoints = 1;
				quest = 'prayBy';
			} else {
				text = '**🙏 | ' + p.msg.author.username + '** prays... ' + prayLine;
				authorPoints = 1;
			}
		} else {
			let curseLine = curseLines[Math.floor(Math.random() * curseLines.length)];
			if (user) {
				text =
					'**👻 | ' +
					p.msg.author.username +
					'** puts a curse on **' +
					user.username +
					'**! ' +
					curseLine;
				authorPoints = 1;
				opponentPoints = -1;
				quest = 'curseBy';
			} else {
				text = '**👻 | ' + p.msg.author.username + '** is now cursed. ' + curseLine;
				authorPoints = -1;
			}
		}

		// Check if id exists first
		let sql = 'SELECT id FROM user WHERE id in (' + p.msg.author.id;
		let len = 1;
		if (opponentPoints && user) {
			sql += ',' + user.id;
			len++;
		}
		sql += ');';
		let result = await p.query(sql);
		if (result.length < len) {
			sql = 'INSERT IGNORE INTO user (id,count) VALUES (' + p.msg.author.id + ',0)';
			if (opponentPoints && user) sql += ',(' + user.id + ',0);';
		}

		sql =
			'INSERT INTO luck (id,lcount) VALUES (' +
			p.msg.author.id +
			',' +
			authorPoints +
			') ON DUPLICATE KEY UPDATE lcount = lcount ' +
			(authorPoints > 0 ? '+' + authorPoints : authorPoints) +
			';';
		sql += 'SELECT lcount FROM luck WHERE id = ' + p.msg.author.id + ';';
		if (opponentPoints && user) {
			sql +=
				'INSERT INTO luck (id,lcount) VALUES (' +
				user.id +
				',' +
				opponentPoints +
				') ON DUPLICATE KEY UPDATE lcount = lcount ' +
				(opponentPoints > 0 ? '+' + opponentPoints : opponentPoints) +
				';';
			sql +=
				'INSERT IGNORE INTO user_pray (sender,receiver,count,latest) VALUES (' +
				p.msg.author.id +
				',' +
				user.id +
				',1,NOW()) ON DUPLICATE KEY UPDATE count = count + 1, latest = NOW();';
		}

		result = await p.query(sql);
		text +=
			'\n**<:blank:427371936482328596> |** You have **' + result[1][0].lcount + '** luck point(s)!';
		text = alterPray.alter(p.msg.author.id, text, {
			command: p.command,
			author: p.msg.author,
			user,
			luck: result[1][0].lcount,
		});
		p.send(text);
		if (user && quest) p.quest(quest, 1, user);
		if (opponentPoints && user) {
			p.logger.incr('pray', 1, { from: p.msg.author.id, to: user.id });
			p.macro.checkToCommands(p, user.id);
		} else p.logger.incr('pray', 1, { from: p.msg.author.id, to: 'self' });
	},
});
