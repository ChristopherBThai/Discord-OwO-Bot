/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['pausebot'],

	owner: true,
	manager: true,

	execute: function () {
		let sec = this.args[0];
		if (!this.global.isInt(sec)) {
			this.errorMsg(', invalid time!');
			return;
		}
		sec = parseInt(sec);
		if (sec > 300) {
			sec = 300;
		} else if (sec <= 0) {
			sec = 1;
		}
		this.send(`Pausing bot for ${sec}s`);
		this.pubsub.publish('pauseBot', sec);
	},
});
