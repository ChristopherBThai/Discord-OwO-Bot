/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const itemUtil = require('./util/itemUtil.js');
const thumbsup = '👍';
const thumbsdown = '👎';
const tada = '🎉';
const spacer = '                                                               ';

module.exports = new CommandInterface({

	alias:["trade", "tr"],

	args:"itemId @user price {count}",

	desc:"Trade an item with a user!",

	example:["owo trade 10 @user 10000 1"],

	related:[],

	permissions:["sendMessages","embedLinks"],

	group:["economy"],

	cooldown:5000,

	execute: async function(p){
		const info = await validate(p);
		if (info.error) return;
		awaitReaction(p, info);
	}
});

async function validate (p) {
	let [ itemId, user, price, count = 1 ] = p.args
	if (!itemId) {
		await p.errorMsg(", please include what item you want to trade!", 3000);
		return { error: true };
	}
	if (!p.global.isInt(itemId)) {
		await p.errorMsg(", invalid item id! Item id must be a number!", 3000);
		return { error: true };
	}
	itemId = parseInt(itemId);
	const item = itemUtil.getById(itemId);
	if (!item) {
		await p.errorMsg(", an item with that id does not exist or you cannot trade that item.", 3000);
		return { error: true };
	}

	user = p.getMention(user);
	if (!user) {
		await p.errorMsg(", please tag a user you want to trade with!", 3000);
		return { error: true };
	}
	if (user.id == p.msg.author.id) {
		await p.errorMsg(", you cannot trade with yourself!", 3000);
		return { error: true };
	}

	if (!price) {
		await p.errorMsg(", please specify what price you want to sell the item for!", 3000);
		return { error: true };
	}
	if (!p.global.isInt(price)) {
		await p.errorMsg(", price must be a number!", 3000);
		return { error: true };
	}
	price = parseInt(price);
	if (price < 1) {
		await p.errorMsg(", the price must be greater than 0!", 3000);
		return { error: true };
	}
	if (price > 2000000) {
		await p.errorMsg(", the price per ticket is too high!", 3000);
		return { error: true };
	}

	if (!p.global.isInt(count)) {
		await p.errorMsg(", the number of items is invalid!", 3000);
		return { error: true };
	}
	count = parseInt(count);
	if (count < 1) {
		await p.errorMsg(", the number of items must be greater than one!", 3000);
		return { error: true };
	}

	let sql = `SELECT ${item.column} FROM items INNER JOIN user ON items.uid = user.uid WHERE user.id = ${p.msg.author.id};`;
	sql += `SELECT id FROM timeout WHERE id = ${user.id} AND TIMESTAMPDIFF(HOUR,time,NOW()) < penalty;`;
	let result = await p.query(sql);
	if (!result[0][0] || result[0][0][item.column] < count) {
		await p.errorMsg(`, you do not have enough ${item.name}s!`, 3000);
		return { error: true };
	}
	if (result[1][0]?.id) {
		await p.errorMsg(`, you cannot trade with this user!`, 3000);
		return { error: true };
	}

	return { item, user, price, count };
}

async function sendMessage (p, { item, user, price, count }) {
	const embed = {
		description: `Both users must hit the ${thumbsup} reaction to trade.\nEither user can hit the ${thumbsdown} reaction to stop the trade.`,
		color: p.config.embed_color,
		timestamp: new Date(),
		thumbnail: {
			url: p.global.getEmojiURL(item.emoji)
		},
		author: {
			name: `${p.msg.author.username} wants to trade with ${user.username}!`,
			icon_url: p.msg.author.avatarURL
		},
		fields: [
			{
				name: `${p.msg.author.username}#${p.msg.author.discriminator} will give:`,
				value: `\`\`\`fix\n${count} ${item.name}${count > 1 ? 's' : ''}${spacer}\n\`\`\``,
				inline: true
			},
			{
				name: `${user.username}#${user.discriminator} will give:`,
				value: `\`\`\`fix\n${count * price} cowoncy${spacer}\n\`\`\``,
				inline: true
			}
		]
	}
	const msg = await p.send({ embed });
	return { msg, embed };
}

async function awaitReaction (p, info) {
	const { msg, embed } = await sendMessage(p, info);

	const user1 = p.msg.author.id;
	let user1Reaction = false;
	const user2 = info.user.id;
	let user2Reaction = false;
	let filter = (emoji, userId) => (emoji.name===thumbsup || emoji.name===thumbsdown) && (userId===user2 || userId===user1);
	let collector = p.reactionCollector.create(msg, filter, {time:300000, idle:300000});

	await msg.addReaction(thumbsup);
	await msg.addReaction(thumbsdown);

	collector.on('collect', async (emoji, userId) => {
		if (emoji.name === thumbsdown) {
			collector.stop('cancel');
			return;
		}
		if (userId == user1) {
			if (user1Reaction) return;
			user1Reaction = true;
		}
		if (userId == user2) {
			if (user2Reaction) return;
			user2Reaction = true;
		}
		if (user1Reaction && user2Reaction) {
			collector.stop('done')
			executeTransaction(p, msg, embed, info)
		}
	});

	collector.on('end',async function (reason) {
		if (reason == 'cancel') {
			embed.color = 6381923;
			await msg.edit({content:"The trade was canceled.", embed});
		} else if (reason != "done") {
			embed.color = 6381923;
			await msg.edit({content:"This message is now inactive", embed});
		}
	});
}

async function executeTransaction(p, msg, embed, { item, user, price, count }) {
	const totalPrice = count * price;
	
	const con = await p.startTransaction()
	try {
		let sql = `UPDATE cowoncy SET money = money - ${totalPrice} WHERE id = ${user.id} AND money >= ${totalPrice};`;
		sql += `UPDATE cowoncy SET money = money + ${totalPrice} WHERE id = ${p.msg.author.id};`;
		sql += `UPDATE items INNER JOIN user ON items.uid = user.uid SET ${item.column} = ${item.column} - ${count} WHERE user.id = ${p.msg.author.id} AND ${item.column} >= ${count};`;
		sql += `INSERT INTO items (uid, ${item.column}) VALUES ((SELECT uid FROM user WHERE user.id = ${user.id}), ${count}) ON DUPLICATE KEY UPDATE ${item.column} = ${item.column} + ${count};`;
		sql += `INSERT INTO transaction (sender, reciever, amount) VALUES (${user.id}, ${p.msg.author.id}, ${totalPrice});`;
		let result = await con.query(sql);
		if (!result[0].changedRows) {
			embed.color = p.config.fail_color;
			msg.edit({content:`${p.config.emoji.error} **| ${user.username}** does not have enough money!`, embed});
			await con.rollback();
			return;
		} else if (!result[1].changedRows) {
			embed.color = p.config.fail_color;
			msg.edit({content:`${p.config.emoji.error} **|** I could not give money to **${p.msg.author.username}**. Please try again later.`, embed});
			await con.rollback();
			return;
		} else if (!result[2].changedRows) {
			embed.color = p.config.fail_color;
			msg.edit({content:`${p.config.emoji.error} **| ${p.msg.author.username}** does not have enough ${item.emoji} **${item.name}s**!`, embed});
			await con.rollback();
			return;
		} else if (!result[3].affectedRows) {
			embed.color = p.config.fail_color;
			msg.edit({content:`${p.config.emoji.error} **|** I could not give tickets to **${user.username}**. Please try again later`, embed});
			await con.rollback();
			return;
		}
		await con.commit();
	} catch (err) {
		console.error(err);
		p.errorMsg(", there was an error trading! Please try again later.", 3000);
		con.rollback();
		return;
	}

	embed.color = p.config.success_color;
	msg.edit({ content: `${tada} **|** Successfully traded!`, embed });
}
