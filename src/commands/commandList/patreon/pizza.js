/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const pizzaEmoji = '🍕';
const cosmonaut = '207298141731422211';
const words = ['Yum!', 'Delicious!', '*Drools...*', 'Lucky!!', ':0', 'Yummy!'];

module.exports = new CommandInterface({
	alias: ['pizza'],

	args: '{@user}',

	desc: 'Give a pizza to someone! You can only gain pizza if you receive it! This command was created by Cosmonaut',

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
				p.errorMsg(', You cannot give pizza to yourself!!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let sql = `SELECT pizza.count FROM user LEFT JOIN pizza ON user.uid = pizza.uid WHERE id = ${p.msg.author.id};`;
	let result = await p.query(sql);

	let count = 0;
	if (result[0] && result[0].count) count = result[0].count;

	p.replyMsg(pizzaEmoji, ', You currently have **' + count + '** pizzas to give!');
}

async function give(p, user) {
	if (p.msg.author.id != cosmonaut) {
		// Subtract pizza
		let sql = `UPDATE user LEFT JOIN pizza ON user.uid = pizza.uid SET pizza.count = pizza.count -1 WHERE id = ${p.msg.author.id} AND pizza.count>0;`;
		let result = await p.query(sql);

		// Error checking
		if (result.changedRows == 0) {
			p.errorMsg(', you do not have any pizza! >:c', 3000);
			p.setCooldown(5);
			return;
		}
	}

	// Add two pizza
	let sql = `INSERT IGNORE INTO pizza (uid,count) VALUES ((SELECT uid FROM user WHERE id = ${user.id}),2) ON DUPLICATE KEY UPDATE count = count + 2;`;
	let result = await p.query(sql);
	if (result.warningCount > 0) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${user.id},0);${sql}`;
		await p.query(sql);
	}

	p.replyMsg(
		pizzaEmoji,
		', you gave two pizzas to **' +
			user.username +
			'**! ' +
			words[Math.floor(Math.random() * words.length)]
	);
}
