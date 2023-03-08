/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

/*
 * Handles quest counter/rewards
 */

const quests = require('../data/quests.json');
const mysql = require('./mysqlHandler.js');
const global = require('../utils/global.js');
const questBy = ['friendlyBattle', 'friendlyBattleBy', 'emoteBy', 'prayBy', 'curseBy', 'cookieBy'];

module.exports = class Quest {
	/* Constructer to grab mysql connection */
	constructor() {}

	/* progress in a specific quest */
	async increment(msg, questName, count = 1, extra) {
		/* parse id and username */
		let id = msg.author.id;
		let username = msg.author.username;
		if (questBy.includes(questName)) {
			id = extra.id;
			username = extra.username;
		}
		id = BigInt(id);

		/* Special quest parameters */
		if (questName == 'friendlyBattleBy') questName = 'friendlyBattle';

		/* Check if user has this quest */
		let result = await mysql.query(
			'SELECT * FROM quest WHERE qname = ? AND locked = 0 AND uid = (SELECT uid FROM user WHERE id = ?);',
			[questName, id]
		);

		if (!result[0]) return;

		for (let i = 0; i < result.length; i++)
			await check(msg, id, username, questName, result[i], count, extra);
	}
};

/* Check if user finished quest or increment quest progress */
async function check(msg, id, username, questName, result, count, extra) {
	/* Parse data for quest */
	let quest = quests[questName];
	if (!quest || !result) return;
	let current = result.count + count;
	let level = result.level;
	let needed = quest.count[level];
	let rewardType = result.prize;
	let reward = quest[rewardType][level];

	/* Check if valid */
	if (questName == 'find') {
		needed = 3;
		/* Check if the tier matches */
		if (quest.count[level] in extra) {
			current += extra[quest.count[level]] - 1;
			count = extra[quest.count[level]];
		} else return;
	}

	/* Check if the quest is complete */
	let text, rewardSql, sql, variables, rewardVar;
	if (current >= needed) {
		sql =
			'DELETE FROM quest WHERE qid = ? AND qname = ? AND uid = (SELECT uid FROM user WHERE id = ?);';

		variables = [result.qid, questName, id];
		text = '**📜 | ' + username + '**! You finished a quest and earned: ';
		if (rewardType == 'lootbox') {
			text += '<:box:427352600476647425>'.repeat(reward);
			rewardSql =
				"INSERT INTO lootbox (id,boxcount,claim) VALUES (?,?,'2017-01-01 10:10:10') ON DUPLICATE KEY UPDATE boxcount = boxcount + ?;";
			rewardVar = [id, reward, reward];
		} else if (rewardType == 'crate') {
			text += '<:crate:523771259302182922>'.repeat(reward);
			rewardSql =
				"INSERT INTO crate (uid,boxcount,claim) VALUES ((SELECT uid FROM user WHERE id = ?),?,'2017-01-01 10:10:10') ON DUPLICATE KEY UPDATE boxcount = boxcount + ?;";
			rewardVar = [id, reward, reward];
		} else if (rewardType == 'shards') {
			text += '<:weaponshard:655902978712272917>**x' + reward + '**';
			rewardSql =
				'INSERT INTO shards (uid,count) VALUES ((SELECT uid FROM user WHERE id = ?),?) ON DUPLICATE KEY UPDATE count = count + ?;';
			rewardVar = [id, reward, reward];
		} else {
			text += global.toFancyNum(reward) + ' <:cowoncy:416043450337853441>';
			rewardSql =
				'INSERT INTO cowoncy (id,money) VALUES (?,?) ON DUPLICATE KEY UPDATE money = money + ?';
			rewardVar = [id, reward, reward];
		}
		text += '!';
	} else {
		sql =
			'UPDATE IGNORE quest SET count = count + ? WHERE qid = ? AND qname = ? AND uid = (SELECT uid FROM user WHERE id = ?);';
		variables = [count, result.qid, questName, id];
	}

	/* Query sql */
	result = await mysql.query(sql, variables);
	if (result.affectedRows == 1 && rewardSql) {
		await mysql.query(rewardSql, rewardVar);
		await msg.channel.createMessage(text);
	}
}
