/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const CommandInterface = require('../../CommandInterface');
const delay = 30000;

module.exports = new CommandInterface({
	alias: ['resetbot', 'restartbot'],
	owner: true,

	execute: function(p) {
		p.send('Restarting all shards');
		p.pubsub.publish('endProcess');
	}
});
