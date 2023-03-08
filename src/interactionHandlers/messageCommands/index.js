/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const requireDir = require('require-dir');
const dir = requireDir('./');

class InteractionHandler {
	constructor(main) {
		this.listeners = {};
		let filename = __filename.slice(__dirname.length + 1, -3);
		for (let listener in dir) {
			if (listener != filename) {
				const interactionName = dir[listener].name;
				this.listeners[interactionName] = dir[listener].handle.bind(main);
			}
		}
	}

	emit(interaction) {
		if (this.listeners[interaction.command]) {
			this.listeners[interaction.command](interaction);
			return true;
		}
		return false;
	}
}

module.exports = InteractionHandler;
