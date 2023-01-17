/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const dateOptions = {
	weekday: 'short',
	year: 'numeric',
	month: 'short',
	day: 'numeric',
};
const perPage = 20;
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';

// Yes i know reciever is spelled wrong >:C
module.exports = new CommandInterface({
	alias: ['transaction'],

	owner: true,
	admin: true,
	manager: true,

	execute: function (p) {
		if (p.args[0] == 'to') {
			transactionTo(p);
		} else if (p.args[0] == 'from') {
			transactionFrom(p);
		} else if (p.args.length == 1) {
			transaction(p);
		} else {
			p.errorMsg(', Invalid syntax!');
		}
	},
});

async function transactionTo(p) {
	let id = p.global.parseID('<@' + p.args[1] + '>');

	if (!id) {
		p.errorMsg(', invalid id');
		return;
	}

	let query = `reciever= ${id}`;

	displayTransactions(p, id, query);
}

async function transactionFrom(p) {
	let id = p.global.parseID('<@' + p.args[1] + '>');

	if (!id) {
		p.errorMsg(', invalid id');
		return;
	}

	let query = `sender = ${id}`;

	displayTransactions(p, id, query);
}

async function transaction(p) {
	let id = p.global.parseID('<@' + p.args[0] + '>');

	if (!id) {
		p.errorMsg(', invalid id');
		return;
	}

	let query = `sender = ${id} OR reciever = ${id}`;

	displayTransactions(p, id, query);
}

async function displayTransactions(p, id, query) {
	let sql = `SELECT COUNT(tid) AS count FROM transaction WHERE ${query};`;
	let result = await p.query(sql);
	if (!result[0] || !result[0].count) {
		p.errorMsg(', this user does not have any transactions');
		return;
	}

	let user = await p.fetch.getUser(id);
	let username = user ? user.username : id;

	let page = 0;

	let maxPage = Math.ceil(result[0].count / perPage);
	let opt = { id, username, avatar: user ? user.avatarURL : null, query };
	let embed = await getPage(p, opt, page, maxPage);
	let msg = await p.send(embed);

	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);
	let filter = (emoji, userID) =>
		[nextPageEmoji, prevPageEmoji].includes(emoji.name) && userID == p.msg.author.id;
	let collector = p.reactionCollector.create(msg, filter, {
		time: 900000,
		idle: 120000,
	});

	collector.on('collect', async function (emoji) {
		if (emoji.name == nextPageEmoji) {
			if (page + 1 < maxPage) page++;
			else page = 0;
			embed = await getPage(p, opt, page, maxPage);
			msg.edit(embed);
		} else if (emoji.name === prevPageEmoji) {
			if (page > 0) page--;
			else page = maxPage - 1;
			embed = await getPage(p, opt, page, maxPage);
			msg.edit(embed);
		}
	});
	collector.on('end', async function (_collected) {
		embed.embed.color = 6381923;
		await msg.edit({
			content: 'This message is now inactive',
			embed: embed.embed,
		});
	});
}

async function getPage(p, user, page, maxPage) {
	let desc = '';
	let sql = `SELECT * FROM transaction WHERE ${
		user.query
	} ORDER BY tid DESC LIMIT ${perPage} OFFSET ${page * perPage};`;
	let result = await p.query(sql);
	for (let i in result) {
		let row = result[i];
		if (row.sender == user.id)
			desc += `__**\`${row.sender}\`**__ \`-> ${row.reciever} | ${toDate(
				row.time
			)} | ${p.global.toFancyNum(row.amount)}\`\n`;
		else if (row.reciever == user.id)
			desc += `\`${row.sender} ->\` __**\`${row.reciever}\`**__ \`| ${toDate(
				row.time
			)} | ${p.global.toFancyNum(row.amount)}\`\n`;
		else
			desc += `\`${row.sender} -> ${row.reciever} | ${toDate(row.time)} | ${p.global.toFancyNum(
				row.amount
			)}\`\n`;
	}
	let embed = {
		author: {
			name: 'transactions for ' + user.username,
			icon_url: user.avatar,
		},
		description: desc,
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + (page + 1) + '/' + maxPage + '',
		},
	};
	return { embed };
}

function toDate(date) {
	return new Date(date).toLocaleDateString('default', dateOptions);
}
