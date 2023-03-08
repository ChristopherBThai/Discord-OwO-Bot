/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const patreon = require('../../../botHandlers/patreonHandler.js');
var cowoncy = [
	'184587051943985152',
	'184587051943985152',
	'184587051943985152',
	'184587051943985152',
	'184587051943985152',
	'184587051943985152',
	'184587051943985152',
];

module.exports = new CommandInterface({
	alias: ['getpatreons', 'distributecowoncy'],

	owner: true,

	execute: async function (p) {
		if (p.command == 'getpatreons') {
			console.log('Starting fetching patreons...');
			await getPatreons(p);
		} else {
			await distributeCowoncy(p);
		}
	},
});

async function getPatreons(p) {
	let patreons;
	try {
		patreons = await patreon.request(p.args.join(' '));
	} catch (err) {
		console.error(err);
		return;
	}
	console.log(patreons);
	let result = [];
	if (p.args[0] != 'ignoresql') {
		let sql =
			'SELECT id FROM user INNER JOIN patreons ON user.uid = patreons.uid WHERE TIMESTAMPDIFF(MONTH,patreonTimer,NOW())<patreonMonths;';
		result = await p.query(sql);
	}

	let text = '';

	console.log('customized commands');
	if (patreons.customizedCommand.length) {
		text += '**Customized Command**\n';
		let list = patreons.customizedCommand;
		for (let i in list) {
			text += '<@' + list[i].discord + '> | **' + list[i].name + '** | ' + list[i].discord + '\n';
		}
	}

	console.log('custom commands');
	if (patreons.customCommand.length) {
		text += '\n**Custom Command**\n';
		let list = patreons.customCommand;
		for (let i in list) {
			text += '<@' + list[i].discord + '> | **' + list[i].name + '** | ' + list[i].discord + '\n';
		}
	}

	console.log('custom pet');
	let csv =
		'Discord Name,Discord ID,Patreon Name,Pet Name,hp str pr wp mag mr,Pet Desc,Pet ID,SQL\n';
	if (patreons.pet.length) {
		text += '\n**Custom Pet**\n';
		let list = patreons.pet;
		for (let i in list) {
			text += '<@' + list[i].discord + '> | **' + list[i].name + '** | ' + list[i].discord + '\n';
			let user = await p.fetch.getUser(list[i].discord);
			csv += (user ? user.username : 'A User') + ',' + list[i].discord + ',' + list[i].name + '\n';
		}
	}

	console.log('monthly cowoncy');
	cowoncy = [];
	if (patreons.cowoncy.length) {
		let list = patreons.cowoncy;
		for (let i in list) {
			if (list[i].discord) cowoncy.push(list[i].discord);
		}
		for (let i in result) {
			if (!cowoncy.includes(result[i].id)) cowoncy.push(result[i].id);
		}
	}

	console.log('done');

	await p.send(text, null, null, { split: true });
	await p.send(
		'Type `owo distributecowoncy {amount}` to send monthly cowoncy to ' +
			patreons.cowoncy.length +
			'+' +
			result.length +
			' users'
	);
	await p.send('```' + csv + '```', null, null, {
		split: { prepend: '```', append: '```' },
	});
}

async function distributeCowoncy(p) {
	if (p.args.length != 1 || !p.global.isInt(p.args[0])) {
		p.errorMsg(', Invalid param', 4000);
		return;
	}
	let amount = parseInt(p.args[0]);
	let sql = `INSERT IGNORE INTO cowoncy (id,money) VALUES (${cowoncy.join(
		',' + amount + '),('
	)},${amount}) ON DUPLICATE KEY UPDATE money = money + ${amount};`;
	let result = await p.query(sql);
	let text =
		'Distributed ' +
		amount +
		' cowoncy to ' +
		cowoncy.length +
		' users\n```json\n' +
		JSON.stringify(result, null, 2) +
		'```';
	p.send(text);
}
