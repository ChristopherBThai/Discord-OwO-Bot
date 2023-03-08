/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const rings = require('../../../data/rings.json');
const hearts = [
	'❤',
	'💛',
	'💚',
	'💙',
	'💜',
	'❣',
	'💕',
	'💞',
	'💓',
	'💗',
	'💖',
	'💘',
	'💝',
	'💟',
	'🎊',
	'🎉',
	'🎀',
	'🎁',
];

module.exports = new CommandInterface({
	alias: ['acceptmarriage', 'am'],

	args: '',

	desc: 'Accept a marriage proposal.',

	example: [],

	related: ['owo marry', 'owo dm'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['social'],

	cooldown: 3000,

	execute: async function (p) {
		// Get and delete a proposal request
		let sql = `SELECT 
				(SELECT uid FROM user WHERE id = sender) AS sender_uid,
				(SELECT uid FROM user WHERE id = receiver) AS receiver_uid,
				propose.* 
			FROM propose WHERE receiver = ${p.msg.author.id}; 
			DELETE FROM propose WHERE receiver = ${p.msg.author.id};`;
		let result = await p.query(sql);

		// If there is one...
		if (result[0].length > 0 && result[1].affectedRows > 0) {
			// Grab user info
			let sender = await p.fetch.getUser(result[0][0].sender);

			//Insert the users and ring into the marriage database
			let uid1 = result[0][0]['sender_uid'];
			let uid2 = result[0][0]['receiver_uid'];
			if (uid1 > uid2) {
				let temp = uid1;
				uid1 = uid2;
				uid2 = temp;
			}
			let ring = rings[result[0][0].rid];
			sql = `INSERT INTO marriage (uid1,uid2,rid) VALUES (${uid1},${uid2},${ring.id});`;
			result = await p.query(sql);
			if (result.affectedRows == 0) {
				p.errorMsg(', it seems like something went wrong...');
				return;
			}

			// Tell the user we have acceptedthe marriage request
			if (!sender) {
				p.replyMsg(ring.emoji, ', congratulations!! You are now married!');
			} else {
				let heart = [
					hearts[Math.trunc(Math.random() * hearts.length)],
					hearts[Math.trunc(Math.random() * hearts.length)],
					hearts[Math.trunc(Math.random() * hearts.length)],
				];
				p.replyMsg(
					ring.emoji,
					' and **' + sender.username + '** are now married! Congratulations!! ' + heart.join(' ')
				);
			}
		} else {
			p.errorMsg(', you do not have any pending marriage proposals!', 3000);
		}
	},
});
