/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
class InteractionHandler {
	constructor(main) {
		this.buttons = new (require('./button'))(main);
		this.messages = new (require('./messageCommands'))(main);
	}
}

module.exports = InteractionHandler;
