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
const perPage = 15;
const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';
const banEmoji = '☠';

module.exports = new CommandInterface({
	alias: ['prayto'],

	owner: true,
	admin: true,
	manager: true,

	execute: async function (p) {
		if (p.args.length > 2) await banList(p);
		else await displayList(p);
	},
});

async function banList(p) {
	if (p.args[0] != 'ban') {
		p.errorMsg(', Invalid syntax! The correct use is `owo prayto ban {id} {minPrayCount}`', 4000);
		return;
	}
	let userid = p.args[1];
	if (!p.global.isInt(userid)) {
		p.errorMsg(', Invalid user id!', 3000);
		return;
	}
	let min = p.args[2];
	if (!p.global.isInt(min)) {
		p.errorMsg(', Invalid minimum pray count!', 4000);
		return;
	}

	min = parseInt(min);
	let user = await p.fetch.getUser(userid);
	let username = user ? user.username : userid;

	let sql = `SELECT sender FROM user_pray WHERE receiver = ${userid} AND count >= ${min};`;
	let result = await p.query(sql);
	if (!result || result.length == 0) {
		p.errorMsg(', no users found', 3000);
		return;
	}
	let bans = [userid];
	for (let i in result) {
		bans.push(result[i].sender);
	}
	let count = bans.length;
	const bansSql = '(' + bans.join(',99999),(') + ',99999)';
	sql = `INSERT IGNORE INTO timeout (id,penalty) VALUES ${bansSql} ON DUPLICATE KEY UPDATE penalty = 99999;`;
	await p.query(sql);

	if (user) {
		try {
			await (
				await user.getDMChannel()
			).createMessage('Your accounts has been banned for abusing pray/curse');
		} catch (e) {
			p.replyMsg(
				banEmoji,
				', **' + username + '** and ' + (count - 1) + " users have been banned, I couldn't DM them"
			);
			return;
		}
	}

	let userList = '';
	for (let i in bans) {
		userList += bans[i] + ', ';
		if (!((parseInt(i) + 1) % 10) && i + 1 != bans.length) {
			userList += '\n';
		}
	}
	userList = userList.slice(0, -2);
	const userListBuffer = Buffer.from(userList, 'utf8');
	p.replyMsg(
		banEmoji,
		', **' + username + '** and ' + (count - 1) + ' users have been banned',
		null,
		{ file: userListBuffer, name: 'list.txt' }
	);
}

async function displayList(p) {
	let userid = p.args[0];
	if (!p.global.isInt(userid)) {
		p.errorMsg(', Invalid user id!', 3000);
		return;
	}

	let user = await p.fetch.getUser(userid);
	let username = user ? user.username : userid;

	let page = 0;
	let sql = `SELECT COUNT(*) AS count FROM user_pray WHERE receiver = ${userid}`;
	let result = await p.query(sql);

	if (!result[0] || !result[0].count || result[0].count == 0) {
		p.errorMsg(', nobody has prayed to ' + username + '!', 3000);
		return;
	}

	let maxPage = Math.ceil(result[0].count / 15);
	let opt = { id: userid, username, avatar: user ? user.avatarURL : null };
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
	let sql = `SELECT * FROM user_pray WHERE receiver = ${user.id} LIMIT ${perPage} OFFSET ${
		page * perPage
	};`;
	let result = await p.query(sql);
	for (let i in result) {
		let prayer = result[i];
		desc += '`' + prayer.sender + '` | `' + prayer.count + '` | `' + toDate(prayer.latest) + '`\n';
	}
	let embed = {
		author: {
			name: 'List of users who prayed to ' + user.username,
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
