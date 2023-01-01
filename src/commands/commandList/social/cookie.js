/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const dateUtil = require('../../../utils/dateUtil.js');
const alterCookie = require('../patreon/alterCookie.js');

module.exports = new CommandInterface({
	alias: ['cookie', 'rep'],

	args: '{@user}',

	desc: 'Give a user a cookie!',

	example: ['owo cookie @user', 'owo cookie'],

	related: [],

	permissions: ['sendMessages'],

	group: ['social'],

	cooldown: 5000,
	half: 100,
	six: 500,
	bot: true,

	execute: function (p) {
		if (p.args.length == 0) display(p);
		else give(p, p.con, p.msg, p.args, p.global, p.send);
	},
});

async function give(p, con, msg, args, global, send) {
	let user = undefined;
	user = p.getMention(p.args[0]);
	if (!user) {
		user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
		if (!user) {
			p.errorMsg(', I could not find that user!', 3000);
			p.setCooldown(5);
			return;
		}
	}
	if (msg.author.id == user.id) {
		p.errorMsg(", you can't give yourself a cookie, silly!", 3000);
		return;
	}

	let sql =
		'SELECT user.uid,cookieTime FROM user LEFT JOIN timers ON user.uid = timers.uid WHERE id = ' +
		p.msg.author.id +
		';';
	let result = await p.query(sql);

	let afterMid = dateUtil.afterMidnight(result[0] ? result[0].cookieTime : undefined);

	if (afterMid && !afterMid.after) {
		p.errorMsg(
			', Nu! You need to wait **' +
				afterMid.hours +
				'H ' +
				afterMid.minutes +
				'M ' +
				afterMid.seconds +
				'S**',
			3000
		);
		return;
	}

	sql =
		'INSERT INTO rep (id,count) VALUES (' +
		user.id +
		',1) ON DUPLICATE KEY UPDATE count = count + 1;';
	if (!result[0]) sql += 'INSERT IGNORE INTO user (id,count) VALUES (' + p.msg.author.id + ',0);';
	sql +=
		'INSERT INTO timers (uid,cookieTime) VALUES ((SELECT uid FROM user WHERE id = ' +
		p.msg.author.id +
		'),' +
		afterMid.sql +
		') ON DUPLICATE KEY UPDATE cookieTime = ' +
		afterMid.sql +
		';';

	result = await p.query(sql);
	let text =
		'**<a:cookieeat:423020737364885525> | ' +
		user.username +
		'**! You got a cookie from **' +
		msg.author.username +
		'**! *nom nom nom c:<*';
	text = alterCookie.alter(p.msg.author.id, text, {
		from: p.msg.author,
		to: user,
	});
	send(text);
	p.quest('cookieBy', 1, user);
	p.macro.checkToCommands(p, user.id);
}

async function display(p) {
	let sql =
		'SELECT cookieTime,rep.count FROM user LEFT JOIN timers ON user.uid = timers.uid LEFT JOIN rep ON user.id = rep.id WHERE user.id = ' +
		p.msg.author.id +
		';';
	let result = await p.query(sql);
	let afterMid = dateUtil.afterMidnight(result[0] ? result[0].cookieTime : undefined);

	let count = 0;
	if (result[0] && result[0].count) count = result[0].count;
	let again = 'You have one cookie to send!';
	const opt = { count, from: p.msg.author };

	if (afterMid && !afterMid.after) {
		const timer = `${afterMid.hours}H ${afterMid.minutes}M ${afterMid.seconds}S`;
		opt.timer = timer;
		again = `You can send a cookie in **${timer}**!`;
	} else {
		opt.ready = true;
	}

	let text =
		'**<a:cookieeat:423020737364885525> | ' +
		p.msg.author.username +
		'**! You currently have **' +
		count +
		'** cookies! Yummy! c:<\n**<:blank:427371936482328596> |** ' +
		again;
	text = alterCookie.alter(p.msg.author.id, text, opt);
	p.send(text);
}
