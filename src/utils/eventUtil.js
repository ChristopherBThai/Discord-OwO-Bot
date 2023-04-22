/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const events = require('../data/event.json');
const itemUtil = require('../commands/commandList/shop/util/itemUtil.js');
const rewardUtil = require('./rewardUtil.js');
const itemToEvents = {};
for (const key in events) {
	const event = events[key];
	itemToEvents[event.item.id] = event;
}

let activeEvents = {};
setActiveEvents();

exports.useItem = async function (item) {
	const event = getEventByItem(item.column);
	const uid = await this.global.getUserUid(this.msg.author);
	const con = await this.startTransaction();

	let reward;
	try {
		let sql = `UPDATE user_item
			SET count = count - 1
			WHERE uid = ${uid}
				AND user_item.count >= 1
				AND user_item.name = '${item.column}';`;
		let result = await con.query(sql);
		if (!result.changedRows) {
			await con.rollback();
			try {
				await this.errorMsg(`, you don't have a **${item.name}**!`, 3000);
			} catch (err) {
				/* empty */
			}
			return;
		}

		reward = await getRandomReward.bind(this)(event.item.rewards, con);

		if (reward.sql) {
			await con.query(reward.sql);
		}
		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		this.errorMsg(', failed to use item.', 3000);
		return;
	}

	let text = `${event.item.openEmoji} **|** You open the **${item.name}** and received **${reward.text}**!`;
	this.send(text);
};

exports.getEventItem = async function () {
	const event = getCurrentActive();
	if (!event) return;

	// Cache if user is done today
	let today = new Date();
	today = today.toLocaleDateString();
	if (this.msg.author.eventItemDone) {
		const date = this.msg.author.eventItemDone;
		if (date === today) {
			return;
		} else {
			delete this.msg.author.eventItemDone;
		}
	}
	const uid = await this.global.getUserUid(this.msg.author);

	const con = await this.startTransaction();
	let claimed;
	try {
		let rand = Math.random();
		let sql = `SELECT * FROM user_item WHERE uid = ${uid} AND name = '${event.item.id}';`;
		const result = await con.query(sql);
		claimed = (result[0]?.claim_count || 0) + 1;

		const reset = this.dateUtil.afterMidnight(result[0]?.claim_reset);
		if (result[0] && result[0]?.claim_count >= 3 && !reset.after) {
			this.msg.author.eventItemDone = today;
			con.rollback();
			return;
		}
		if (reset.after) {
			rand = 0;
			claimed = 1;
		}

		if (rand > event.item.chance) {
			con.rollback();
			return;
		}

		sql = `INSERT INTO user_item (uid, name, count, claim_reset, claim_count) VALUES 
						(${uid}, '${event.item.id}', 1, ${reset.sql}, 1) ON DUPLICATE KEY UPDATE
						count = count + 1, claim_count = ${claimed}, claim_reset = ${reset.sql};`;
		await con.query(sql);
		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return;
	}

	const item = itemUtil.getByName(event.item.id);
	const text =
		event.item.foundText.replaceAll('?emoji?', event.item.emoji) +
		` \`[${claimed}/3]\`\n${this.config.emoji.blank} **|** To use this item, type \`owo use ${item.id}\``;

	this.send(text);
};

exports.isValentines = function () {
	// TODO remove next year
	if (Date.now() < 1676448000000) {
		return false;
	}
	return isEventActive(events['valentine']);
};

exports.getValentines = function () {
	return events['valentine'];
};

function isEventActive(event) {
	if (!event) {
		return false;
	}
	if (!event.start || !event.end) {
		console.error(`No event start/end with name: ${event.id}`);
		return false;
	}
	const now = Date.now();
	return event.start < now && now < event.end;
}

function setActiveEvents() {
	activeEvents = {};
	for (const key in events) {
		if (Date.now() < events[key].end) {
			activeEvents[key] = events[key];
		}
	}
	console.log('Active Events: ' + JSON.stringify(activeEvents, null, 2));
}

function getCurrentActive() {
	let resetActive = false;
	for (const key in activeEvents) {
		if (isEventActive(activeEvents[key])) {
			return activeEvents[key];
		} else if (Date.now() >= activeEvents[key].end) {
			resetActive = true;
		}
	}
	if (resetActive) {
		setActiveEvents();
	}
}

function getEventByItem(itemName) {
	return itemToEvents[itemName];
}

async function getRandomReward(rewards, con) {
	const totalChance = rewards.reduce((a, b) => a + b.chance, 0);
	const rand = Math.random() * totalChance;
	let chance = 0;
	let result;
	const newRewards = [];

	rewards.forEach((reward) => {
		chance += reward.chance;
		if (!result && rand < chance) {
			result = reward;
		} else {
			newRewards.push(reward);
		}
	});
	if (!result) {
		throw 'No reward found';
	}

	result = await parseReward.bind(this)(result, con);
	if (!result) {
		result = await getRandomReward.bind(this)(newRewards, con);
	}
	return result;
}

async function parseReward(reward, con) {
	const uid = await this.global.getUserUid(this.msg.author);
	return rewardUtil.getReward(this.msg.author.id, uid, con, reward.type, reward.id, reward.count);
}
