/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

var cooldown = {};
const noEmoji = '🚫';
const skullEmoji = '☠';
const liftEmoji = '🙇';
const timerEmoji = '⏱';

exports.check = async function (p, command) {
	let channel = p.msg.channel.id;
	let guild = p.msg.channel.guild.id;
	let author = p.msg.author.id;

	if (cooldown[author + command]) return;

	// skip for points
	if (command != 'points') {
		//Check for channel cooldown
		if (!cooldown[channel]) {
			cooldown[channel] = 1;
			setTimeout(() => {
				delete cooldown[channel];
			}, 5000);
		} else if (cooldown[channel] >= 6) {
			cooldown[channel]++;
			if (command != 'points' && cooldown[channel] == 8)
				await p.send(
					timerEmoji +
						' **|** This channel is getting a little too crowded! Please slow down for me! ;c',
					3000
				);
			return;
		} else if (cooldown[channel] < 7) {
			cooldown[channel]++;
		}

		//Check if there is a global cooldown
		if (!cooldown[author]) {
			cooldown[author] = 1;
			setTimeout(() => {
				delete cooldown[author];
			}, 5000);
		} else if (cooldown[author] >= 3) {
			cooldown[author]++;
			if (command != 'points' && cooldown[author] == 4)
				await p.replyMsg(
					timerEmoji,
					", Please slow down~ You're a little **too fast** for me :c",
					3000
				);
			return;
		} else if (cooldown[author] < 3) {
			cooldown[author]++;
		}
	}

	//Check if the command is enabled
	let commandNames = `'all','${command}'`;
	for (let i in p.commands[command].group) {
		commandNames += ",'" + p.commands[command].group[i] + "'";
	}
	let sql = `SELECT * FROM disabled WHERE command IN (${commandNames}) AND channel = ${channel};
				SELECT id FROM timeout WHERE id IN (${author},${guild}) AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;
				SELECT * FROM user_ban WHERE id = ${author} AND command = '${command}';`;
	let result = await p.query(sql);
	if (result[1][0]) {
		// User in timeout
		p.logger.logstashBanned(p.commandAlias, p);
	} else if (result[2][0]) {
		// User is banned from this command
		cooldown[author + command] = true;
		setTimeout(() => {
			delete cooldown[author + command];
		}, 10000);
		if (command != 'points') await p.errorMsg(", you're banned from this command! >:c", 3000);
		p.logger.logstashBanned(p.commandAlias, p);
	} else if (!result[0][0] || ['points', 'disable', 'enable'].includes(command)) {
		// Success
		return true;
	} else {
		// Command is disabled in the channel
		cooldown[p.msg.author.id + command] = true;
		setTimeout(() => {
			delete cooldown[p.msg.author.id + command];
		}, 30000);
		if (command != 'points') await p.errorMsg(', that command is disabled on this channel!', 3000);
	}
};

exports.banCommand = async function (p, user, command, reason) {
	let sql = `INSERT IGNORE INTO user_ban (id,command) VALUES (${user.id},?);`;
	let result = await p.query(sql, [command]);
	if (!result.affectedRows) {
		sql = `INSERT IGNORE INTO user (id,count) VALUES (${user.id},0);${sql}`;
		await p.query(sql, [command]);
	}
	try {
		await (
			await user.getDMChannel()
		).createMessage(
			noEmoji +
				' **|** You have been banned from using the command: `' +
				command +
				'`\n' +
				p.config.emoji.blank +
				' **| Reason:** ' +
				reason
		);
	} catch (err) {
		await p.sender.msgModLogChannel(
			skullEmoji +
				' **⚠ | ' +
				user.username +
				'#' +
				user.discriminator +
				'** is banned from using `' +
				command +
				'` forever.\n' +
				p.config.emoji.blank +
				' **| ID:** ' +
				user.id +
				'\n' +
				p.config.emoji.blank +
				' **| Reason:** ' +
				reason +
				'\n' +
				p.config.emoji.blank +
				" **| I couldn't DM them.**"
		);
		return;
	}
	await p.sender.msgModLogChannel(
		skullEmoji +
			' **| ' +
			user.username +
			'#' +
			user.discriminator +
			'** is banned from using `' +
			command +
			'` forever.\n' +
			p.config.emoji.blank +
			' **| ID:** ' +
			user.id +
			'\n' +
			p.config.emoji.blank +
			' **| Reason:** ' +
			reason
	);
};

exports.liftCommand = async function (p, user, command) {
	let sql = `DELETE FROM user_ban WHERE id = ${user.id} AND command = ?;`;
	let result = await p.query(sql, [command]);

	if (result.affectedRows) {
		try {
			await (
				await user.getDMChannel()
			).createMessage(
				liftEmoji + ' **|** An admin has lifted your ban from the `' + command + '` command!'
			);
		} catch (err) {
			await p.send(
				liftEmoji +
					' **⚠ | ' +
					user.username +
					'#' +
					user.discriminator +
					"**'s ban on `" +
					command +
					'` has been lifted!\n' +
					p.config.emoji.blank +
					' **| ID:** ' +
					user.id +
					'\n' +
					p.config.emoji.blank +
					" **| I couldn't DM them.**"
			);
			return;
		}
		await p.send(
			liftEmoji +
				' **| ' +
				user.username +
				'#' +
				user.discriminator +
				"**'s ban on `" +
				command +
				'` has been lifted!\n' +
				p.config.emoji.blank +
				' **| ID:** ' +
				user.id
		);
	} else {
		await p.errorMsg(
			', **' +
				user.username +
				'#' +
				user.discriminator +
				'** does not have a ban on `' +
				command +
				'`!'
		);
	}
};
