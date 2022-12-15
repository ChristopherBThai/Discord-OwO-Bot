/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.handle = async function (data, ack) {
	await this.streamSocket.streamEmit(data.member.user, 'up');
	await ack();
};
