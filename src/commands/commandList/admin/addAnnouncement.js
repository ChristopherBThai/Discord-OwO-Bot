/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['addannouncement'],

	owner: true,

	execute: async function (p) {
		try {
			let url = p.args[0];
			let data = await p.DataResolver.urlToBuffer(url);
			await p.send('This is a test message! Does it look ok?', null, {
				file: data,
				name: 'announcement.png',
			});
			let sql = 'INSERT INTO announcement (url) VALUES (?)';
			await p.query(sql, [url]);
			await p.send('Added new announcement!');
		} catch (err) {
			p.errorMsg(', failed to add announcement');
		}
	},
});
