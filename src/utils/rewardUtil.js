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

exports.getReward = async function (id, uid, con, rewardType, rewardId, rewardCount) {
	let sql, result, name, animal, weapon, uwid, weaponId, uwidList, item, ring;
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
				sql: `INSERT INTO animal (count, totalcount, id, name) VALUES (1,1,${id},'${animal.value}')
						ON DUPLICATE KEY UPDATE count = count + 1, totalcount = totalcount + 1;
						INSERT INTO animal_count (id, ${animal.rank}) VALUES (${id}, 1)
						ON DUPLICATE KEY UPDATE ${animal.rank} = ${animal.rank} + 1;`,
			};
		case 'lb':
			return {
				text: `a ${config.emoji.lootbox} Lootbox`,
				sql: `INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
			};
		case 'flb':
			return {
				text: `a ${config.emoji.fabledLootbox} Fabled Lootbox`,
				sql: `INSERT INTO lootbox (id,fbox,claimcount,claim) VALUES (${id},${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE fbox = fbox + ${rewardCount};`,
			};
		case 'wc':
			return {
				text: `a ${config.emoji.crate} Weapon Crate`,
				sql: `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${rewardCount},0,'2017-01-01')
						ON DUPLICATE KEY UPDATE boxcount = boxcount + ${rewardCount};`,
			};
		case 'cowoncy':
			return {
				text: `${global.toFancyNum(rewardCount)} ${config.emoji.cowoncy} Cowoncy`,
				sql: `INSERT INTO cowoncy (id,money) VALUES (${id}, ${rewardCount})
						ON DUPLICATE KEY UPDATE money = money + ${rewardCount};`,
			};
		case 'item':
			item = itemUtil.getByName(rewardId);
			console.log(rewardId);
			console.log(item);
			return {
				text: `${rewardCount} ${item.emoji} ${pluralize(item.name, rewardCount)}`,
				sql: `INSERT INTO user_item (uid, name, count) VALUES 
						(${uid}, '${rewardId}', ${rewardCount}) ON DUPLICATE KEY UPDATE
						count = count + ${rewardCount}`,
			};
		case 'weapon':
			weapon = weaponUtil.getRandomWeapons(uid, 1, rewardId)[0];
			result = await con.query(weapon.weaponSql);
			uwid = result.insertId;
			weapon.uwid = uwid;
			uwidList = [];
			for (let j = 0; j < weapon.passives.length; j++) uwidList.push(uwid);
			await con.query(weapon.passiveSql, uwidList);
			weaponId = weaponUtil.shortenUWID(weapon.uwid);
			return {
				text: `a(n) \`${weaponId}\` ${weapon.rank.emoji} ${weapon.emoji} ${weapon.rank.name} ${weapon.name}`,
			};
		case 'ws':
			return {
				text: `${global.toFancyNum(rewardCount)} ${config.emoji.shards} Weapon Shards`,
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
		default:
			throw 'Invalid reward type: ' + rewardType;
	}
};
