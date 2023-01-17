/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const alterChecklist = require('../patreon/alterChecklist.js');
const dateUtil = require('../../../utils/dateUtil.js');
const check = '☑';
const box = '⬛';
const tada = '🎉';

module.exports = new CommandInterface({
	alias: ['checklist', 'task', 'tasks', 'cl'],

	args: '',

	desc: 'Get a list of all the things you have left to do!',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['economy'],

	cooldown: 15000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let time = dateUtil.afterMidnight();

		let description = '';

		// Construct all sqls
		let checklist = [];
		checklist.push(daily(p));
		checklist.push(vote(p));
		checklist.push(cookie(p));
		checklist.push(quests(p));
		checklist.push(lootboxes(p));
		checklist.push(crates(p));

		let sql = '';
		for (let i in checklist) {
			sql += checklist[i].sql;
		}
		sql += `SELECT checklist,user.uid FROM user LEFT JOIN timers ON user.uid = timers.uid WHERE user.id = ${p.msg.author.id};`;
		let result = await p.query(sql);

		let reward = true;
		let done = false;

		// Combine parse query and check if they completed all quests
		let tasks = [];
		for (let i in checklist) {
			let task = checklist[i].parse(result[i]);
			description += '\n' + (task.done ? check : box) + ' ' + task.emoji + ' ' + task.desc;
			if (!task.done) reward = false;
			tasks.push(task);
		}

		// Check if they already claimed
		let afterMid = dateUtil.afterMidnight(
			result[result.length - 1][0] ? result[result.length - 1][0].checklist : undefined
		);
		if (afterMid && !afterMid.after) {
			reward = false;
			done = true;
			description += '\n' + check + ' ' + tada + ' You already claimed your checklist rewards!';
		} else if (!reward) {
			description += '\n' + box + ' ' + tada + ' Complete your checklist to get a reward!';
		} else {
			description +=
				'\n' +
				check +
				' ' +
				tada +
				' You earned 1,000 ' +
				p.config.emoji.cowoncy +
				', 1 ' +
				p.config.emoji.lootbox +
				', 1 ' +
				p.config.emoji.crate +
				', 100 ' +
				p.config.emoji.shards +
				', and 1 ' +
				p.config.emoji.cookie +
				'!';
		}

		if (reward) {
			let uid = result[result.length - 1][0].uid;
			sql = `UPDATE timers SET checklist = ${afterMid.sql} WHERE uid = ${uid};
					UPDATE lootbox SET boxcount = boxcount + 1 WHERE id = ${p.msg.author.id};
					UPDATE crate SET boxcount = boxcount + 1 WHERE uid = ${uid};
					UPDATE cowoncy SET money = money + 1000 WHERE id = ${p.msg.author.id};
					INSERT INTO rep (id,count) VALUES (${p.msg.author.id},1) ON DUPLICATE KEY UPDATE count = count + 1;
					INSERT INTO shards (uid,count) VALUES (${uid},100) ON DUPLICATE KEY UPDATE count = count + 100`;
			result = await p.query(sql);
			p.quest('cookieBy', 1, p.msg.author);
		}

		let embed = {
			author: {
				name: p.msg.author.username + "'s Checklist",
				icon_url: p.msg.author.avatarURL,
			},
			color: p.config.embed_color,
			footer: {
				text: 'Resets in ' + time.hours + 'H ' + time.minutes + 'M ' + time.seconds + 'S',
			},
			timestamp: new Date(),
			description,
		};
		embed = alterChecklist.alter(p.msg.author.id, {
			embed,
			tasks,
			reward,
			done,
			emoji: this.config.emoji,
		});

		p.send({ embed });
	},
});

function daily(p) {
	return {
		sql: `SELECT daily FROM cowoncy WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight(result[0] ? result[0].daily : undefined);
			if (afterMid && !afterMid.after)
				return {
					done: true,
					desc: 'You have claimed your daily!',
					emoji: '🎁',
				};
			else
				return {
					done: false,
					desc: 'You can still claim your daily!',
					emoji: '🎁',
				};
		},
	};
}

function vote(p) {
	return {
		sql: `SELECT TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			if (result[0] && result[0].time < 12)
				return {
					done: true,
					desc:
						'You can claim your vote in ' +
						(12 - result[0].time) +
						(result[0].time < 11 ? ' hours!' : ' hour!'),
					emoji: '📝',
				};
			else return { done: false, desc: 'You can claim your vote!', emoji: '📝' };
		},
	};
}

function cookie(p) {
	return {
		sql: `SELECT cookieTime FROM user INNER JOIN timers ON user.uid = timers.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight(result[0] ? result[0].cookieTime : undefined);
			if (afterMid && !afterMid.after)
				return { done: true, desc: 'You have used your cookie!', emoji: '🍪' };
			else
				return {
					done: false,
					desc: 'You can still send a cookie!',
					emoji: '🍪',
				};
		},
	};
}

function quests(p) {
	return {
		sql: `SELECT questrrTime,questTime FROM user INNER JOIN timers ON user.uid = timers.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight(result[0] ? result[0].questTime : undefined);
			let rrText = dateUtil.afterMidnight(result[0] ? result[0].questrrTime : undefined).after
				? ' (+rr)'
				: '';
			if (afterMid && !afterMid.after) {
				return {
					done: true,
					desc: "You already claimed today's quest!" + rrText,
					emoji: '📜',
				};
			} else
				return {
					done: false,
					desc: 'You can still claim a quest!' + rrText,
					emoji: '📜',
				};
		},
	};
}

function lootboxes(p) {
	return {
		sql: `SELECT claim,claimcount FROM lootbox WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight(result[0] ? result[0].claim : undefined);
			let claimed = result[0] ? result[0].claimcount : 0;
			if (afterMid && !afterMid.after) {
				if (claimed < 3)
					return {
						done: false,
						desc:
							3 -
							claimed +
							' lootbox' +
							(claimed == 2 ? ' ' : 'es ') +
							'can be found from hunting!',
						emoji: '💎',
					};
				else
					return {
						done: true,
						desc: 'You have found all lootboxes!',
						emoji: '💎',
					};
			} else
				return {
					done: false,
					desc: '3 lootboxes can be found from hunting!',
					emoji: '💎',
				};
		},
	};
}

function crates(p) {
	return {
		sql: `SELECT claim,claimcount FROM crate INNER JOIN user ON user.uid = crate.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight(result[0] ? result[0].claim : undefined);
			let claimed = result[0] ? result[0].claimcount : 0;
			if (afterMid && !afterMid.after) {
				if (claimed < 3)
					return {
						done: false,
						desc:
							3 -
							claimed +
							' weapon crate' +
							(claimed == 2 ? ' ' : 's ') +
							'can be found from battling!',
						emoji: '⚔',
					};
				else
					return {
						done: true,
						desc: 'You have found all weapon crates!',
						emoji: '⚔',
					};
			} else
				return {
					done: false,
					desc: '3 weapon crates can be found from battling!',
					emoji: '⚔',
				};
		},
	};
}
