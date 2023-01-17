/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const levels = require('../../../../utils/levels.js');

exports.canGive = async function (sender, receiver, amount, con) {
	const senderLimit = await checkSender.bind(this)(sender, amount, con);
	if (senderLimit.error) return senderLimit;

	const receiverLimit = await checkReceiver.bind(this)(receiver, amount, con);
	if (receiverLimit.error) return receiverLimit;

	return {
		sql: senderLimit.sql + receiverLimit.sql,
	};
};

async function checkSender(user, amount, con) {
	let sql = `SELECT c.money, cl.send, cl.reset
			FROM cowoncy c
				LEFT JOIN cowoncy_limit cl ON c.id = cl.id
			WHERE c.id = ${user.id}
				AND c.money >= ${amount} FOR UPDATE;`;
	let result = await con.query(sql);
	if (!result[0] || result[0].money < amount) {
		return {
			error: ", you silly hooman! You don't have enough cowoncy!",
		};
	}

	const afterMid = this.dateUtil.afterMidnight(result[0].reset);
	const limit = (await getUserLimits(user.id)).send;

	if (afterMid.after) {
		if (amount > limit) {
			return {
				error: `, you can only send **${this.global.toFancyNum(limit)}** more cowoncy today!`,
			};
		}
		return {
			sql: `INSERT INTO cowoncy_limit (id, send, reset) VALUES (${user.id}, ${amount}, ${afterMid.sql}) ON DUPLICATE KEY UPDATE send = ${amount}, receive = 0, reset = ${afterMid.sql};`,
		};
	}

	if (result[0].send > limit) {
		return {
			error: `, you already hit your daily cowoncy give limit of: **${this.global.toFancyNum(
				result[0].send
			)}**`,
		};
	} else if (result[0].send + amount > limit) {
		const diff = limit - result[0].send;
		if (diff > 0) {
			return {
				error: `, you can only send **${this.global.toFancyNum(diff)}** more cowoncy today!`,
			};
		} else {
			return {
				error: ', you cannot send any more cowoncy today.',
			};
		}
	}
	return {
		sql: `UPDATE cowoncy_limit SET send = send + ${amount} WHERE id = ${user.id};`,
	};
}

async function checkReceiver(user, amount, con) {
	let sql = `SELECT cl.receive, cl.reset
			FROM cowoncy_limit cl
			WHERE cl.id = ${user.id}
			FOR UPDATE;`;
	let result = await con.query(sql);
	const afterMid = this.dateUtil.afterMidnight(result[0]?.reset);
	const limit = (await getUserLimits(user.id)).receive;

	if (afterMid.after) {
		if (amount > limit) {
			return {
				error: `, **${user.username}** can only receive **${this.global.toFancyNum(
					limit
				)}** more cowoncy today!`,
			};
		}
		return {
			sql: `INSERT INTO cowoncy_limit (id, receive, reset) VALUES (${user.id}, ${amount}, ${afterMid.sql}) ON DUPLICATE KEY UPDATE send = 0, receive = ${amount}, reset = ${afterMid.sql};`,
		};
	}

	if (result[0].receive > limit) {
		return {
			error: `, **${
				user.username
			}** has already received the daily receive limit of: **${this.global.toFancyNum(
				result[0].receive
			)}**`,
		};
	} else if (result[0].receive + amount > limit) {
		const diff = limit - result[0].receive;
		if (diff > 0) {
			return {
				error: `, **${user.username}** can only receive **${this.global.toFancyNum(
					diff
				)}** more cowoncy today!`,
			};
		} else {
			return {
				error: `, **${user.username}** cannot receive any more cowoncy today.`,
			};
		}
	}
	return {
		sql: `UPDATE cowoncy_limit SET receive = receive + ${amount} WHERE id = ${user.id};`,
	};
}

const getUserLimits = (exports.getUserLimits = async function (id) {
	const lvl = (await levels.getUserLevel(id)).level;
	const tens = Math.floor(lvl / 10);
	const limit = 50000 + lvl * 14000 + tens * 5000000;

	return {
		send: limit,
		receive: Math.ceil(limit * (tens / 2 + 1)),
	};
});

/*
for (let lvl = 1; lvl < 60; lvl++) {
	const tens = Math.floor(lvl / 10);
	const limit = 50000 + (lvl * 14000) + (tens * 5000000);

	const send = limit;
	const receive = Math.ceil(limit * ((tens/2) + 1))

	console.log(`[${lvl}] ${send} | ${receive}`);
}
*/
