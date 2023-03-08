/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const config = require('../../../../data/config.json');
const event = require('../../../../data/event.json');
const thumbsup = '👍';
const thumbsdown = '👎';
const items = {
	common_tickets: {
		id: 10,
		name: 'Wrapped Common Ticket',
		emoji: config.emoji.perkTicket.wcommon,
		column: 'common_tickets',
		tradeNote: '⚠️ **You can only trade this item ONCE. The ticket will be unwrapped.**',
		tradeConvert: 14,
		desc: 'You can use this item to redeem 1 month of common tier perks!\n\nYou can trade this item with other users with `owo trade 10 {@user} {pricePerTicket} {numberOfTickets}`. An example would be `owo trade 10 @Scuttler 100000 2`. This will trade 2 tickets for a total price of 200000 cowoncy.\n\n**This ticket is only tradeable ONCE.** It will be unwrapped once traded.\n\nYou can also use this item by typing in `owo use 10`.',
	},
	unwrapped_common_tickets: {
		id: 14,
		name: 'Common Ticket',
		emoji: config.emoji.perkTicket.common,
		column: 'unwrapped_common_tickets',
		//tradeLimit: 1,
		//giveOnly: true,
		untradeable: true,
		desc: 'You can use this item to redeem 1 month of common tier perks by typing `owo use 14`.',
	},
};

let lowestEventId = 18;
let eventItemId = lowestEventId;
for (let key in event) {
	const eventItem = event[key].item;
	items[eventItem.id] = {
		id: eventItemId,
		name: eventItem.name,
		emoji: eventItem.emoji,
		column: eventItem.id,
		untradeable: true,
		desc: eventItem.description,
	};
	eventItemId++;
}

exports.getItems = async function (p) {
	let sql = `SELECT ui.* FROM user_item ui INNER JOIN user u ON ui.uid = u.uid WHERE u.id = ${p.msg.author.id};`;
	let result = await p.query(sql);
	if (!result[0]) {
		return {};
	}

	let inv = {};

	for (let i in result) {
		const count = result[i].count;
		const info = items[result[i].name];

		if (!info) {
			console.error('No item for: ' + result[i].name);
		} else if (count > 0) {
			inv[info.id] = {
				id: info.id,
				emoji: info.emoji,
				count: count,
			};
		}
	}
	return inv;
};

exports.use = async function (id, p) {
	let item = getById(id);
	switch (item?.id) {
		case 10:
		case 14:
			await useCommonTicket(item, p);
			break;
		default:
			if (eventItemId > item?.id && item?.id >= lowestEventId) {
				await p.event.useItem.bind(p)(item);
			} else {
				await p.errorMsg(', this item does not exist! :(');
			}
	}
};

function getById(id) {
	return Object.values(items).find((item) => item.id == id);
}
exports.getById = getById;

function getByName(name) {
	return items[name];
}
exports.getByName = getByName;

async function useCommonTicket(ticket, p) {
	let count = p.args[1];
	if (!count) {
		count = 1;
	} else if (count == 'all') {
		let result = await p.query(
			`SELECT ui.count FROM user_item ui INNER JOIN user u ON ui.uid = u.uid WHERE u.id = ${p.msg.author.id} AND ui.name = '${ticket.column}'`
		);
		if (!result[0] || result[0].count < 0) {
			p.errorMsg(', you do not have this item!', 3000);
			return;
		}
		count = result[0].count;
	} else if (p.global.isInt(count)) {
		count = parseInt(count);
	} else {
		p.errorMsg(
			', invalid arguments! Please specify the number of tickets you want to use >:c',
			3000
		);
		return;
	}

	if (count <= 0) {
		p.errorMsg(', bad! You must use at least one ticket', 3000);
		return;
	}

	const embed = {
		description: `**${p.msg.author.username}**, are you sure you want to redeem **${count}** ${
			ticket.emoji
		} **${ticket.name}${count > 1 ? 's' : ''}**?`,
		color: p.config.embed_color,
	};
	const msg = await p.send({ embed });
	const filter = (emoji, userId) =>
		(emoji.name === thumbsup || emoji.name === thumbsdown) && userId == p.msg.author.id;
	const collector = p.reactionCollector.create(msg, filter, { time: 60000 });

	await msg.addReaction(thumbsup);
	await msg.addReaction(thumbsdown);

	collector.on('collect', async (emoji, _userId) => {
		if (emoji.name === thumbsdown) {
			collector.stop('cancel');
			return;
		}
		collector.stop('redeem');

		const con = await p.startTransaction();
		let date;
		try {
			// remove tickets
			let sql = `UPDATE user_item INNER JOIN user ON user_item.uid = user.uid SET user_item.count = user_item.count - ${count}  WHERE user.id = ${p.msg.author.id} AND user_item.count >= ${count} AND user_item.name = '${ticket.column}';`;
			let result = await con.query(sql);
			if (!result.changedRows) {
				await con.rollback();
				try {
					embed.description = `${p.config.emoji.error} **| ${p.msg.author.username}**, you do not have enough tickets silly!`;
					msg.edit({ embed });
				} catch (err) {
					/* empty */
				}
				return;
			}

			// add months
			sql = `SELECT user.uid, patreonMonths, patreonTimer, TIMESTAMPDIFF(MONTH,patreonTimer,NOW()) AS monthsPassed, patreonType FROM user LEFT JOIN patreons ON user.uid = patreons.uid WHERE id = ${p.msg.author.id}`;
			result = await p.query(sql);
			let uid = result[0].uid;
			let months = result[0]?.patreonMonths || 0;
			let monthsPassed = p.global.isInt(result[0]?.monthsPassed) ? result[0].monthsPassed : months;
			const type = 1;

			// reset timer or continue with current timer
			if (months <= monthsPassed) {
				sql = `INSERT INTO patreons (uid,patreonMonths,patreonType) VALUES (${uid},${count},${type}) ON DUPLICATE KEY UPDATE patreonType = ${type}, patreonMonths = ${count},patreonTimer = NOW();`;
				date = new Date();
				date.setMonth(date.getMonth() + count);
			} else {
				sql = `UPDATE patreons SET patreonType = ${type}, patreonMonths = patreonMonths + ${count} WHERE uid = ${uid};`;
				date = new Date(result[0].patreonTimer);
				date.setMonth(date.getMonth() + count + months);
			}
			date = date.toString();
			result = await p.query(sql);

			con.commit();
		} catch (err) {
			console.error(err);
			p.errorMsg(', there was an error using your ticket! Please try again later.', 3000);
			con.rollback();
			return;
		}
		embed.description = `**${
			p.msg.author.username
		}**, your patreon has been extended by **${count} month${
			count > 1 ? 's' : ''
		}**!\nExpires on: **${date}**`;
		await msg.edit({ embed });
	});

	collector.on('end', async function (reason) {
		if (reason == 'cancel') {
			embed.color = 6381923;
			await msg.edit({ content: 'This has canceled.', embed });
		} else if (reason != 'redeem') {
			embed.color = 6381923;
			await msg.edit({ content: 'This message is now inactive', embed });
		}
	});
}

exports.desc = async function (p, id) {
	let item = getById(id);
	if (!item) {
		p.errorMsg(', that item does not exist!');
		return;
	}

	let sql = `SELECT ui.* FROM user_item ui INNER JOIN user u ON ui.uid = u.uid WHERE u.id = ${p.msg.author.id} AND ui.name = '${item.column}';`;
	let result = await p.query(sql);
	if (!result[0] || !result[0].count) {
		p.errorMsg(', you do not have this item');
		return;
	}

	let embed = {
		color: p.config.embed_color,
		fields: [
			{
				name: item.emoji + ' ' + item.name,
				value: `**ID:** ${item.id}\n${item.desc}`,
			},
		],
	};

	if (item.giveOnly) {
		embed.fields[0].value +=
			'\n\n💸 **This item can only be gifted. You cannot trade this for cowoncy.**';
	}

	if (item.untradeable) {
		embed.fields[0].value += '\n\n🚫 **This item can not be traded.**';
	}

	if (item.tradeLimit) {
		const afterMid = p.dateUtil.afterMidnight(result[0].daily_reset);
		if (afterMid.after) {
			embed.fields[0].value += `\n\n📑 **You can ${item.giveOnly ? 'gift' : 'trade'} this item ${
				item.tradeLimit
			} more times today.**`;
		} else {
			if (result[0].daily_count >= item.tradeLimit) {
				embed.fields[0].value += `\n\n📑 **You have hit the max ${
					item.giveOnly ? 'gift' : 'trade'
				} limit for today.**`;
			} else {
				const diff = item.tradeLimit - result[0].daily_count;
				embed.fields[0].value += `\n\n📑 **You can ${
					item.giveOnly ? 'gift' : 'trade'
				} this item ${diff} more times today.**`;
			}
		}
	}

	await p.send({ embed });
};
