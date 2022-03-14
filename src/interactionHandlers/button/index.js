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
	constructor (main) {
		this.listeners = {};
		let filename = __filename.slice(__dirname.length + 1, -3);
		for (let listener in dir) {
			if (listener != filename) {
				this.listeners[listener] = dir[listener].handle.bind(main);
			}
		}
	}

	emit (name, data) {
		if (this.listeners[name]) {
			const url = `https://discord.com/api/v8/interactions/${data.id}/${data.token}/callback`
			const ack = () => {
				return axios.post(url, { type: 6 });
			}
			this.listeners[name](data, ack);
			return true;
		}
		return false;
	}
}

module.exports = InteractionHandler;
