/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const EventEmitter = require('eventemitter3');
const axios = require('axios');

class InteractionCollector {
	constructor(main) {
		this.main = main;
		this.listeners = {};
	}

	create(msg, filter, opt = {}) {
		delete this.listeners[msg.id];
		let iee = new InteractionEventEmitter(filter, opt);
		iee.on('end', () => delete this.listeners[msg.id]);
		this.listeners[msg.id] = iee;

		return iee;
	}

	interact({ member, message, data, id, token }) {
		const listener = this.listeners[message.id] || this.listeners[message.interaction?.id];
		if (listener) {
			listener.interact(data, member.user, id, token);
		} else {
			const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`;
			const content = {
				content: '🚫 **|** You cannot use this button',
				flags: 64,
			};
			return axios.post(url, {
				type: 4,
				data: content,
			});
		}
	}
}

class InteractionEventEmitter extends EventEmitter {
	constructor(filter, { time = null, idle = null }) {
		super();
		this.filter = filter;
		this.ended = false;
		this.idleTimeout = idle;

		if (time) this.time = setTimeout(() => this.stop('time'), time);
		if (idle) this.idle = setTimeout(() => this.stop('idle'), idle);
	}

	checkFilter(componentName, user) {
		if (!this.filter) return true;
		return this.filter(componentName, user);
	}

	interact(component, user, id, token) {
		if (!this.checkFilter(component.custom_id, user)) {
			const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`;
			const content = {
				content: '🚫 **|** You cannot use this button',
				flags: 64,
			};
			return axios.post(url, {
				type: 4,
				data: content,
			});
		}
		if (this.ended) {
			const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`;
			const content = {
				content: '🚫 **|** This button is no longer active',
				flags: 64,
			};
			return axios.post(url, {
				type: 4,
				data: content,
			});
		}

		const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`;
		function ack(content) {
			if (content) {
				if (typeof content === 'string') {
					content = { content };
				}
				const newContent = { ...content };
				if (newContent.embed) {
					newContent.embeds = [newContent.embed];
					delete newContent.embed;
				}
				return axios.post(url, {
					type: 7,
					data: newContent,
				});
			} else {
				return axios.post(url, { type: 1 });
			}
		}

		function err(content) {
			if (typeof content === 'string') {
				content = { content };
			}
			if (content.embed) {
				content.embeds = [content.embed];
				delete content.embed;
			}
			const url = `https://discord.com/api/v8/interactions/${id}/${token}/callback`;
			content.flags = 64;
			return axios.post(url, {
				type: 4,
				data: content,
			});
		}

		this.emit('collect', component.custom_id, user, ack, err);

		if (this.idleTimeout) {
			clearTimeout(this.idle);
			this.idle = setTimeout(() => this.stop('idle'), this.idleTimeout);
		}
	}

	stop(reason) {
		if (this.ended) return;
		this.ended = true;

		if (this.time) {
			clearTimeout(this.time);
			this.time = null;
		}

		if (this.idle) {
			clearTimeout(this.idle);
			this.idle = null;
		}

		this.emit('end', reason);
		this.removeAllListeners();
	}
}

module.exports = InteractionCollector;
