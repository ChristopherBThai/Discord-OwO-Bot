/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const acceptEmoji = '👍';
const key = 'pickup';

module.exports = new CommandInterface({
	alias: ['drop', 'pickup'],

	args: '{amount}',

	desc: "This command is now deprecated. ~~Drop some cowoncy in a channel with 'owo drop {amount}'! Users can pick it up with 'owo pickup {amount}' If you try to pick up more than what's on the floor, you'll lose that amount! Be careful!~~",

	example: ['owo drop 3000'],

	related: [],

	permissions: ['sendMessages'],

	group: ['gambling'],

	cooldown: 30000,
	half: 50,
	six: 300,
	bot: true,

	execute: async function (p) {
		if (p.command == 'drop') {
			await p.errorMsg(', This command is now deprecated.', 3000);
			// drop(p);
		} else if (p.command == 'pickup') {
			await pickup2(p);
			// pickup(p);
		}
	},
});

/* eslint-disable-next-line */
async function drop(p) {
	let amount;
	if (p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
	if (!amount) {
		p.errorMsg(', Please specify the drop amount!', 3000);
		return;
	}
	if (amount <= 0) {
		p.errorMsg(', Invalid arguments!', 3000);
		return;
	}
	let sql = `SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
		CALL CowoncyDrop(${p.msg.author.id},${p.msg.channel.id},${amount});`;
	let result = await p.query(sql);
	if (!result[0][0] || result[0][0].money < amount) {
		p.errorMsg(", you don't have enough cowoncy! >:c", 3000);
		return;
	}
	p.neo4j.drop(p.msg, amount);
	p.logger.decr('cowoncy', -1 * amount, { type: 'drop' }, p.msg);
	p.send(
		'**💰 | ' +
			p.msg.author.username +
			'** dropped **' +
			p.global.toFancyNum(amount) +
			'** cowoncy!\n**<:blank:427371936482328596> |** Use `owo pickup` to pick it up! ',
		8000
	);
	p.quest('drop');
}

/* eslint-disable-next-line */
async function pickup(p) {
	let agreed = await p.redis.hget('data_' + p.msg.author.id, key);
	if (!agreed) {
		handleWarning(p);
		return;
	}
	let amount;
	if (p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
	if (!amount) {
		p.errorMsg(', Please specify the pickup amount!', 3000);
		return;
	}
	if (amount <= 0) {
		p.errorMsg(', Invalid arguments!', 3000);
		return;
	}
	let sql = `SELECT amount FROM cowoncydrop WHERE channel = ${p.msg.channel.id};
		SELECT money FROM cowoncy WHERE id = ${p.msg.author.id};
		CALL CowoncyPickup(${p.msg.author.id},${p.msg.channel.id},${amount});`;
	let result = await p.query(sql);
	//Not enough money
	if (!result[1][0] || result[1][0].money < amount) {
		p.send('**🚫 | ' + p.msg.author.username + '**, you can only pick up as much as you have!');
		return;
	} else if (result[0][0] && amount <= result[0][0].amount && amount <= result[1][0].money) {
		p.send(
			'**💰 | ' +
				p.msg.author.username +
				'**, you picked up **' +
				amount +
				'** cowoncy from this channel!'
		);
		p.neo4j.pickup(p.msg, amount);
		p.logger.incr('cowoncy', amount, { type: 'drop' }, p.msg);
	} else {
		p.send(
			'**💰 | ' +
				p.msg.author.username +
				"**, there's not enough cowoncy on the floor!\n**<:blank:427371936482328596> |** You felt nice so you dropped **" +
				amount +
				'** cowoncy!',
			8000
		);
		p.neo4j.drop(p.msg, amount);
		p.logger.decr('cowoncy', -1 * amount, { type: 'drop' }, p.msg);
	}
}

async function handleWarning(p) {
	let embed = {
		author: {
			name: '⚠️ Hold on there, ' + p.msg.author.username + '!',
			icon_url: p.msg.author.avatarURL,
		},
		description:
			"If you try to pickup more than what's on the floor, you'll drop it instead!\nReact with 👍 to confirm you understand!",
		color: p.config.embed_color,
	};
	let msg = await p.send({ embed });

	await msg.addReaction(acceptEmoji);

	let filter = (emoji, userID) => emoji.name === acceptEmoji && p.msg.author.id === userID;
	let collector = p.reactionCollector.create(msg, filter, { time: 60000 });
	collector.on('collect', async (_emoji) => {
		collector.stop('done');
		p.redis.hincrby('data_' + p.msg.author.id, key, 1);
		embed.color = 65280;
		embed.author.name = "✅ You're all set, " + p.msg.author.username + '!';
		embed.description =
			'**' + acceptEmoji + ' |** The **pickup** command is now enabled for you! Good luck!';
		msg.edit({ embed });
		p.setCooldown(5);
	});

	collector.on('end', async function (reason) {
		if (reason != 'done') {
			embed.color = 6381923;
			await msg.edit({ content: 'This message is now inactive', embed });
		}
	});
}
async function pickup2(p) {
	let amount;
	if (p.global.isInt(p.args[0])) amount = parseInt(p.args[0]);
	if (!amount) {
		p.errorMsg(', Please specify the pickup amount!', 3000);
		return;
	}
	if (amount <= 0) {
		p.errorMsg(', Invalid arguments!', 3000);
		return;
	}

	const con = await p.startTransaction();
	try {
		let sql = `UPDATE cowoncydrop SET amount = amount - ${amount} WHERE amount >= ${amount} AND channel = ${p.msg.channel.id};`;
		let result = await con.query(sql);
		if (!result.changedRows) {
			throw { errorMsg: ", there isn't enough cowoncy on the floor!" };
		}

		sql = `UPDATE cowoncy SET money = money + ${amount} WHERE id = ${p.msg.author.id};`;
		result = await con.query(sql);
		if (!result.changedRows) {
			throw {
				errorMsg: ', failed to give you the cowoncy, please try again later.',
			};
		}

		await con.commit();
	} catch (err) {
		await con.rollback();
		if (err.errorMsg) {
			await p.errorMsg(err.errorMsg, 3000);
		} else {
			console.error(err);
			await p.errorMsg(', there was an picking up cowoncy! Please try again later.', 3000);
		}
		return;
	}

	await p.replyMsg(p.config.emoji.cowoncy, `, you picked up **${amount} cowoncy**!`);
}
