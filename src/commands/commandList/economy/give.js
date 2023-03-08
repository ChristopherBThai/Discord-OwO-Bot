/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const alterGive = require('../patreon/alterGive.js');
const cowoncyUtils = require('./utils/cowoncyUtils.js');

const agree = '✅';
const decline = '❎';
const spacer = '                                                               ';

module.exports = new CommandInterface({
	alias: ['give', 'send'],

	args: '{@user} {amount}',

	desc: 'Send some cowoncy to other users! This command must contain a @mention and an amount\n\nThere is a limit on how much cowoncy you can receive and give.',

	example: ['owo give @Scuttler 25'],

	related: ['owo money'],

	permissions: ['sendMessages'],

	group: ['economy'],

	cooldown: 5000,
	half: 100,
	six: 500,
	bot: true,

	execute: async function () {
		let { amount, user, error } = await parseArgs.bind(this)();
		if (error) return;

		if (!(await checkLimit.bind(this)(user, amount))) return;

		const message = await confirmation.bind(this)(user, amount);
		if (!message) return;

		if (!(await sendMoney.bind(this)(user, amount))) return;

		await sendMsg.bind(this)(user, amount, message);

		log.bind(this)(user, amount);
	},
});

async function parseArgs() {
	let amount, id, invalid;

	//Grab ID and Amount
	for (let i = 0; i < this.args.length; i++) {
		if (this.global.isInt(this.args[i]) && !amount) {
			amount = parseInt(this.args[i]);
		} else if (this.global.isUser(this.args[i]) && !id) {
			id = this.args[i].match(/[0-9]+/)[0];
		} else {
			invalid = true;
		}
	}

	//Check for valid amount/id
	if (invalid || !id || !amount || amount <= 0) {
		this.errorMsg(', invalid arguments! >:c', 3000);
		return { error: true };
	}

	//Check if valid user
	let user = await this.getMention(id);
	if (!user) {
		this.errorMsg(', I could not find that user', 3000);
		return { error: true };
	} else if (user.bot) {
		this.errorMsg(", You can't send cowoncy to a bot, silly!", 3000);
		return { error: true };
	} else if (user.id == this.msg.author.id) {
		this.send(
			'**💳 | ' +
				this.msg.author.username +
				'** sent **' +
				this.global.toFancyNum(amount) +
				' cowoncy** to... **' +
				user.username +
				'**... *but... why?*'
		);
		return { error: true };
	}

	return { user, amount };
}

async function sendMoney(user, amount) {
	const con = await this.startTransaction();
	try {
		const canGive = await cowoncyUtils.canGive.bind(this)(this.msg.author, user, amount, con);
		if (canGive.error) {
			this.errorMsg(canGive.error);
			await con.rollback();
			return false;
		}

		let sql = `UPDATE cowoncy SET money = money - ${amount} WHERE id = ${this.msg.author.id} AND money >= ${amount};`;
		sql += `INSERT INTO cowoncy (id, money) VALUES (${user.id}, ${amount}) ON DUPLICATE KEY UPDATE money = money + ${amount};`;
		sql += `INSERT INTO transaction (sender, reciever, amount) VALUES (${this.msg.author.id}, ${user.id}, ${amount});`;
		sql += canGive.sql;
		let result = await con.query(sql);

		if (!result[0].changedRows) {
			this.errorMsg(", you silly hooman! You don't have enough cowoncy!", 3000);
			await con.rollback();
			return false;
		}

		await con.commit();
		return true;
	} catch (err) {
		console.error(err);
		this.errorMsg(', there was an error sending cowoncy! Please try again later.', 3000);
		await con.rollback();
		return false;
	}
}

async function sendMsg(user, amount, message) {
	let text = `**💳 | ${this.msg.author.username}** sent **${this.global.toFancyNum(
		amount
	)} cowoncy** to **${user.username}**!`;
	text = alterGive.alter(this, this.msg.author.id, text, {
		from: this.msg.author,
		to: user,
		amount: this.global.toFancyNum(amount),
	});

	if (text.embed) {
		message.edit({ content: '', embed: text.embed, components: [] });
	} else {
		message.edit({ content: text, embed: null, components: [] });
	}
}

function log(user, amount) {
	this.neo4j.give(this.msg, user, amount);
	this.logger.incr('cowoncy', amount, { type: 'given' }, this.msg);
	this.logger.decr('cowoncy', -1 * amount, { type: 'give' }, this.msg);
}

async function confirmation(user, amount) {
	let embed = {
		description:
			`\nTo confirm this transaction, click ${agree} Confirm.` +
			`\nTo cancel this transaction, click ${decline} Cancel.` +
			`\n\n${this.config.emoji.warning} *It is against our rules to trade cowoncy for anything of monetary value. This includes real money, crypto, nitro, or anything similar. You will be* ***banned*** *for doing so.*`,
		color: this.config.embed_color,
		timestamp: new Date(),
		author: {
			name: `${this.msg.author.username}#${this.msg.author.discriminator}, you are about to give cowoncy to ${user.username}#${user.discriminator}`,
			icon_url: this.msg.author.avatarURL,
		},
		fields: [
			{
				name: `${this.msg.author.username}#${this.msg.author.discriminator} will give ${user.username}#${user.discriminator}:`,
				value: `\`\`\`fix\n${this.global.toFancyNum(amount)} cowoncy${spacer}\n\`\`\``,
				inline: true,
			},
		],
	};

	let components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: 'Confirm',
					style: 3,
					custom_id: 'give_accept',
					emoji: {
						id: null,
						name: agree,
					},
				},
				{
					type: 2,
					label: 'Cancel',
					style: 4,
					custom_id: 'give_decline',
					emoji: {
						id: null,
						name: decline,
					},
				},
			],
		},
	];

	const content = { embed, components };
	let message = await this.send(content);
	let filter = (componentName, reactionUser) =>
		['give_accept', 'give_decline'].includes(componentName) &&
		[this.msg.author.id].includes(reactionUser.id);
	let collector = this.interactionCollector.create(message, filter, {
		time: 900000,
		idle: 120000,
	});

	return new Promise((res, _rej) => {
		const accepted = {};
		collector.on('collect', async (component, reactionUser, ack, _err) => {
			if (component === 'give_decline') {
				collector.stop('done');
				content.embed.color = this.config.fail_color;
				content.components[0].components[0].disabled = true;
				content.components[0].components[1].disabled = true;
				content.content = `**${reactionUser.username}** declined the transaction`;
				await ack(content);
				res(false);
			} else {
				if (accepted[reactionUser.id]) {
					return;
				}
				accepted[reactionUser.id] = true;
				const usernames = [];
				for (let key in accepted) {
					if (key === this.msg.author.id) {
						usernames.push(this.msg.author.username + '#' + this.msg.author.discriminator);
					} else if (key === user.id) {
						usernames.push(user.username + '#' + user.discriminator);
					}
				}
				content.embed.footer = {
					text: usernames.join(' and ') + ' accepted!',
				};

				if (accepted[this.msg.author.id]) {
					collector.stop('done');
					content.embed.color = this.config.success_color;
					content.components[0].components[0].disabled = true;
					content.components[0].components[1].disabled = true;
					await ack(content);
					res(message);
				} else {
					await ack(content);
				}
			}
		});

		collector.on('end', async (reason) => {
			if (reason === 'done') return;
			content.embed.color = this.config.timeout_color;
			content.components[0].components[0].disabled = true;
			content.components[0].components[1].disabled = true;
			content.content = `${this.config.emoji.warning} This message is now inactive.`;
			try {
				await message.edit(content);
			} catch (err) {
				console.error(err);
				console.error(`[${message.id}] Could not edit message`);
			}
			res(false);
		});
	});
}

async function checkLimit(user, amount) {
	const canGive = await cowoncyUtils.canGive.bind(this)(this.msg.author, user, amount, this);
	if (canGive.error) {
		this.errorMsg(canGive.error);
		return false;
	}
	return true;
}
