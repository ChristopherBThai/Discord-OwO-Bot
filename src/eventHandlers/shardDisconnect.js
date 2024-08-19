/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

// Fired when a shard disconnects
exports.handle = function (error, id) {
	console.error('[' + id + ']--------------- Bot Disconnected---------------');
	if (error) console.error('[' + id + '] ' + error.code);
	this.logger.logstashQos('shardDisconnect');
};
