/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['deleteuser'],

	owner: true,

	execute: async function (p) {
		const id = p.args[0];
		const user = p.fetch.getUser(id);
		if (!user || !id) {
			p.errorMsg(', could not find user');
			return;
		}
		const uid = await p.global.getUid(id);
		if (!uid) {
			p.errorMsg(', could not find user');
			return;
		}

		const sql = `
			DELETE pta FROM pet_team_animal pta INNER JOIN animal a ON pta.pid = a.pid WHERE a.id = ${id};
			DELETE FROM animal WHERE id = ${id};
			DELETE FROM transaction WHERE sender = ${id};
			DELETE FROM cowoncy WHERE id = ${id};
			DELETE FROM animal_count WHERE id = ${id};
			DELETE FROM autohunt WHERE id = ${id};
			DELETE FROM blackjack WHERE id = ${id};
			DELETE FROM cowoncy WHERE id = ${id};
			DELETE FROM lootbox WHERE id = ${id};
			DELETE FROM lottery WHERE id = ${id};
			DELETE FROM luck WHERE id = ${id};
			DELETE FROM rep WHERE id = ${id};
			DELETE FROM vote WHERE id = ${id};
			DELETE FROM user_pray WHERE sender = ${id};
			DELETE FROM user_pray WHERE receiver= ${id};
			DELETE FROM battle_settings WHERE uid = ${uid};
			DELETE FROM crate WHERE uid = ${uid};
			DELETE FROM emoji_steal WHERE uid = ${uid};
			DELETE FROM pet_team_active WHERE uid = ${uid};
			DELETE FROM pet_team WHERE uid = ${uid};
			DELETE FROM quest WHERE uid = ${uid};
			DELETE FROM rules WHERE uid = ${uid};
			DELETE FROM shards WHERE uid = ${uid};
			DELETE FROM user_announcement WHERE uid = ${uid};
			DELETE FROM user_backgrounds WHERE uid = ${uid};
			DELETE FROM user_battle WHERE user1 = ${uid};
			DELETE FROM user_battle WHERE user2 = ${uid};
			DELETE FROM user_gem WHERE uid = ${uid};
			DELETE FROM user_level_rewards WHERE uid = ${uid};
			DELETE FROM user_profile WHERE uid = ${uid};
			DELETE FROM user_ring WHERE uid = ${uid};
			DELETE FROM user_survey WHERE uid = ${uid};
			DELETE FROM timers WHERE uid = ${uid};
			DELETE FROM user WHERE id = ${uid};
		`;
		const result = await p.query(sql);
		console.log(result);

		console.log(await p.redis.del(id));
		console.log(await p.redis.del('xplimit_' + id));
		console.log(await p.redis.del('data_' + id));
		console.log(await p.redis.zrem('user_xp', id));
	},
});
