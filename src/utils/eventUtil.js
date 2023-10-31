/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const events = require('../data/event.json');
const itemUtil = require('../commands/commandList/shop/util/itemUtil.js');
const rewardUtil = require('./rewardUtil.js');
const lootboxUtil = require('../commands/commandList/zoo/lootboxUtil.js');
const dailyMax = 5;
const halloweenMax = 10;
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
	if (event?.type === 'halloween') {
		checkHalloween.bind(this)(event);
		return;
	}
	if (!event.item) return;

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
		if (result[0] && result[0]?.claim_count >= dailyMax && !reset.after) {
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
		` \`[${claimed}/${dailyMax}]\`\n${this.config.emoji.blank} **|** To use this item, type \`owo use ${item.id}\``;

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

async function checkHalloween(event) {
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
		let sql = `SELECT * FROM user_event WHERE uid = ${uid} AND name = 'halloween';`;
		const result = await con.query(sql);
		claimed = (result[0]?.claim_count || 0) + 1;

		const reset = this.dateUtil.afterMidnight(result[0]?.claim_reset);
		if (result[0] && result[0]?.claim_count >= halloweenMax && !reset.after) {
			this.msg.author.eventItemDone = today;
			con.rollback();
			return;
		}
		if (reset.after) {
			claimed = 1;
		}

		sql = `INSERT INTO user_event (uid, name, claim_reset, claim_count) VALUES 
						(${uid}, 'halloween', ${reset.sql}, 1) ON DUPLICATE KEY UPDATE
						claim_count = ${claimed}, claim_reset = ${reset.sql};`;
		await con.query(sql);

		const { rewardSql, rewardTxt } = await getHalloweenRewards.bind(this)(this.msg.author);
		const candies = [
			'<:candy1:1168784857002946611>',
			'<:candy2:1168784855736270849>',
			'<:candy3:1168784853538451488>',
			'🍭',
		];
		const emoji = candies[Math.floor(Math.random() * candies.length)];
		await con.query(rewardSql);
		this.send(`${emoji} **|** \`[${claimed}/${halloweenMax}]\` ${rewardTxt}`);

		await con.commit();
	} catch (err) {
		console.error(err);
		con.rollback();
		return;
	}

	/*
		event.item.foundText.replaceAll('?emoji?', event.item.emoji) +
		` \`[${claimed}/${dailyMax}]\`\n${this.config.emoji.blank} **|** To use this item, type \`owo use ${item.id}\``;
		*/
}

async function getHalloweenRewards(user) {
	const id = user.id;
	const uid = await this.global.getUserUid(user);
	let rand = Math.random();

	if (rand <= 0.15) {
		// Cowoncy
		let rewardCount = 1000;
		rewardCount = Math.floor(rewardCount + Math.random() * 4000);
		return {
			rewardTxt: `You’ve eaten too much candy and sit down. What’s that on the floor? You pocket an extra **${this.global.toFancyNum(
				rewardCount
			)} ${this.config.emoji.cowoncy} Cowoncy** you found!`,
			rewardSql: `INSERT INTO cowoncy (id,money) VALUES (${id}, ${rewardCount}) ON DUPLICATE KEY UPDATE money = money + ${rewardCount};`,
		};
	} else if (rand <= 0.3) {
		// Shard
		let rewardCount = 500;
		rewardCount = Math.floor(rewardCount + Math.random() * 2500);
		return {
			rewardTxt: `You open the candy wrapper, but what's this? This isn't candy! You found some **${this.global.toFancyNum(
				rewardCount
			)} ${this.config.emoji.shards} Weapon Shards** in your candy bag!`,
			rewardSql: `INSERT INTO shards (uid,count) VALUES (${uid},${rewardCount}) ON DUPLICATE KEY UPDATE count = count + ${rewardCount};`,
		};
	} else if (rand <= 0.45) {
		// Lootbox
		let rewardCount = 1;
		rewardCount = Math.floor(rewardCount + Math.random() * 2);
		return {
			rewardTxt: `You look through your bag of candies, but suprise! You found **${rewardCount} ${
				this.config.emoji.lootbox
			} Lootbox${rewardCount > 1 ? 'es' : ''}** instead!`,
			rewardSql: `INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
		};
	} else if (rand <= 0.6) {
		// Crate
		let rewardCount = 1;
		rewardCount = Math.floor(rewardCount + Math.random() * 2);
		return {
			rewardTxt: `You look through your bag of candies, but suprise! You found **${rewardCount} ${
				this.config.emoji.crate
			} Weapon Crate${rewardCount > 1 ? 's' : ''}** instead!`,
			rewardSql: `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${rewardCount},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
		};
	} else if (rand <= 0.75) {
		// Cookie
		return {
			rewardTxt: `You try to eat a piece of candy. Huh? It’s just a cookie in a wrapper! You got an extra **${this.config.emoji.cookie} Cookie** for your profile!`,
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
			rewardTxt: `You walk down a dark and creepy street. A tiny sparkle catches your eye! You found ${this.global.getA(
				gem.rank
			)} **${gem.emoji} ${gem.rank} ${gem.type} Gem**!`,
			rewardSql: gemSql,
		};
	} else {
		// Special Pet
		let animal = this.global.validAnimal('2023halloween_owo');
		return {
			rewardTxt: `You knock on a door and shout "Trick or Treat"! OwO? What's this? It's ${animal.value} OwO herself that oppened the door!`,
			rewardSql: `INSERT INTO animal (count, totalcount, id, name) VALUES (1,1,${id},'${animal.value}')
					ON DUPLICATE KEY UPDATE count = count + 1, totalcount = totalcount + 1;
					INSERT INTO animal_count (id, ${animal.rank}) VALUES (${id}, 1)
					ON DUPLICATE KEY UPDATE ${animal.rank} = ${animal.rank} + 1;`,
		};
	}
}
