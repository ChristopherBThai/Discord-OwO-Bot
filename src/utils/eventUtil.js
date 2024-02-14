/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const events = require('../data/event.json');
//const itemUtil = require('../commands/commandList/shop/util/itemUtil.js');
const rewardUtil = require('./rewardUtil.js');
const lootboxUtil = require('../commands/commandList/zoo/lootboxUtil.js');
const eventMax = 10;
const itemToEvents = {};
for (const key in events) {
	const event = events[key];
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

exports.getEventItem = async function () {
	const event = getCurrentActive();
	if (!event) return;
	const random = Math.random();
	if (random >= event.chance) {
		return;
	}
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
		let sql = `SELECT * FROM user_event WHERE uid = ${uid} AND name = '${event.type}';`;
		const result = await con.query(sql);
		claimed = (result[0]?.claim_count || 0) + 1;

		const reset = this.dateUtil.afterMidnight(result[0]?.claim_reset);
		if (result[0] && result[0]?.claim_count >= eventMax && !reset.after) {
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

		const { rewardSql, rewardTxt, rewardEmoji } = await getEventRewards.bind(this)(this.msg.author);
		await con.query(rewardSql);
		this.send(`${rewardEmoji} **|** \`[${claimed}/${eventMax}]\` ${rewardTxt}`);

		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return;
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

async function getEventRewards(user) {
	const id = user.id;
	const uid = await this.global.getUserUid(user);
	let rand = Math.random();
	rand = 1.4;

	if (rand <= 0.15) {
		// Cowoncy
		let rewardCount = 1000;
		rewardCount = Math.floor(rewardCount + Math.random() * 4000);
		return {
			rewardTxt: `You received a red envelope! It has **${this.global.toFancyNum(rewardCount)} ${
				this.config.emoji.cowoncy
			} Cowoncies**, that's dope!`,
			rewardEmoji: '🧧',
			rewardSql: `INSERT INTO cowoncy (id,money) VALUES (${id}, ${rewardCount}) ON DUPLICATE KEY UPDATE money = money + ${rewardCount};`,
		};
	} else if (rand <= 0.3) {
		// Shard
		let rewardCount = 300;
		rewardCount = Math.floor(rewardCount + Math.random() * 700);
		return {
			rewardTxt: `OwO what's this? A black cat left a gift behind? It's **${this.global.toFancyNum(
				rewardCount
			)} ${this.config.emoji.shards} Weapon Shards** to make your weapons refined!`,
			rewardEmoji: '🐈‍⬛',
			rewardSql: `INSERT INTO shards (uid,count) VALUES (${uid},${rewardCount}) ON DUPLICATE KEY UPDATE count = count + ${rewardCount};`,
		};
	} else if (rand <= 0.45) {
		// Lootbox
		let rewardCount = 1;
		rewardCount = Math.floor(rewardCount + Math.random() * 2);
		let rewardTxt = `Happy Chinese New Year! I hope `;
		if (rewardCount > 1) {
			rewardTxt += `these **${rewardCount} ${this.config.emoji.lootbox} Lootboxes** can make your luck appear!`;
		} else {
			rewardTxt += `this **${rewardCount} ${this.config.emoji.lootbox} Lootbox** can make your luck appear!`;
		}
		return {
			rewardTxt,
			rewardEmoji: `🧧`,
			rewardSql: `INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
		};
	} else if (rand <= 0.6) {
		// Crate
		let rewardCount = 1;
		rewardCount = Math.floor(rewardCount + Math.random() * 2);
		let rewardTxt = `Look! A fairy with a gift for you! She left behind **${rewardCount} ${this.config.emoji.crate} Weapon Crate`;
		if (rewardCount > 1) {
			rewardTxt += `s**, they look brand new!`;
		} else {
			rewardTxt += `**, it looks brand new!`;
		}
		return {
			rewardTxt,
			rewardEmoji: '🧚',
			rewardSql: `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${rewardCount},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
		};
	} else if (rand <= 0.75) {
		// Cookie
		return {
			rewardTxt: `Happy Valentine's! Enjoy this nice treat. I hope this **${this.config.emoji.cookie} Cookie** is very very sweet!`,
			rewardEmoji: '❤️',
			rewardSql: `INSERT INTO rep (id, count) VALUES (${id},1) ON DUPLICATE KEY UPDATE count = count + 1;`,
		};
	} else if (rand <= 0.9) {
		// Special Gem
		const specialGems = [79, 80, 81, 82, 83, 84, 85];
		const gemId = specialGems[Math.floor(Math.random() * specialGems.length)];
		let gem = lootboxUtil.getRandomGems(uid, 1, { gid: gemId });
		let gemSql = gem.sql;
		gem = Object.values(gem.gems)[0].gem;
		return {
			rewardTxt: `OwO! I wish you Good luck in the year ahead. If not, this **${gem.emoji} ${gem.rank} ${gem.type} Gem** will give you fortune instead!`,
			rewardEmoji: '🧧',
			rewardSql: gemSql,
		};
	} else {
		// Special Pet
		let animal = this.global.validAnimal('2024feb_owo');
		return {
			rewardTxt: `A cutie appeared, she asks, "Will you be my Valentine?". ${animal.value} OwO wants to stay with you all the time!`,
			rewardEmoji: '💌',
			rewardSql: `INSERT INTO animal (count, totalcount, id, name) VALUES (1,1,${id},'${animal.value}')
					ON DUPLICATE KEY UPDATE count = count + 1, totalcount = totalcount + 1;
					INSERT INTO animal_count (id, ${animal.rank}) VALUES (${id}, 1)
					ON DUPLICATE KEY UPDATE ${animal.rank} = ${animal.rank} + 1;`,
		};
	}
}
