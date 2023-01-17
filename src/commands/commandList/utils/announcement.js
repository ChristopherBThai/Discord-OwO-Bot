/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['announce', 'changelog', 'announcement', 'announcements'],

	args: '{disable|enable}',

	desc: "View the latest announcement! Announcements will also be displayed in your daily command! You can disable this by typing 'owo announcement disable'",

	example: ['owo announcement', 'owo announcement enable', 'owo announcement disable'],

	related: ['owo daily'],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles'],

	group: ['utility'],

	cooldown: 10000,
	half: 100,
	six: 500,

	execute: function (p) {
		if (p.args[0] && (p.args[0] == 'disable' || p.args[0] == 'enable')) announcementSetting(p);
		else announcement(p);
	},
});

async function announcement(p) {
	let sql = 'SELECT * FROM announcement ORDER BY aid DESC LIMIT 1';
	let result = await p.query(sql);
	if (!result[0]) p.send('**📮 |** There are no announcements!', 3000);
	else {
		let embed = {
			author: {
				name: p.msg.author.username + ', here is the latest announcement!',
				icon_url: p.msg.author.avatarURL,
			},
			color: p.config.embed_color,
			timestamp: new Date(result[0].adate),
			image: {
				url: result[0].url,
			},
		};
		p.send({ embed });
	}
}

async function announcementSetting(p) {
	if (p.args[0] == 'enable') {
		let sql =
			'INSERT INTO user_announcement (uid,aid,disabled) values ((SELECT uid FROM user WHERE id = ?),(SELECT aid FROM announcement ORDER BY aid ASC LIMIT 1),0) ON DUPLICATE KEY UPDATE disabled = 0;';
		p.query(sql, [BigInt(p.msg.author.id)])
			.then(() => {
				p.send(
					'**📮 | ' +
						p.msg.author.username +
						'** You will now receive announcements in your daily command!'
				);
			})
			.catch(() => {
				sql = 'INSERT IGNORE INTO user (id,count) VALUES (?,0);' + sql;
				p.query(sql, [BigInt(p.msg.author.id), BigInt(p.msg.author.id)]).then(() => {
					p.send(
						'**📮 | ' +
							p.msg.author.username +
							'** You will now receive announcements in your daily command!'
					);
				});
			});
	} else {
		let sql =
			'INSERT INTO user_announcement (uid,aid,disabled) values ((SELECT uid FROM user WHERE id = ?),(SELECT aid FROM announcement ORDER BY aid ASC LIMIT 1),1) ON DUPLICATE KEY UPDATE disabled = 1;';
		p.query(sql, [BigInt(p.msg.author.id)])
			.then(() => {
				p.send('**📮 | ' + p.msg.author.username + '** You have disabled announcements!');
			})
			.catch(() => {
				sql = 'INSERT IGNORE INTO user (id,count) VALUES (?,0);' + sql;
				p.query(sql, [BigInt(p.msg.author.id), BigInt(p.msg.author.id)]).then(() => {
					p.send('**📮 | ' + p.msg.author.username + '** You have disabled announcements!');
				});
			});
	}
}
