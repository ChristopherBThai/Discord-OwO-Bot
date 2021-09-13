/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/

const banEmoji = '<:ban:444365501708107786>';

exports.handle = async function(main, message){
	let { guildId, replyChannel } = JSON.parse(message);
	if (!guildId || !replyChannel) return;

	const guild = main.bot.guilds.get(guildId);
	if (!guild) return;

	let memberIds = [];
	let memberCount = 0;
	let log = '';
	guild.members.forEach(member => {
		memberIds.push(`(${member.id}, NOW(), 1, 999999)`);
		log += member.id + ',';
		memberCount++;
	});
	console.log(log);

	const sql = `INSERT INTO timeout (id, time, count, penalty) VALUES ${memberIds.join(',')} ON DUPLICATE KEY UPDATE time = NOW(), count = count + 1, penalty = 999999;`;

	const msg = `${banEmoji} **|** Banned ${memberCount} members from **${guild.name}**.`
	main.bot.createMessage(replyChannel, msg);
}
	
