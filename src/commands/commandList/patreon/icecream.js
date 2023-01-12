/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const icecreamEmoji = '🍨';
const lord = '520399213683671074';
const words = [
	'Brain freeze!!!',
	'Yum!',
	'Delicious!',
	'*Drools...*',
	'Lucky!!',
	':0',
	'Yummy!',
	'Gimme gimme!',
];

module.exports = new CommandInterface({
	alias: ['icecream'],

	args: '{@user}',

	desc: 'Give an ice cream to someone! You can only gain ice cream if you receive it! This command was created by Łord',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.args.length == 0) {
			display(p);
			p.setCooldown(5);
		} else {
			let user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
				if (!user) {
					p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
			if (user.id == p.msg.author.id) {
				p.errorMsg(', You cannot give ice cream to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let sql = `SELECT icecream.count FROM user LEFT JOIN icecream ON user.uid = icecream.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	let count = 0;
	if (result[0] && result[0].count) count = result[0].count;

	p.replyMsg(icecreamEmoji, ', You currently have **' + count + '** scoops of ice cream to give!');
}

async function give(p, user) {
	if (p.msg.author.id != lord) {
		// Subtract icecream
		let sql = `UPDATE user LEFT JOIN icecream ON user.uid = icecream.uid SET icecream.count = icecream.count -1 WHERE id = ${p.msg.author.id} AND icecream.count>0;`;
		let result = await p.query(sql);

		// Error checking
		if (result.changedRows == 0) {
			p.errorMsg(', you do not have any ice cream! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	// Add two scoops
	let sql = `INSERT IGNORE INTO icecream (uid,count) VALUES ((SELECT uid FROM user WHERE id = ${user.id}),2) ON DUPLICATE KEY UPDATE count = count + 2;`;
	let result = await p.query(sql);
	if (result.warningCount > 0) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${user.id},0);${sql}`;
		await p.query(sql);
	}

	p.replyMsg(
		icecreamEmoji,
		', you gave two scoops of ice cream to **' +
			user.username +
			'**! ' +
			words[Math.floor(Math.random() * words.length)]
	);
}
