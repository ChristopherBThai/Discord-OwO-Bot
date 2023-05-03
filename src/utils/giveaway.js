/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const global = require('./global.js');
const sender = require('./sender.js');
const rewardUtil = require('./rewardUtil.js');
const mysql = require('../botHandlers/mysqlHandler.js');
const config = require('../data/config.json');
const giveawayJson = require('../data/giveaway.json');
let owo;
let totalGiveawayChance = 0;
let giveaways = [];
const giveawayTimers = {};
for (let key in giveawayJson) {
	const giveaway = giveawayJson[key];
	totalGiveawayChance += giveaway.chance;
	giveaway.id = key;
	giveaway.type = giveaway.type || giveaway.id;
	giveaways.push(giveaway);
}
const multigiveChance = 0.2;
// 3 Days
const maxTime = 3 * 24 * 60 * 60 * 1000;
// 6 Hours
const minTime = 6 * 60 * 60 * 1000;
const maxWinners = 35;

async function createGiveaway(channelId) {
	const { endDate, diff } = getEndDate();
	const giveaway = {
		channelId: channelId,
		rewards: getRandomGiveaways(),
		endDate: endDate,
		winners: 1 + Math.floor(Math.random() * maxWinners),
	};

	await saveGiveaway(giveaway);
	createGiveawayTimeout(channelId, diff);
	const msg = await sendMessage(giveaway);
	await saveMsgId(channelId, msg);
}
exports.createGiveaway = createGiveaway;

exports.giveawayExists = async function (channelId, userId) {
	let sql = `SELECT g.*, ug.uid FROM giveaway g
			LEFT JOIN (
				user_giveaway ug INNER JOIN user u
					ON u.uid = ug.uid AND u.id = ${userId}
			) ON ug.cid = g.cid
		WHERE g.cid = ${channelId}`;
	let result = await mysql.query(sql);
	if (!result[0] || !result[0].active) {
		return { active: false };
	}
	return {
		active: !!result[0].active,
		channelId: channelId,
		userId: userId,
		rewards: parseRewards(result[0].rewards),
		endDate: new Date(result[0].endDate),
		winners: result[0].winners,
		uid: result[0].uid,
	};
};

exports.addUser = async function (channelId, uid) {
	let sql = `INSERT IGNORE INTO user_giveaway (cid, uid) VALUES (${channelId}, ${uid}); `;
	sql += `SELECT COUNT(cid) AS count FROM user_giveaway WHERE cid = ${channelId};`;
	let result = await mysql.query(sql);
	return result[1][0]?.count || 0;
};

exports.createContent = function (giveaway) {
	return createMessage(giveaway);
};

exports.checkGiveawayTimeout = async function (_owo) {
	owo = _owo;
	const sql = `SELECT * from giveaway WHERE active = 1;`;
	const result = await mysql.query(sql);
	result.forEach((giveaway) => {
		if (_owo.debug && giveaway.cid !== '420713232265641985') {
			console.log(`Ignoring giveaways for debug mode: ${giveaway.cid}`);
			return;
		}

		if (owo.bot.channelGuildMap[giveaway.cid]) {
			const diff = new Date(giveaway.endDate) - Date.now();
			console.log(`Found giveaway timeout for: ${giveaway.cid} ${diff}ms`);
			if (diff <= 0) {
				selectWinners(giveaway.cid);
			} else {
				createGiveawayTimeout(giveaway.cid, diff);
			}
		}
	});
};

async function selectWinners(channelId) {
	console.log('Selecting winners for ' + channelId);

	let giveaway, winners, result;
	const con = await mysql.startTransaction();
	try {
		let sql = `SELECT * FROM giveaway WHERE giveaway.cid = ${channelId} AND active = 1;`;
		sql += `SELECT u.uid, u.id FROM user_giveaway ug INNER JOIN user u ON ug.uid = u.uid WHERE cid = ${channelId};`;
		result = await con.query(sql);

		/* no giveaway */
		if (!result[0][0]) {
			console.log(`Giveaway not found for ${channelId}`);
			return await con.rollback();
		}

		giveaway = {
			active: !!result[0][0].active,
			channelId: channelId,
			rewards: parseRewards(result[0][0].rewards),
			endDate: new Date(result[0][0].endDate),
			winners: result[0][0].winners,
			giveawayCount: result[1].length,
		};

		/* no users exist */
		if (!result[1][0]) {
			await clearGiveaway(channelId, con);
			await con.commit();

			const messageId = result[0][0].mid;
			if (messageId) {
				let content = await createMessage(giveaway, [], true);
				await sender.editMsg(channelId, result[0][0].mid, content);
			}
			return;
		}

		winners = selectWinnersFromPool(result[1], giveaway.winners);
		await distributeRewards(giveaway, winners, con);
		await clearGiveaway(channelId, con);

		await con.commit();
	} catch (err) {
		console.error(err);
		return await con.rollback();
	}

	try {
		let content = await createMessage(giveaway, winners);
		await sender.editMsg(channelId, result[0][0].mid, content);
		msgWinners(winners, channelId, result[0][0].mid);
	} catch (err) {
		console.error(err);
	}

	if (config.giveawayChannels.includes(channelId)) {
		createGiveaway(channelId);
	}
}

function createGiveawayTimeout(channelId, diff) {
	console.log(`Creating timeout for: ${channelId} ${diff}ms`);
	if (giveawayTimers[channelId]) {
		clearTimeout(giveawayTimers[channelId].timer);
	}
	giveawayTimers[channelId] = {
		timer: setTimeout(() => {
			selectWinners(channelId);
		}, diff),
		channelId: channelId,
	};
}

function parseRewards(rewardString) {
	return rewardString.split(';').map((i) => {
		let [rewardId, count] = i.split(':');
		const reward = giveawayJson[rewardId];
		return { ...reward, count };
	});
}

async function saveGiveaway({ channelId, winners, rewards, endDate }) {
	let rewardSql = rewards
		.map((i) => {
			return i.id + ':' + i.count;
		})
		.join(';');
	let sql = `INSERT INTO giveaway (cid, rewards, endDate, winners, active)
		VALUES (${channelId}, '${rewardSql}', ${global.toMySQL(endDate)}, ${winners}, 1)
		ON DUPLICATE KEY UPDATE
			rewards = VALUES(rewards), endDate = VALUES(endDate), winners = VALUES(winners), active = 1; `;
	sql += `DELETE FROM user_giveaway WHERE cid = ${channelId};`;
	await mysql.query(sql);
}

async function createMessage(
	{ winners, rewards, endDate, giveawayCount = 0 },
	userWinners = [],
	noWinners
) {
	const embed = {
		color: config.embed_color,
		author: {
			name: config.emoji.tada + ' A New Giveaway Appeared!',
		},
		description: `**${winners} Lucky Users** will have a chance to win!\nWinners will win:\n\n`,
		timestamp: new Date(),
		footer: {
			text: giveawayCount + ' Users',
		},
	};
	rewards.forEach((reward) => {
		embed.description += `**• ${reward.emoji} ${reward.name} x${reward.count}**\n`;
	});

	const components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: 'Join Giveaway!',
					style: 1,
					custom_id: 'join_giveaway',
					emoji: {
						id: null,
						name: config.emoji.tada,
					},
				},
			],
		},
	];

	if (userWinners.length || noWinners) {
		embed.color = config.timeout_color;
		components[0].components[0].disabled = true;
		embed.author.name = config.emoji.tada + ' Giveaway has ended!';
		if (noWinners) {
			embed.description += `\nGiveaway ended **${global.toDiscordTimestamp(
				endDate
			)}**\nUnfortunately, there were no winners.`;
		} else {
			embed.description += `\nGiveaway ended **${global.toDiscordTimestamp(
				endDate
			)}**\nCongrats to the following players for winning!\n`;
			for (let i in userWinners) {
				const winner = userWinners[i];
				const user = await owo.fetch.getUser(winner.id, false);
				if (user) {
					embed.description += `\n${user.username}#${user.discriminator} • <@${winner.id}>`;
				} else {
					embed.description += `\nUnknown User • <@${winner.id}>`;
				}
			}
		}
	} else {
		embed.description += `\nGiveaway will end **${global.toDiscordTimestamp(
			endDate
		)}**\nGoodluck to those who join!`;
	}

	return { embed, components };
}

async function msgWinners(winners, channelId, messageId) {
	const guildId = owo.bot.channelGuildMap[channelId];
	const msg = `${config.emoji.tada} **|** Congratulations! You won the giveaway in https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
	winners.forEach((winner) => {
		sender.msgUser(winner.id, msg);
	});
}

async function sendMessage(giveaway) {
	const content = await createMessage(giveaway);
	return await sender.msgChannel(giveaway.channelId, content);
}

async function saveMsgId(channelId, msg) {
	let sql = `UPDATE giveaway SET mid = ${msg.id} WHERE cid = ${channelId};`;
	await mysql.query(sql);
}

function getEndDate() {
	const diff = minTime + Math.random() * (maxTime - minTime);
	return {
		endDate: new Date(Date.now() + diff),
		diff: diff,
	};
}

function getRandomGiveaways() {
	const giveaway = [];
	let chance = 0;
	do {
		giveaway.push(getRandomGiveaway());
		chance = Math.random();
	} while (chance <= multigiveChance);
	return giveaway;
}

function getRandomGiveaway() {
	let random = Math.random() * totalGiveawayChance;
	let chance = 0;
	let giveaway;
	for (let i = 0; i <= giveaways.length; i++) {
		chance += giveaways[i].chance;
		if (random <= chance) {
			giveaway = giveaways[i];
			i = giveaways.length + 1;
		}
	}

	random = Math.random() * giveaway.count.chances.reduce((a, b) => a + b);
	chance = 0;
	let count;
	for (let i = 0; i <= giveaway.count.values.length; i++) {
		chance += giveaway.count.chances[i];
		if (random <= chance) {
			count = giveaway.count.values[i];
			i = giveaway.count.values.length + 1;
		}
	}

	return { ...giveaway, count };
}

function selectWinnersFromPool(users, winnerCount) {
	const winners = [];
	for (let i = 0; i < winnerCount; i++) {
		if (users.length <= 0) {
			return winners;
		}
		winners.push(users.splice(Math.floor(Math.random() * users.length), 1)[0]);
	}
	return winners;
}

async function distributeRewards(giveaway, winners, con) {
	for (let i in giveaway.rewards) {
		const reward = giveaway.rewards[i];
		for (let j in winners) {
			const winner = winners[j];
			const rewardResult = await rewardUtil.getReward(
				winner.id,
				winner.uid,
				con,
				reward.type,
				reward.rewardId,
				reward.count
			);
			if (rewardResult?.sql) {
				await con.query(rewardResult.sql);
			}
		}
	}
}

async function clearGiveaway(channelId, con) {
	let sql = `DELETE FROM user_giveaway WHERE cid = ${channelId};`;
	sql += `UPDATE giveaway SET active = 0 WHERE cid = ${channelId};`;
	await con.query(sql);
}
