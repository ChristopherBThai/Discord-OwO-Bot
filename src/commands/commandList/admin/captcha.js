/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const CommandInterface = require('../../CommandInterface');
const captcha = require('../../../../../tokens/captcha');

module.exports = new CommandInterface({
	alias: ['captcha'],
	owner: true,

	execute: async function (p) {
		const opts = {};
		if (p.args[0] == 'link') {
			opts.forceUrl = true;
		} else if (p.args[0] == 'image') {
			opts.noUrl = true;
		}
		let { url, text, buffer } = await captcha.gen(opts, p.msg.author);
		if (url) {
			p.send(url);
		} else {
			p.send(text, null, { file: buffer, name: 'captcha.png' });
		}
	},
});
