/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['disablecaptcha', 'enablecaptcha'],

	owner: true,
	admin: true,

	execute: async function () {
		const enableCaptcha = this.command === 'enablecaptcha';
		let changeLink = true,
			changeImage = true;
		if (this.args[0] === 'link') {
			changeImage = false;
		} else if (this.args[0] === 'image') {
			changeLink = false;
		}

		if (changeLink && changeImage) {
			this.macro.setCaptcha(enableCaptcha);
			if (enableCaptcha) {
				this.replyMsg(this.config.emoji.gear, ', I **enabled** all captchas');
			} else {
				this.replyMsg(this.config.emoji.gear, ', I **disabled** all captchas');
			}
		} else if (changeLink) {
			this.macro.setCaptchaLink(enableCaptcha);
			if (enableCaptcha) {
				this.replyMsg(this.config.emoji.gear, ', I **enabled** `link` captchas');
			} else {
				this.replyMsg(this.config.emoji.gear, ', I **disabled** `link` captchas');
			}
		} else if (changeImage) {
			this.macro.setCaptchaImage(enableCaptcha);
			if (enableCaptcha) {
				this.replyMsg(this.config.emoji.gear, ', I **enabled** `image` captchas');
			} else {
				this.replyMsg(this.config.emoji.gear, ', I **disabled** `image` captchas');
			}
		}
	},
});
