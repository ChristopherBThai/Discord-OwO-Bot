/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const axios = require('axios');
const requireDir = require('require-dir');
const dir = requireDir('./');

class InteractionHandler {
	constructor(main) {
		this.listeners = {};
		let filename = __filename.slice(__dirname.length + 1, -3);
		for (let listener in dir) {
			if (listener != filename) {
				this.listeners[listener] = dir[listener].handle.bind(main);
			}
		}
	}

	emit(name, data) {
		if (this.listeners[name]) {
			const url = `https://discord.com/api/v8/interactions/${data.id}/${data.token}/callback`;
			const ack = (content) => {
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
			};
			const err = (content) => {
				if (typeof content === 'string') {
					content = { content };
				}
				if (content.embed) {
					content.embeds = [content.embed];
					delete content.embed;
				}
				content.flags = 64;
				return axios.post(url, {
					type: 4,
					data: content,
				});
			};
			this.listeners[name](data, ack, err);
			return true;
		}
		return false;
	}
}

module.exports = InteractionHandler;
