/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['disablecaptcha', 'enablecaptcha', 'setcaptcha'],

	owner: true,
	admin: true,

	execute: async function () {
		const setting = {
			link: true,
			image: true,
		};

		switch (this.command) {
			case 'disablecaptcha':
				setting.link = false;
				setting.image = false;
				break;
			case 'setcaptcha':
				if (this.args[0] === 'link') {
					setting.image = false;
				} else if (this.args[0] === 'image') {
					setting.link = false;
				}
				break;
		}

		this.pubsub.publish('updateCaptcha', setting);
		this.replyMsg(
			this.config.emoji.gear,
			`, I changed the captcha settings: ${JSON.stringify(setting)}`
		);
	},
});
