/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
// Fired when a shard resumes
exports.handle = function(id) {
	console.log(`[${id}]--------------- Bot has resumed ---------------`);
	if (!this.debug) this.logger.incr('Reconnecting...');
};
