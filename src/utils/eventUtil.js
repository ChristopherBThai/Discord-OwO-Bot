/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const events = require('../data/event.json');
//const itemUtil = require('../commands/commandList/shop/util/itemUtil.js');
let rewardUtil;
const eventMax = 10;
const itemToEvents = {};
for (const key in events) {
	const event = events[key];
	if (typeof event.start === 'string') {
		event.start = new Date(event.start).getTime();
	}
	if (typeof event.end === 'string') {
		event.end = new Date(event.end).getTime();
	}
	if (event.item) {
		itemToEvents[event.item.id] = event;
	}
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
	if (reward.nextLine) {
		text += `\n${reward.nextLine}`;
	}
	this.send(text);
};

const getEventItem = (exports.getEventItem = async function ({ overrideEvent, overrideItem } = {}) {
	const event = getCurrentActive(overrideEvent);
	if (!event) return;
	const random = Math.random();
	if (!overrideEvent && random >= event.chance) {
		return;
	}
	// Cache if user is done today
	let today = new Date();
	today = today.toLocaleDateString();
	if (!overrideEvent && this.msg.author.eventItemDone) {
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
		let sql = `SELECT * FROM user_event WHERE uid = ${uid} AND name = '${event.type}';`;
		const result = await con.query(sql);
		claimed = (result[0]?.claim_count || 0) + 1;

		const reset = this.dateUtil.afterMidnight(result[0]?.claim_reset);
		if (!overrideEvent && result[0] && result[0]?.claim_count >= eventMax && !reset.after) {
			this.msg.author.eventItemDone = today;
			con.rollback();
			return;
		}
		if (reset.after) {
			claimed = 1;
		}

		sql = `INSERT INTO user_event (uid, name, claim_reset, claim_count) VALUES 
						(${uid}, '${event.type}', ${reset.sql}, 1) ON DUPLICATE KEY UPDATE
						claim_count = ${claimed}, claim_reset = ${reset.sql};`;
		await con.query(sql);

		const { rewardSql, rewardTxt, rewardEmoji } = await getEventRewards.bind(this)(
			this.msg.author,
			con,
			event,
			overrideItem
		);
		if (rewardSql) {
			await con.query(rewardSql);
		}
		this.send(`${rewardEmoji} **|** \`[${claimed}/${eventMax}]\` ${rewardTxt}`);

		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return;
	}
});

exports.getAllItems = async function (overrideEvent) {
	const event = events[overrideEvent];
	if (!event) {
		this.errorMsg(', no event');
		return;
	}
	for (let overrideItem in event.rewards) {
		await getEventItem.bind(this)({ overrideEvent, overrideItem });
	}
};

exports.isValentines = function () {
	return getCurrentActive()?.type === 'valentine';
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
		const event = events[key];
		if (Date.now() < event.end) {
			event.id = key;
			activeEvents[key] = event;
		}
	}
	console.log('Upcoming/Active: ' + Object.keys(activeEvents));
	const current = getCurrentActive();
	console.log('Current: ' + current?.id);
}

function getCurrentActive(override) {
	if (override) {
		return events[override];
	}
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

exports.getCurrentActive = getCurrentActive;

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

async function getEventRewards(user, con, event, override) {
	const id = user.id;
	const uid = await this.global.getUserUid(user);
	if (!event.rewardTotal) {
		event.rewardTotal = event.rewards.reduce((acc, curr) => acc + curr.chance, 0);
	}
	const reward =
		event.rewards[override] || this.global.selectRandom(event.rewards, event.rewardTotal);

	let count = reward.count;
	if (reward.min && reward.max) {
		count = reward.min + Math.floor(Math.random() * (reward.max - reward.min));
	}
	const result = await rewardUtil.getReward(id, uid, con, reward.type, reward.id, count);

	let rewardTxt = reward.text;
	for (let key in result) {
		rewardTxt = rewardTxt.replaceAll(`?${key}?`, result[key]);
	}
	return {
		rewardTxt,
		rewardEmoji: reward.textEmoji,
		rewardSql: result.sql,
	};
}

exports.init = async function (main) {
	rewardUtil = main.rewardUtil;
};
