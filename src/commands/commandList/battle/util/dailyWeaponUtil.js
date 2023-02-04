/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const redis = require('../../../../utils/redis.js');
const WeaponInterface = require('../WeaponInterface.js');
const weaponUtil = require('./weaponUtil.js');
const dateUtil = require('../../../../utils/dateUtil.js');
const cartEmoji = '🛒';
const crateId = (exports.crateId = 100);
const cratePrice = (exports.cratePrice = 40);
const crateEmoji = '<:crate:523771259302182922>';
const shardEmoji = '<:weaponshard:655902978712272917>';
const weaponCount = 10;
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';
const redisKey = 'dailyWeapons';
const markupPrices = {};
for (let i in weaponUtil.shardPrices) {
	markupPrices[i] = Math.round(weaponUtil.shardPrices[i] * 2.5);
}

const qualityAvg = 70; // must be greater than 50
const maxQuality = 100;
const minQuality = qualityAvg * 2 - maxQuality;

const getDailyWeapons = (exports.getDailyWeapons = async function (p) {
	let dailyWeapons = [];
	let weapons = await redis.hgetall(redisKey);
	let weaponKeys = Object.keys(weapons);
	let weaponKeyResults = weaponKeys.map((id) => id + '' + p.msg.author.id);
	weaponKeyResults = await redis.hmget(redisKey + 'Purchased', weaponKeyResults);
	let purchased = {};
	for (let i in weaponKeys) {
		purchased[weaponKeys[i]] = weaponKeyResults[i];
	}

	for (let i in weapons) {
		let weaponJson = JSON.parse(weapons[i]);
		let passives = [];
		for (let j in weaponJson.passives) {
			let passiveJson = weaponJson.passives[j];
			let passive = WeaponInterface.allPassives[passiveJson.wpid];
			passive = new passive(passiveJson.qualities);
			passives.push(passive);
		}
		let weapon = WeaponInterface.weapons[weaponJson.wid];
		weapon = new weapon(passives, weaponJson.qualities);
		weapon.shopID = i;
		weapon.shardPrice = markupPrices[weapon.rank.name];
		weapon.purchased = !!purchased[i];
		dailyWeapons.push(weapon);
	}

	return dailyWeapons;
});

exports.resetDailyWeapons = async function () {
	let jsonWeapons = {};

	for (let i = 101; i < 101 + weaponCount; i++) {
		let weapon = weaponUtil.getRandomWeapon();

		let wid = weapon.id;
		let qualities = weapon.qualities;
		for (let j in qualities) {
			qualities[j] = Math.floor(Math.random() * (maxQuality - minQuality + 1)) + minQuality;
		}

		let passives = [];
		for (let j in weapon.passives) {
			let qualities = weapon.passives[j].qualities;
			let wpid = weapon.passives[j].id;
			for (let k in qualities) {
				qualities[k] = Math.floor(Math.random() * (maxQuality - minQuality + 1)) + minQuality;
			}
			passives.push({ wpid, qualities });
		}

		jsonWeapons[i] = JSON.stringify({ wid, qualities, passives });
	}

	await redis.del(redisKey);
	await redis.del(redisKey + 'Purchased');
	await redis.hmset(redisKey, jsonWeapons);
};

exports.buy = async function (p, id) {
	// Purchase weapon crate
	if (id === crateId) {
		if (await useShards(p, cratePrice)) {
			try {
				let sql = `INSERT INTO crate(uid,cratetype,boxcount,claimcount,claim) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),0,1,0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + 1;`;
				await p.query(sql);
			} catch (err) {
				console.error(err);
				p.errorMsg('Failed to add a Weapon Crate to your inventory');
				return;
			}
			p.replyMsg(
				cartEmoji,
				', you purchased a **' +
					crateEmoji +
					' Weapon Crate** for **' +
					cratePrice +
					' ' +
					shardEmoji +
					' Weapon Shards**'
			);
		} else {
			p.errorMsg(", You don't have enough Weapon Shards!", 3000);
		}
		return;
	}

	// Check if purchased already
	let purchased = await redis.hmget(redisKey + 'Purchased', [id + '' + p.msg.author.id]);
	if (purchased[0]) {
		p.errorMsg(', You already purchased this weapon, silly!', 3000);
		return;
	}

	// Get weapon
	let weapons = await redis.hgetall(redisKey);
	if (!weapons[id]) {
		p.errorMsg(', what are you trying to buy...?', 3000);
		return;
	}
	let weaponJson = JSON.parse(weapons[id]);
	let passives = [];
	for (let i in weaponJson.passives) {
		let passiveJson = weaponJson.passives[i];
		let passive = WeaponInterface.allPassives[passiveJson.wpid];
		passive = new passive(passiveJson.qualities);
		passives.push(passive);
	}
	let weapon = WeaponInterface.weapons[weaponJson.wid];
	weapon = new weapon(passives, weaponJson.qualities);
	weapon.shopID = id;
	weapon.shardPrice = markupPrices[weapon.rank.name];

	if (!(await useShards(p, weapon.shardPrice))) {
		p.errorMsg(", You don't have enough Weapon Shards!", 3000);
		return;
	}

	let weaponEmojis = weapon.emoji;
	try {
		let weaponSql = `INSERT INTO user_weapon (uid,wid,stat,avg) VALUES ((SELECT uid FROM user WHERE id = ${p.msg.author.id}),${weapon.id},'${weapon.sqlStat}',${weapon.avgQuality});`;
		let result = await p.query(weaponSql);
		let uwid = result.insertId;
		weaponEmojis = '`' + weaponUtil.shortenUWID(uwid) + '` ' + weaponEmojis;
		let passiveSql = 'INSERT INTO user_weapon_passive (uwid,pcount,wpid,stat) VALUES ';
		for (let i = 0; i < weapon.passives.length; i++) {
			let tempPassive = weapon.passives[i];
			weaponEmojis += tempPassive.emoji;
			passiveSql += `(${uwid},${i},${tempPassive.id},'${tempPassive.sqlStat}'),`;
		}
		passiveSql = `${passiveSql.slice(0, -1)};`;
		await p.query(passiveSql);
	} catch (err) {
		console.error(err);
		p.errorMsg(', I failed to add the weapon to your inventory :(');
		return;
	}

	let redisValue = {};
	redisValue[id + '' + p.msg.author.id] = true;
	await redis.hmset(redisKey + 'Purchased', redisValue);
	await p.replyMsg(
		cartEmoji,
		`, you purchased **${weapon.shopID}** ${weaponEmojis} for **${weapon.shardPrice} ${shardEmoji} Weapon Shards**!`
	);
};

async function useShards(p, count) {
	/* check if enough shards */
	let sql = `UPDATE shards INNER JOIN user ON shards.uid = user.uid SET shards.count = shards.count - ${count} WHERE user.id = ${p.msg.author.id} AND shards.count >= ${count};`;
	let result = await p.query(sql);
	if (result.changedRows >= 1) {
		p.logger.decr('shards', -1 * count, { type: 'shop' }, p.msg);
		return true;
	}
	return false;
}

exports.displayShop = async function (p) {
	let weapons = await getDailyWeapons(p);

	let currentPage = 0;
	let embed = createEmbed(p, weapons, currentPage);
	let msg = await p.send({ embed });
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);

	let filter = (emoji, userID) =>
		[nextPageEmoji, prevPageEmoji].includes(emoji.name) && userID == p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	collector.on('collect', async function (emoji) {
		if (emoji.name === nextPageEmoji) {
			if (currentPage + 1 < weapons.length) currentPage++;
			else currentPage = 0;
		} else if (emoji.name === prevPageEmoji) {
			if (currentPage > 0) currentPage--;
			else currentPage = weapons.length - 1;
		}
		embed = createEmbed(p, weapons, currentPage);
		await msg.edit({ embed });
	});

	collector.on('end', async function (_collected) {
		embed.color = 6381923;
		await msg.edit({ content: 'This message is now inactive', embed });
	});
};

function createEmbed(p, weapons, page) {
	let weapon = weapons[page];
	/* Parse image url */
	let url = weapon.emoji;
	let temp;
	if ((temp = url.match(/:[0-9]+>/))) {
		temp = 'https://cdn.discordapp.com/emojis/' + temp[0].match(/[0-9]+/)[0] + '.';
		if (url.match(/<a:/)) temp += 'gif';
		else temp += 'png';
		url = temp;
	}

	/* Make description */
	let desc = `**Name:** ${weapon.name}\n`;
	desc += `**Shop ID:** ${weapon.shopID}\n`;
	if (weapon.purchased) desc += '**Price:** PURCHASED\n\n';
	else desc += `**Price:** ${weapon.shardPrice} ${shardEmoji}\n\n`;
	desc += `**Quality:** ${weapon.rank.emoji} ${weapon.avgQuality}%\n`;
	desc += `**WP Cost:** ${Math.ceil(weapon.manaCost)} <:wp:531620120976687114>`;
	desc += `\n**Description:** ${weapon.desc}\n`;
	if (weapon.buffList.length > 0) {
		desc += '\n';
		let buffs = weapon.getBuffs();
		for (let i in buffs) {
			desc += `${buffs[i].emoji} **${buffs[i].name}** - ${buffs[i].desc}\n`;
		}
	}
	if (weapon.passives.length <= 0) desc += '\n**Passives:** None';
	for (var i = 0; i < weapon.passives.length; i++) {
		let passive = weapon.passives[i];
		desc += `\n${passive.emoji} **${passive.name}** - ${passive.desc}`;
	}

	let timeUntil = dateUtil.afterMidnight();

	/* Construct embed */
	return {
		author: {
			name: "Today's Available Weapons",
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		thumbnail: {
			url: url,
		},
		description: desc,
		footer: {
			text:
				'Page ' +
				(page + 1) +
				'/' +
				weapons.length +
				' | Resets in: ' +
				timeUntil.hours +
				'H ' +
				timeUntil.minutes +
				'M ' +
				timeUntil.seconds +
				'S',
		},
	};
}
