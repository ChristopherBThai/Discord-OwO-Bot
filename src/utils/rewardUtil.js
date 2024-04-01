/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const pluralize = require('pluralize');

const config = require('../data/config.json');
const rings = require('../data/rings.json');
const global = require('./global.js');
const itemUtil = require('../commands/commandList/shop/util/itemUtil.js');
const weaponUtil = require('../commands/commandList/battle/util/weaponUtil.js');
const lootboxUtil = require('../commands/commandList/zoo/lootboxUtil.js');
const beehiveUtil = require('../commands/commandList/social/util/beehiveUtil.js');

exports.getReward = async function (id, uid, con, rewardType, rewardId, rewardCount) {
	let sql, result, name, animal, weapon, item, ring, gem, gemSql, bee, specialGems, gemId;

	switch (rewardType) {
		case 'wallpaper':
			// Check if user has reward
			sql = `SELECT * FROM backgrounds WHERE bid = ${rewardId};
					SELECT * FROM user_backgrounds WHERE uid = ${uid} AND bid = ${rewardId};`;
			result = await con.query(sql);
			if (result[1][0]) {
				return null;
			}
			name = result[0][0].bname;
			return {
				text: `a ${config.emoji.wallpaper} "${name}" Wallpaper`,
				sql: `INSERT INTO user_backgrounds (uid, bid) VALUES (${uid}, ${rewardId}); `,
			};

		case 'animal':
			animal = global.validAnimal(rewardId);
			return {
				text: `a ${animal.value} ${animal.name}`,
				emoji: animal.value,
				name: animal.name,
				sql: `INSERT INTO animal (count, totalcount, id, name) VALUES (1,1,${id},'${animal.value}')
						ON DUPLICATE KEY UPDATE count = count + 1, totalcount = totalcount + 1;
						INSERT INTO animal_count (id, ${animal.rank}) VALUES (${id}, 1)
						ON DUPLICATE KEY UPDATE ${animal.rank} = ${animal.rank} + 1;`,
			};
		case 'lb':
			return {
				text: `a ${config.emoji.lootbox} Lootbox`,
				count: rewardCount,
				emoji: config.emoji.lootbox,
				plural: pluralize('Lootbox', rewardCount),
				sql: `INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
			};
		case 'flb':
			return {
				text: `a ${config.emoji.fabledLootbox} Fabled Lootbox`,
				count: rewardCount,
				emoji: config.emoji.fabledLootbox,
				plural: pluralize('Lootbox', rewardCount),
				sql: `INSERT INTO lootbox (id,fbox,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE fbox = fbox + ${rewardCount};`,
			};
		case 'wc':
			return {
				text: `a ${config.emoji.crate} Weapon Crate`,
				count: rewardCount,
				emoji: config.emoji.crate,
				plural: pluralize('Crate', rewardCount),
				sql: `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
			};
		case 'cowoncy':
			return {
				text: `${global.toFancyNum(rewardCount)} ${config.emoji.cowoncy} Cowoncy`,
				count: global.toFancyNum(rewardCount),
				emoji: config.emoji.cowoncy,
				sql: `INSERT INTO cowoncy (id,money) VALUES (${id}, ${rewardCount})
						ON DUPLICATE KEY UPDATE money = money + ${rewardCount};`,
			};
		case 'item':
			item = itemUtil.getByName(rewardId);
			return {
				text: `${rewardCount} ${item.emoji} ${pluralize(item.name, rewardCount)}`,
				sql: `INSERT INTO user_item (uid, name, count) VALUES 
						(${uid}, '${rewardId}', ${rewardCount}) ON DUPLICATE KEY UPDATE
						count = count + ${rewardCount}`,
			};
		case 'weapon':
			weapon = weaponUtil.getRandomWeapons(1, rewardId)[0];
			await weapon.save(id);
			return {
				text: `${global.getA(weapon.rank.name)} \`${weapon.shortenUWID}\` ${weapon.rank.emoji} ${
					weapon.emoji
				} ${weapon.rank.name} ${weapon.name}`,
			};
		case 'ws':
			return {
				text: `${global.toFancyNum(rewardCount)} ${config.emoji.shards} Weapon Shards`,
				count: global.toFancyNum(rewardCount),
				emoji: config.emoji.shards,
				sql: `INSERT INTO shards (uid,count) VALUES (${uid},${rewardCount}) ON DUPLICATE KEY UPDATE count = count + ${rewardCount};`,
			};
		case 'essence':
			return {
				text: `${global.toFancyNum(rewardCount)} ${config.emoji.essence} Animal Essences`,
				sql: `INSERT INTO autohunt (id, essence) VALUES (${id}, ${rewardCount}) ON DUPLICATE KEY UPDATE essence = essence + ${rewardCount};`,
			};
		case 'ring':
			ring = rings[rewardId];
			return {
				text: `${global.toFancyNum(rewardCount)} ${ring.emoji} ${pluralize(
					ring.name,
					rewardCount
				)}`,
				sql: `INSERT INTO user_ring (uid,rid,rcount) VALUES (${uid},${rewardId},${rewardCount}) ON DUPLICATE KEY UPDATE rcount = rcount + ${rewardCount};`,
			};
		case 'gem':
			gem = lootboxUtil.getRandomGems(uid, 1, { gid: rewardId });
			gemSql = gem.sql;
			gem = Object.values(gem.gems)[0].gem;
			return {
				text: `${global.getA(gem.rank)} ${gem.emoji} ${gem.rank} ${gem.type} Gem`,
				sql: gemSql,
			};
		case 'sgem':
			specialGems = [79, 80, 81, 82, 83, 84, 85];
			gemId = specialGems[Math.floor(Math.random() * specialGems.length)];
			gem = lootboxUtil.getRandomGems(uid, 1, { gid: gemId });
			gemSql = gem.sql;
			gem = Object.values(gem.gems)[0].gem;
			return {
				text: `${global.getA(gem.rank)} ${gem.emoji} ${gem.rank} ${gem.type} Gem`,
				rank: gem.rank,
				emoji: gem.emoji,
				type: gem.type,
				sql: gemSql,
			};
		case 'bee':
			bee = await beehiveUtil.addBee(id, rewardId);
			return {
				text: `${global.getA(bee.bee.name)} ${bee.bee.name} Bee`,
				nextLine: `${bee.bee.emoji} **|** "*${bee.bee.text}*"${
					bee.count > 1
						? ''
						: `\n${config.emoji.blank} **|** Type \`owo beehive\` to view your bees!`
				}`,
			};
		case 'cookie':
			return {
				text: `${rewardCount} ${config.emoji.cookie} ${pluralize('Cookie', rewardCount)}`,
				count: rewardCount,
				emoji: config.emoji.cookie,
				plural: pluralize('Cookie', rewardCount),
				sql: `INSERT INTO rep (id, count) VALUES (${id},${rewardCount}) ON DUPLICATE KEY UPDATE count = count + ${rewardCount};`,
			};

		default:
			throw 'Invalid reward type: ' + rewardType;
	}
};
