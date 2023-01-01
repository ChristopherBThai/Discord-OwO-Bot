/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const declineEmoji = '💔';

module.exports = new CommandInterface({
	alias: ['declinemarriage', 'dm'],

	args: '',

	desc: 'Decline a marriage proposal.',

	example: [],

	related: ['owo marry', 'owo am'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['social'],

	cooldown: 3000,

	execute: async function (p) {
		// Get and delete a proposal request
		let sql = `SELECT * FROM propose WHERE sender = ${p.msg.author.id} OR receiver = ${p.msg.author.id}; 
			DELETE FROM propose WHERE sender = ${p.msg.author.id} OR receiver = ${p.msg.author.id};`;
		let result = await p.query(sql);

		// If there is one...
		if (result[0].length > 0 && result[1].affectedRows > 0) {
			// Tell the user we have declined the marriage request
			let user = result[0][0].sender;
			let preposition = 'from';
			if (user == p.msg.author.id) {
				user = result[0][0].receiver;
				preposition = 'to';
			}
			user = await p.fetch.getUser(user);
			if (!user) {
				p.replyMsg(declineEmoji, ', you have declined a marriage request!');
			} else {
				p.replyMsg(
					declineEmoji,
					', you have declined a marriage request ' + preposition + ' ' + user.username + '!'
				);
			}

			// Give the ring back to the sender
			let sender = result[0][0].sender;
			let ringId = result[0][0].rid;
			sql = `INSERT INTO user_ring (uid,rid,rcount) VALUES ((SELECT uid FROM user WHERE id = ${sender}),${ringId},1) ON DUPLICATE KEY UPDATE rcount = rcount + 1;`;
			await p.query(sql);
		} else {
			p.errorMsg(', you do not have any pending marriage proposals!', 3000);
		}
	},
});
