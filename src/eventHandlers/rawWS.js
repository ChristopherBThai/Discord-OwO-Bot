/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const User = require('../../node_modules/eris/lib/structures/User');
const axios = require('axios');

exports.handle = function (packet, _id) {
	if (packet.t === 'INTERACTION_CREATE') {
		switch (packet.d.type) {
			case 2:
				handleApplicationCommand.bind(this)(packet);
				break;

			// Buttons
			case 3:
				handleMessageComponent.bind(this)(packet);
				break;
		}
	}
};

function handleApplicationCommand(packet) {
	const interaction = new Interaction(this.bot, packet.d);
	switch (packet.d.data.type) {
		// Slash commands
		case 1:
			// this.command.executeInteraction(interaction);
			break;

		// Message commands
		case 3:
			this.interactionHandlers.messages.emit(interaction);
			break;
	}
}

function handleMessageComponent(packet) {
	this.interactionHandlers.buttons.emit(packet.d.data.custom_id, packet.d) ||
		this.interactionCollector.interact(packet.d);
}

class Interaction {
	constructor(bot, data) {
		this.interaction = true;
		this.command = data.data.name;
		this.id = data.id;

		this.channel = bot.getChannel(data.channel_id) || {
			id: data.channel_id,
		};

		const author = data.member.user;
		if (author.discriminator !== '0000') {
			this.author = bot.users.update(author, bot);
		} else {
			this.author = new User(author, bot);
		}

		if (this.channel.guild) {
			if (data.member) {
				data.member.id = this.author.id;
				this.member = this.channel.guild.members.update(data.member, this.channel.guild);
			} else if (this.channel.guild.members.has(this.author.id)) {
				this.member = this.channel.guild.members.get(this.author.id);
			} else {
				this.member = null;
			}

			if (!this.guildID) {
				this.guildID = this.channel.guild.id;
			}
		} else {
			this.member = null;
		}

		this.replied = false;
		this.token = data.token;
		this.url = `https://discord.com/api/v8/interactions/${data.id}/${data.token}/callback`;
		this.followUpUrl = `https://discord.com/api/v8/webhooks/${bot.application.id}/${data.token}/messages/@original`;

		this.packet = data;

		// TODO
		this.args = [];
	}

	async createMessage(content, file, del) {
		await axios.post(this.url, {
			type: 4,
			data: content,
		});

		if (del) {
			setTimeout(() => {
				axios.delete(this.followUpUrl);
			}, del);
		}

		return {
			id: this.id,
			channel: this.channel,
			edit: (content) => {
				if (typeof content === 'string') {
					content = { content };
				}
				if (content.embed) {
					content.embeds = [content.embed];
					delete content.embed;
				}
				return axios.patch(this.followUpUrl, content);
			},
		};
	}
}
