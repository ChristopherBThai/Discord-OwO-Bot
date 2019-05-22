/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../commandinterface.js');

const dateUtil = require('../../../util/dateUtil.js');
const check = "☑";
const box = "⬛";

module.exports = new CommandInterface({

	alias: ["checklist", "task", "tasks"],

	args: "",

	desc: "Get a list of all the things you have left to do!",

	example: [],

	related: [],

	cooldown: 15000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let time = dateUtil.afterMidnight();

		let description = "";

		let checklist = [];
		checklist.push(daily(p));
		checklist.push(vote(p));
		checklist.push(cookie(p));
		checklist.push(quests(p));
		checklist.push(questrr(p));
		checklist.push(lootboxes(p));
		checklist.push(crates(p));
		checklist.push(lottery(p));

		let sql = "";
		for (let i in checklist) {
			sql += checklist[i].sql;
		}

		let result = await p.query(sql);

		for (let i in checklist) {
			let task = checklist[i].parse(result[i]);
			description += "\n" + (task.done ? check : box) + " " + task.emoji + " " + task.desc;
		}

		let embed = {
			author: {
				name: p.msg.author.username + "'s Checklist",
				icon_url: p.msg.author.avatarURL
			},
			color: p.config.embed_color,
			footer: {
				text: "Resets in " + time.hours + "H " + time.minutes + "M " + time.seconds + "S"
			},
			timestamp: new Date(),
			description
		}
		p.send({
			embed
		});
	}

})

function daily(p) {
	return {
		sql: `SELECT daily FROM cowoncy WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].daily : undefined);
			if (afterMid && !afterMid.after)
				return {
					done: true,
					desc: "You have claimed your daily!",
					emoji: '🎁'
				}
			else
				return {
					done: false,
					desc: "You can still claim your daily!",
					emoji: '🎁'
				}
		}
	}
}

function vote(p) {
	return {
		sql: `SELECT TIMESTAMPDIFF(HOUR,date,NOW()) AS time FROM vote WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			if (result[0] && result[0].time < 12)
				return {
					done: true,
					desc: "You can claim your vote in " + (12 - result[0].time) + " hours!",
					emoji: '📝'
				}
			else
				return {
					done: false,
					desc: "You can claim your vote!",
					emoji: '📝'
				}
		}
	}
}

function cookie(p) {
	return {
		sql: `SELECT cookieTime FROM user INNER JOIN timers ON user.uid = timers.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].cookieTime : undefined);
			if (afterMid && !afterMid.after)
				return {
					done: true,
					desc: "You have used your cookie!",
					emoji: '🍪'
				}
			else
				return {
					done: false,
					desc: "You can still send a cookie!",
					emoji: '🍪'
				}
		}
	}
}

function quests(p) {
	return {
		sql: `SELECT questTime FROM user INNER JOIN timers ON user.uid = timers.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].questTime : undefined);
			if (afterMid && !afterMid.after)
				return {
					done: true,
					desc: "You already claimed today's quest!",
					emoji: '📜'
				}
			else
				return {
					done: false,
					desc: "You can still claim a quest!",
					emoji: '📜'
				}
		}
	}
}

function questrr(p) {
	return {
		sql: `SELECT questrrTime FROM user INNER JOIN timers ON user.uid = timers.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].questrrTime : undefined);
			if (afterMid && !afterMid.after)
				return {
					done: true,
					desc: "You already rerolled a quest today!",
					emoji: '🔄'
				}
			else
				return {
					done: false,
					desc: "You can still reroll a quest!",
					emoji: '🔄'
				}
		}
	}
}

function lootboxes(p) {
	return {
		sql: `SELECT claim,claimcount FROM lootbox WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].claim : undefined);
			let claimed = result[0] ? result[0].claimcount : 0;
			if (afterMid && !afterMid.after) {
				if (claimed < 3)
					return {
						done: false,
						desc: (3 - claimed) + " lootbox" + (claimed == 2 ? " is still " : "es are still ") + "available!",
						emoji: '💎'
					}
				else
					return {
						done: true,
						desc: "You have found all lootboxes!",
						emoji: '💎'
					}
			} else
				return {
					done: false,
					desc: "3 lootboxes are still available!",
					emoji: '💎'
				}
		}
	}
}

function crates(p) {
	return {
		sql: `SELECT claim,claimcount FROM crate INNER JOIN user ON user.uid = crate.uid WHERE id = ${p.msg.author.id};`,
		parse: function (result) {
			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].claim : undefined);
			let claimed = result[0] ? result[0].claimcount : 0;
			if (afterMid && !afterMid.after) {
				if (claimed < 3)
					return {
						done: false,
						desc: (3 - claimed) + " weapon crate" + (claimed == 2 ? " is still " : "s are still ") + "available!",
						emoji: '⚔'
					}
				else
					return {
						done: true,
						desc: "You have found all weapon crates!",
						emoji: '⚔'
					}
			} else
				return {
					done: false,
					desc: "3 weapon creates are still available!",
					emoji: '⚔'
				}
		}
	}
}

function lottery(p) {
	return {
		sql: `"SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;" +
		"SELECT * FROM lottery WHERE id = " + msg.author.id + " AND valid = 1;"`,
		parse: function (result) {
			
			var sum = 0;
			var count = 0;
			var bet = 0;
			var chance = 0;

			if (results[0].sum != undefined) {
				sum = parseInt(results[0][0].sum);
				count = result[0].count;
			}
			if (result[0] != undefined) {
				bet = result[0].amount;
				if (sum != 0) {
					chance = (bet / sum) * 100;
					if (chance >= 0.01)
						chance = Math.trunc(chance * 100) / 100
				} else
					chance = 100;
			}

			let afterMid = dateUtil.afterMidnight((result[0]) ? result[0].bet : undefined);
			
			if (afterMid && !afterMid.after) {
				if (bet < 100000)
					return {
						done: true,
						desc: "You have entered $" + (bet) + " into the lottery giving you a " + (chance) + "% chance of winning.",
						emoji: '🎰'
					}
				else
					return {
						done: true,
						desc: "You have maximized your win chance at " + (chance) + "%",
						emoji: '🎰'
					}
			} else
				return {
					done: false,
					desc: "You can still enter the lottery for a chance to win " + (sum),
					emoji: '🎰'
				}
		}
	}
}