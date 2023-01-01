/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['db', 'declinebattle'],

	args: '',

	desc: 'Decline a battle request!',

	example: [''],

	related: ['owo battle'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: async function (p) {
		const author = p.opt?.author || p.msg.author;
		let sql = `SELECT u1.id as user1,u2.id as user2 FROM user_battle
				LEFT JOIN user u1 ON user_battle.user1 = u1.uid
				LEFT JOIN user u2 ON user_battle.user2 = u2.uid
			WHERE
				TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
					u1.id = ${author.id} OR
					u2.id = ${author.id}
				);`;
		sql += `UPDATE user_battle SET time = '2018-01-01' WHERE
			TIMESTAMPDIFF(MINUTE,time,NOW()) < 10 AND (
				user1 = (SELECT uid FROM user WHERE id = ${author.id}) OR
				user2 = (SELECT uid FROM user WHERE id = ${author.id})
			);`;
		let result = await p.query(sql);

		if (!result[0][0] || result[1].changedRows == 0) {
			p.errorMsg(', You do not have any pending battles!', 3000);
			return;
		}

		/* Get opponent name */
		let user = result[0][0];
		if (user.user1 == author.id) user = user.user2;
		else user = user.user1;
		user = await p.fetch.getUser(user);
		if (!user) user = 'an opponent';

		p.replyMsg('⚔', `, You have declined your battle with **${user.username}**`);
	},
});
