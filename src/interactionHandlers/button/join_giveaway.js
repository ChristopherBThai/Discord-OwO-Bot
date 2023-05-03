/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (data, ack, err) {
	const exists = await this.giveaway.giveawayExists(data.channel_id, data.member.user.id);

	if (!exists.active) {
		err(`${this.config.emoji.error} **|** This giveaway is not active!`);
		return;
	} else if (exists.uid) {
		err(`${this.config.emoji.error} **|** You are already in this giveaway!`);
		return;
	}

	const uid = await this.global.getUid(data.member.user.id);
	exists.giveawayCount = await this.giveaway.addUser(exists.channelId, uid);

	const content = await this.giveaway.createContent(exists);
	await ack(content);
};
