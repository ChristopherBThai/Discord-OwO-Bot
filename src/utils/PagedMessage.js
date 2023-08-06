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

	async getContents() {
		let contents = await this.getEmbed(this.currentPage, this.maxPage);
		if (!contents.embed) {
			contents = { embed: contents };
		}
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
		contents.components = this.components;
		return contents;
	}

	async sendMsg(time, idle) {
		this.msg = await this.p.send(await this.getContents());

		const componentIds = ['next', 'prev'];
		const userIds = this.allowedUsers || [this.p.msg.author.id];
		const filter = (componentName, user) =>
			(this.additionalFilter && this.additionalFilter(componentName, user)) ||
			(componentIds.includes(componentName) && (this.allowEveryone || userIds.includes(user.id)));

		this.collector = this.p.interactionCollector.create(this.msg, filter, {
			time,
			idle,
		});

		this.collector.on('collect', async (component, user, ack) => {
			if (component == 'next') {
				this.currentPage++;
				if (this.currentPage > this.maxPage) this.currentPage = 0;
				ack(await this.getContents());
			} else if (component == 'prev') {
				this.currentPage--;
				if (this.currentPage < 0) this.currentPage = this.maxPage;
				ack(await this.getContents());
			} else {
				this.emit('button', component, user, ack, {
					currentPage: this.currentPage,
					maxPage: this.maxPage,
				});
			}
		});

		this.collector.on('end', async (reason) => {
			this.removeAllListeners();
			const contents = await this.getContents();
			disableComponents(contents.components);
			contents.embed.color = 6381923;
			contents.content = 'This message is now inactive.';
			await this.msg.edit(contents);
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
