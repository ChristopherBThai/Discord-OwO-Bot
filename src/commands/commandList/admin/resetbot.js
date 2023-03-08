/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['resetbot', 'restartbot'],

	owner: true,

	execute: function (p) {
		p.send('Restarting all shards');
		p.pubsub.publish('endProcess');
	},
});
