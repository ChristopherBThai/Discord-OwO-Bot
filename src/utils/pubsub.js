/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const redis = require('redis');
const sub = redis.createClient({
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASS,
});
const pub = redis.createClient({
	host: process.env.REDIS_HOST,
	password: process.env.REDIS_PASS,
});

const requireDir = require('require-dir');
const dir = requireDir('./pubsubHandlers');

class PubSub {
	constructor(main) {
		// Add all events to an object
		this.channels = {};
		for (let listener in dir) {
			this.channels[listener] = dir[listener];
		}

		// Redirect messages to handlers
		sub.on('message', (channel, message) => {
			if (this.channels[channel]) {
				this.channels[channel].handle(main, message);
			}
		});

		// Subscribe to all events in the pubsubHandler folder
		sub.subscribe(Object.keys(this.channels));
	}

	async publish(channel, message = true) {
		if (typeof message == 'object') message = JSON.stringify(message);
		return await pub.publish(channel, message);
	}
}

module.exports = PubSub;
