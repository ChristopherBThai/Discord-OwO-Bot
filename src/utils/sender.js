/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

let client;
const logChannel = '739393782805692476';
const modLogChannel = '471579186059018241';

/**
 * Sends a msg to channel
 */
exports.send = function (msg) {
	return function (content, del, file, opt) {
		let maxLength = 2000;
		let maxSends = 16;
		let sendCount = 0;
		if (typeof content === 'string' && content.length >= maxLength) {
			let prepend = '';
			let append = '';
			if (opt && opt.split) {
				prepend = opt.split.prepend ? opt.split.prepend : '';
				append = opt.split.append ? opt.split.append : '';
			}
			let fragments = content.split('\n');
			let total = content.startsWith(prepend) ? '' : prepend;
			for (let i in fragments) {
				if (sendCount >= maxSends) {
					// Do not send more than 10 messages
				} else if (total.length + fragments[i].length + append.length >= maxLength) {
					if (total === '') {
						return createMessage(msg, 'ERROR: The message is too long to send');
					} else {
						createMessage(msg, total.endsWith(append) ? total : total + append);
						total = prepend + fragments[i];
						sendCount++;
					}
				} else {
					total += '\n' + fragments[i];
				}
			}
			if (total !== '') {
				return createMessage(msg, total);
			}
		} else if (del) return createMessage(msg, content, file, del);
		else return createMessage(msg, content, file);
	};
};

async function createMessage(msg, content, file, del, opt = {}) {
	content = cleanContent(content);
	if (msg.interaction) {
		msg.ignoreDefer = true;
		if (opt.ephemeral) content.flags = 64;
		let returnMsg = await msg.createMessage(content, file, del);
		return (
			returnMsg || {
				id: msg.id,
				channel: msg.channel,
				edit: (content, file) => {
					content = cleanContent(content);
					msg.editOriginalMessage(content, file);
				},
			}
		);
	} else {
		const channel = msg.channel.createMessage ? msg.channel : await msg.author.getDMChannel();
		if (del) {
			const sentMsg = await channel.createMessage(content, file);
			setTimeout(() => {
				sentMsg.delete().catch(() => {
					console.error(`[${sentMsg.id}] Failed to delete message`);
				});
			}, del);
			return sentMsg;
		} else {
			return channel.createMessage(content, file);
		}
	}
}

/**
 * Sends a msg to channel
 */
exports.reply = function (msg) {
	return function (emoji, content, del, file, opt) {
		let username = this.opt?.author?.username || msg.author.username;
		let tempContent = {};
		if (typeof content === 'string') tempContent.content = `**${emoji} | ${username}**${content}`;
		else {
			tempContent = { ...content };
			tempContent.content = `**${emoji} | ${username}**${content.content}`;
		}

		if (typeof content === 'string' && tempContent.content.length >= 2000) {
			content = tempContent.content;
			let split = content.split('\n');
			let total = '';
			for (let i in split) {
				if (total.length + split[i].length >= 2000) {
					if (total === '') {
						return createMessage(msg, 'ERROR: The message is too long to send', null, null, opt);
					} else {
						createMessage(msg, total, null, null, opt);
						total = split[i];
					}
				} else {
					total += '\n' + split[i];
				}
			}
			if (total !== '') {
				return createMessage(msg, total, null, null, opt);
			}
		} else if (del) return createMessage(msg, tempContent, file, del, opt);
		else return createMessage(msg, tempContent, file, null, opt);
	};
};

/**
 * Sends a msg to channel
 */
exports.error = function (errorEmoji, msg) {
	return function (content, del, file, opt) {
		let username = msg.author.username;
		let emoji = errorEmoji;
		let tempContent = {};
		if (typeof content === 'string') {
			tempContent.content = `**${emoji} | ${username}**${content}`;
		} else {
			tempContent = { ...content };
			tempContent.content = `**${emoji} | ${username}**${content.content}`;
		}

		if (del) return createMessage(msg, tempContent, file, del, opt);
		else return createMessage(msg, tempContent, file, opt);
	};
};

/**
 * DM a user
 */
exports.msgUser = async function (id, msg) {
	id = id.match(/[0-9]+/)[0];
	let channel;
	try {
		channel = await client.getDMChannel(id);
	} catch (err) {
		return;
	}
	let user = await channel.recipient;
	try {
		if (channel) await channel.createMessage(msg);
	} catch (err) {
		// just enough to error log
		return {
			dmError: true,
			id: user.id,
			username: user.username,
			discriminator: user.discriminator,
		};
	}

	return user;
};

exports.msgChannel = async function (channel, msg, options) {
	if (!msg || !channel) return;
	channel = channel.match(/[0-9]+/)[0];
	let message = await client.createMessage(channel, msg);

	// Add reactions if there are any
	if (options && options.react) {
		for (let i in options.react) {
			await message.addReaction(options.react[i]);
		}
	}

	return message;
};

exports.msgLogChannel = async function (msg) {
	if (!msg) return;
	client.createMessage(logChannel, msg);
};

exports.msgModLogChannel = async function (msg) {
	if (!msg) return;
	client.createMessage(modLogChannel, msg);
};

exports.editMsg = async function (cid, mid, msg) {
	if (!msg || !mid || !cid) return;
	client.editMessage(cid, mid, msg);
};

exports.init = function (main) {
	client = main.bot;
};

function cleanContent(content) {
	let tempContent;
	if (typeof content === 'string') {
		tempContent = { content };
	} else {
		tempContent = { ...content };
	}
	if (tempContent.embed) {
		tempContent.embeds = [tempContent.embed];
		delete tempContent.embed;
	}
	return tempContent;
}
