/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const giftEmoji = '🎁';

module.exports = new CommandInterface({

	alias:["claim", "reward", "compensation"],

	args:"",

	desc:"Claim rewards! (If there are any c:)",

	example:[],

	related:[],

	permissions:["sendMessages", "embedLinks"],

	group:["economy"],

	cooldown:15000,

	execute: async function(p){
		// Fetch user and compensation info
		let sql = ` SELECT c.*
			FROM compensation c
				LEFT JOIN (
					SELECT uc.cid, uc.uid FROM user_compensation uc
						INNER JOIN user u ON uc.uid = u.uid
					WHERE id = ${p.msg.author.id} 
				) temp ON c.id = temp.cid
			WHERE end_date > NOW()
				AND temp.uid IS NULL;`;
		sql += `SELECT uid FROM user WHERE id = ${p.msg.author.id};`;
		let result = await p.query(sql);

		// No rewards available
		if (!result[0].length) {
			p.errorMsg(", there are no rewards available at this time!", 5000);
			return;
		}

		const uid = result[1][0].uid;
		if (!uid) {
			p.errorMsg(", Failed to claim rewards", 5000);
			return;
		}

		// parse rewards
		sql = ' INSERT INTO user_compensation (uid, cid) VALUES ';
		let sqlValues = [];
		let weaponCrate = 0;
		let cowoncy = 0;
		let lootbox = 0;
		result[0].forEach(row => {
			const rewards = row.reward.split(',');
			sqlValues.push(`(${uid},${row.id})`);
			rewards.forEach(reward => {
				const type = reward.charAt(0);
				const count = parseInt(reward.substring(1));
				switch (type) {
					case 'c':
						cowoncy += count;
						break;
					case 'l':
						lootbox += count;
						break;
					case 'w':
						weaponCrate += count;
						break;
					default:
						p.errorMsg(", Failed to claim rewards", 5000);
						throw "Invalid reward type"
				}
			});
		});
		sql += sqlValues.join(',') + ';';

		let txt = `, You claimed ${result[0].length} reward(s)! 🎉\n`
		txt += `${p.config.emoji.blank} **|** `;
		rewardTxt = [];
		if (cowoncy) {
			sql += `INSERT INTO cowoncy (id, money) VALUES (${p.msg.author.id}, ${cowoncy}) ON DUPLICATE KEY UPDATE money = money + ${cowoncy};`;
			rewardTxt.push(`+${cowoncy} ${p.config.emoji.cowoncy}`);
		}
		if (weaponCrate) {
			sql += `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${weaponCrate},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${weaponCrate};`;
			rewardTxt.push(`+${weaponCrate} ${p.config.emoji.crate}`);
		}
		if (lootbox) {
			sql += `INSERT INTO lootbox(id,boxcount,claimcount,claim) VALUES (${p.msg.author.id},${lootbox},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${lootbox};`;
			rewardTxt.push(`+${lootbox} ${p.config.emoji.lootbox}`);
		}
		txt += rewardTxt.join(',');

		await p.query(sql);
		await p.replyMsg(giftEmoji, txt);
	}

})
