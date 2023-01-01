/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const ban = require('../../../utils/ban.js');
const config = require('../../../data/config.json');

const feedbackChannel = '519778148888346635';
const supportGuild = '420104212895105044';
const check = '✅';
const cross = '❎';
const interactionAgree = 'interaction_agree';
const interactionDisagree = 'interaction_disagree';

module.exports = new CommandInterface({
	alias: ['suggest'],

	args: '{msg}',

	desc: 'Suggest a new feature. You must be in our support server to suggest.\n' + config.guildlink,

	example: ['owo suggest Add a new type of gamble!'],

	related: [],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles', 'addReactions'],

	group: ['utility'],

	cooldown: 600000,
	half: 15,
	six: 30,

	execute: async function () {
		let message = this.args.join(' ');

		if (!message || message === '') {
			this.errorMsg(', you need to add a message silly!', 3000);
			return this.setCooldown(5);
		} else if (message.length > 1500) {
			this.errorMsg(', Messages must be under 1500 characters!', 3000);
			return this.setCooldown(5);
		} else if (message.length < 25) {
			this.errorMsg(', the message is too short!', 3000);
			return this.setCooldown(5);
		} else if (this.msg.channel.guild.id != supportGuild) {
			this.errorMsg(
				', you can only create suggests from our support server! Join us at ' +
					this.config.guildlink
			);
			return this.setCooldown(5);
		}

		await suggest.bind(this)(message);
	},
});

// Allow the user to confirm the suggestion before sending
async function suggest(message) {
	const embed = {
		color: this.config.embed_color,
		author: {
			name: this.msg.author.username + "'s suggestion",
			icon_url: this.msg.author.avatarURL,
		},
		description: message,
		fields: [
			{
				name: 'This suggestion will be sent to the OwO bot support server. Suggestions should not be abused. Do you confirm that this is appropriate and a valid suggestion?',
				value: 'You can be banned if you do not follow the rules.',
			},
		],
	};

	const components = [
		{
			type: 1,
			components: [
				{
					type: 2,
					label: 'I Understand',
					style: 1,
					custom_id: interactionAgree,
					emoji: {
						id: null,
						name: check,
					},
				},
				{
					type: 2,
					label: 'Nevermind',
					style: 1,
					custom_id: interactionDisagree,
					emoji: {
						id: null,
						name: cross,
					},
				},
			],
		},
	];

	const msg = await this.send({ embed, components });

	const filter = (componentName, user) =>
		[interactionAgree, interactionDisagree].includes(componentName) &&
		user.id === this.msg.author.id;
	const collector = this.interactionCollector.create(msg, filter, {
		time: 900000,
	});

	collector.on('collect', async (componentName, user, ack) => {
		collector.stop('done');
		components[0].components[0].disabled = true;
		components[0].components[1].disabled = true;
		embed.color = this.config.timeout_color;

		if (componentName === interactionAgree) {
			const result = await confirmSuggestion.bind(this)(message);
			if (result) {
				embed.color = this.config.success_color;
				embed.footer = {
					text: check + ' The suggestion has been posted! Thank you!',
				};
			}
		} else if (componentName === interactionDisagree) {
			embed.footer = {
				text: cross + ' You decided not to post the suggestion!',
			};
			embed.color = this.config.fail_color;
			this.setCooldown(5);
		}

		await ack({ embed, components });
	});

	collector.on('end', async (reason) => {
		if (reason != 'done') {
			embed.color = this.config.timeout_color;
			components[0].components[0].disabled = true;
			components[0].components[1].disabled = true;
			try {
				await msg.edit({ embed, components });
			} catch (err) {
				console.error(`[${msg.id}] Could not edit message`);
			}
		}
	});
}

// Sends suggestion to support channel
async function confirmSuggestion(message) {
	// Check for banned words
	const temp = message.replace(/\s/gi, '').toLowerCase();
	for (let i in this.badwords) {
		if (temp.indexOf(this.badwords[i]) >= 0) {
			await ban.banCommand(
				this,
				this.msg.author,
				this.commandAlias,
				`Your suggestion did not seem appropriate\n${this.config.emoji.blank} **| Your suggestion:** ${message}\n${this.config.emoji.blank} **| Bad word:** ${this.badwords[i]}`
			);
			return false;
		}
	}

	const embed = {
		color: this.config.embed_color,
		timestamp: new Date(),
		author: {
			name: this.msg.author.username + "'s suggestion",
			icon_url: this.msg.author.avatarURL,
		},
		description: message,
		footer: {
			text: this.msg.author.id,
		},
	};
	this.sender.msgChannel(feedbackChannel, { embed }, { react: ['👍', '🔁', '👎'] });

	return true;
}
