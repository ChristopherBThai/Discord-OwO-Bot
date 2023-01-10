/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const EventEmitter = require('eventemitter3');

class PagedMessage extends EventEmitter {
	constructor(
		p,
		getEmbed,
		maxPage,
		{
			startingPage = 0,
			time,
			idle,
			allowEveryone,
			allowedUsers,
			additionalFilter,
			additionalButtons = [],
		}
	) {
		super();
		this.p = p;
		this.getEmbed = getEmbed;
		this.maxPage = maxPage;
		this.currentPage = startingPage;
		this.allowedUsers = allowedUsers;
		this.allowEveryone = allowEveryone;
		this.additionalFilter = additionalFilter;
		this.additionalButtons = additionalButtons;

		this.sendMsg(time, idle);
	}

	async sendMsg(time, idle) {
		const embed = await this.getEmbed(this.currentPage, this.maxPage);
		this.components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						label: '<',
						style: 1,
						custom_id: 'prev',
					},
					{
						type: 2,
						label: '>',
						style: 1,
						custom_id: 'next',
					},
				],
			},
		];
		this.additionalButtons.forEach((button) => {
			this.components[0].components.push(button);
		});
		this.msg = await this.p.send({ embed, components: this.components });

		const componentIds = ['next', 'prev'];
		const userIds = this.allowedUsers || [this.p.msg.author.id];
		const filter = (componentName, user) =>
			this.additionalFilter(componentName, user) ||
			(componentIds.includes(componentName) && (this.allowEveryone || userIds.includes(user.id)));

		this.collector = this.p.interactionCollector.create(this.msg, filter, {
			time,
			idle,
		});

		this.collector.on('collect', async (component, user, ack) => {
			if (component == 'next') {
				this.currentPage++;
				if (this.currentPage > this.maxPage) this.currentPage = 0;
				const embed = await this.getEmbed(this.currentPage, this.maxPage);
				ack({ embed, components: this.components });
			} else if (component == 'prev') {
				this.currentPage--;
				if (this.currentPage < 0) this.currentPage = this.maxPage;
				const embed = await this.getEmbed(this.currentPage, this.maxPage);
				ack({ embed, components: this.components });
			} else {
				this.emit('button', component, user, ack, {
					currentPage: this.currentPage,
					maxPage: this.maxPage,
				});
			}
		});

		this.collector.on('end', async (reason) => {
			this.removeAllListeners();
			const embed = await this.getEmbed(this.currentPage, this.maxPage);
			disableComponents(this.components);
			embed.color = 6381923;
			await this.msg.edit({
				content: 'This message is now inactive.',
				embed,
				components: this.components,
			});
			this.emit('end', reason);
		});
	}
}

function disableComponents(components) {
	for (let i in components) {
		const component = components[i];
		if (component.type == 2) {
			component.disabled = true;
		} else if (component.type == 1) {
			disableComponents(component.components);
		}
	}
}

module.exports = PagedMessage;
