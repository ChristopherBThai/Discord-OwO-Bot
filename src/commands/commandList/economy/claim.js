/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const giftEmoji = '🎁';

module.exports = new CommandInterface({
	alias: ['claim', 'reward', 'compensation'],

	args: '',

	desc: 'Claim rewards! (If there are any c:)',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['economy'],

	cooldown: 15000,

	execute: async function (p) {
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
			p.errorMsg(', there are no rewards available at this time!', 5000);
			return;
		}

		const uid = result[1][0].uid;
		if (!uid) {
			p.errorMsg(', Failed to claim rewards', 5000);
			return;
		}

		// parse rewards
		let totalRewards = 0;
		let totalCowoncy = 0;
		let totalLootbox = 0;
		let totalFabledLootbox = 0;
		let totalWeaponCrate = 0;
		for (let i in result[0]) {
			let row = result[0][i];
			sql = `INSERT IGNORE INTO user_compensation (uid, cid) VALUES (${uid}, ${row.id});`;
			let result2 = await p.query(sql);

			if (result2.affectedRows) {
				sql = '';
				totalRewards++;
				const rewards = row.reward.split(',');
				rewards.forEach((reward) => {
					const type = reward.charAt(0);
					const count = parseInt(reward.substring(1));
					switch (type) {
						case 'c':
							sql += `INSERT INTO cowoncy (id, money) VALUES (${p.msg.author.id}, ${count}) ON DUPLICATE KEY UPDATE money = money + ${count};`;
							totalCowoncy += count;
							break;
						case 'l':
							sql += `INSERT INTO lootbox (id,boxcount,claimcount,claim) VALUES (${p.msg.author.id},${count},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
							totalLootbox += count;
							break;
						case 'w':
							sql += `INSERT INTO crate (uid,cratetype,boxcount,claimcount,claim) VALUES (${uid},0,${count},0,'2017-01-01') ON DUPLICATE KEY UPDATE boxcount = boxcount + ${count};`;
							totalWeaponCrate += count;
							break;
						case 'f':
							sql += `INSERT INTO lootbox (id,fbox,claimcount,claim) VALUES (${p.msg.author.id},${count},0,'2017-01-01') ON DUPLICATE KEY UPDATE fbox = fbox + ${count};`;
							totalFabledLootbox += count;
							break;
					}
				});
				await p.query(sql);
			}
		}

		if (!totalRewards) {
			p.errorMsg(', Failed to claim rewards', 5000);
			return;
		}
		let txt = `, You claimed ${totalRewards} reward(s)! 🎉\n`;
		txt += `${p.config.emoji.blank} **|** `;
		let rewardTxt = [];
		if (totalCowoncy) {
			rewardTxt.push(`+${totalCowoncy} ${p.config.emoji.cowoncy}`);
		}
		if (totalWeaponCrate) {
			rewardTxt.push(`+${totalWeaponCrate} ${p.config.emoji.crate}`);
		}
		if (totalLootbox) {
			rewardTxt.push(`+${totalLootbox} ${p.config.emoji.lootbox}`);
		}
		if (totalFabledLootbox) {
			rewardTxt.push(`+${totalFabledLootbox} ${p.config.emoji.fabledLootbox}`);
		}
		txt += rewardTxt.join(',');
		await p.replyMsg(giftEmoji, txt);
	},
});
