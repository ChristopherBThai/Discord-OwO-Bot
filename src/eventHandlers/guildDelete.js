/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

// When guild is deleted
exports.handle = function (_guild) {
	if (!this.debug) this.logger.decr('guildcount');
};
