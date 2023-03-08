/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (main, message) {
	let { channelID, msg } = JSON.parse(message);
	if (main.debug) return;
	if (!main.bot.channelGuildMap[channelID]) return;
	main.bot.createMessage(channelID, msg);
};
