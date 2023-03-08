/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const maxBet = 150000;

module.exports = new CommandInterface({
	alias: ['lottery', 'bet', 'lotto'],

	args: '{amount}',

	desc: 'Bet your money in the lottery! The more money you bet, the higher the chance to win!\nThe lottery ends at 12am PST everyday!',

	example: ['owo lottery 1000'],

	related: ['owo money'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['gambling'],

	cooldown: 5000,
	half: 80,
	six: 500,

	execute: function (p) {
		if (p.args.length > 0) bet(p.con, p.msg, p.args, p.global, p);
		else display(p.con, p.msg, p);
	},
});

async function bet(con, msg, args, global, p) {
	let amount = 0;
	let all = false;
	if (args.length == 1 && global.isInt(args[0])) amount = parseInt(args[0]);
	else if (args.length == 1 && args[0] == 'all') {
		all = true;
	} else {
		p.errorMsg(', wrong arguments! >:c', 3000);
		return;
	}

	if (amount == 0 && !all) {
		p.errorMsg(', You bet... nothing?', 3000);
		return;
	} else if (amount < 0 && !all) {
		p.errorMsg(', Do you understand how lotteries work...?', 3000);
		return;
	}

	let sql = 'SELECT money FROM cowoncy WHERE id = ' + msg.author.id + ';';
	sql += 'SELECT * FROM lottery WHERE id = ' + msg.author.id + ' AND valid = 1;';
	let result = await p.query(sql);
	if (!result[0][0] || result[0][0].money < amount) {
		p.errorMsg(", You don't have enough cowoncy!", 3000);
		return;
	} else {
		if (all) amount = parseInt(result[0][0].money);

		let prevBet = 0;
		if (result[1][0]) prevBet = result[1][0].amount;
		if (prevBet >= maxBet) {
			p.errorMsg(', You can only bet up to ' + p.global.toFancyNum(maxBet) + ' cowoncy!', 3000);
			return;
		}

		if (amount > maxBet - prevBet) amount = maxBet - prevBet;
		sql =
			'INSERT INTO lottery (id,channel,amount,valid) VALUES (' +
			msg.author.id +
			',' +
			msg.channel.id +
			',' +
			amount +
			',1) ON DUPLICATE KEY UPDATE amount = amount +' +
			amount +
			', valid = 1, channel = ' +
			msg.channel.id +
			';' +
			'SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;' +
			'UPDATE cowoncy SET money = money - ' +
			amount +
			' WHERE id = ' +
			msg.author.id +
			';';
		result = await p.query(sql);

		p.logger.decr('cowoncy', -1 * amount, { type: 'lottery' }, p.msg);

		let sum = parseInt(result[1][0].sum);
		let bet = prevBet + amount;
		let chance = (bet / sum) * 100;
		if (chance >= 0.01) chance = Math.trunc(chance * 100) / 100;

		let embed = {
			description: 'Lottery ends once a day! The maximum lottery submission is 150K cowoncy!',
			color: p.config.embed_color,
			timestamp: new Date(),
			footer: {
				icon_url:
					'https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png',
				text: '*Percentage and jackpot may change over time',
			},
			author: {
				name: msg.author.username + "'s Lottery Submission",
			},
			fields: [
				{
					name: 'You added',
					value: '```fix\n' + p.global.toFancyNum(amount) + ' Cowoncy```',
					inline: true,
				},
				{
					name: 'Your Total Submission',
					value: '```fix\n' + p.global.toFancyNum(bet) + ' Cowoncy```',
					inline: true,
				},
				{
					name: 'Winning Chance',
					value: '```fix\n' + chance + '%```',
					inline: true,
				},
				{
					name: 'Current Jackpot',
					value: '```fix\n' + p.global.toFancyNum(sum + 500) + ' Cowoncy```',
					inline: true,
				},
				{
					name: 'Ends in',
					value: '```fix\n' + getTimeLeft() + '```',
					inline: true,
				},
			],
		};
		p.send({ embed });
	}
}

async function display(con, msg, p) {
	let sql =
		'SELECT SUM(amount) AS sum,COUNT(id) AS count FROM lottery WHERE valid = 1;' +
		'SELECT * FROM lottery WHERE id = ' +
		msg.author.id +
		' AND valid = 1;';
	let result = await p.query(sql);
	let sum = 0;
	let count = 0;
	if (result[0][0].sum != undefined) {
		sum = parseInt(result[0][0].sum);
		count = result[0][0].count;
	}

	let bet = 0;
	let chance = 0;
	if (result[1][0] != undefined) {
		bet = result[1][0].amount;
		if (sum != 0) {
			chance = (bet / sum) * 100;
			if (chance >= 0.01) chance = Math.trunc(chance * 100) / 100;
		} else chance = 100;
	}

	let embed = {
		description: 'Lottery ends every day at 12AM PST! Good Luck!!',
		color: 4886754,
		timestamp: new Date(),
		footer: {
			icon_url:
				'https://cdn.discordapp.com/app-icons/408785106942164992/00d934dce5e41c9e956aca2fd3461212.png',
			text: '*Percentage and jackpot may change over time',
		},
		author: {
			name: msg.author.username + "'s Lottery Status",
		},
		fields: [
			{
				name: 'Your Total Submission',
				value: '```fix\n' + p.global.toFancyNum(bet) + ' Cowoncy```',
				inline: true,
			},
			{
				name: 'Winning Chance',
				value: '```fix\n' + chance + '%```',
				inline: true,
			},
			{
				name: 'Number of Risk Takers',
				value: '```fix\n' + p.global.toFancyNum(count) + ' users```',
				inline: true,
			},

			{
				name: 'Current Jackpot',
				value: '```fix\n' + p.global.toFancyNum(sum + 500) + ' Cowoncy```',
				inline: true,
			},
			{
				name: 'Ends in',
				value: '```fix\n' + getTimeLeft() + '```',
				inline: true,
			},
		],
	};
	p.send({ embed });
}

/**
 * Time left in the lottery
 */
function getTimeLeft() {
	var now = new Date();
	var mill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 24, 0, 0, 0) - now;
	if (mill < 0) {
		mill += 86400000;
	}
	mill = Math.trunc(mill / 1000);
	var sec = mill % 60;
	mill = Math.trunc(mill / 60);
	var min = mill % 60;
	mill = Math.trunc(mill / 60);
	var hour = mill % 60;
	return hour + 'h ' + min + 'm ' + sec + 's';
}
