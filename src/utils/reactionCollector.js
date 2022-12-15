/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const EventEmitter = require('eventemitter3');

class ReactionCollector {
	constructor(main) {
		this.main = main;
		this.listeners = {};
	}

	create(msg, filter, opt = {}) {
		delete this.listeners[msg.id];
		let ree = new ReactionEventEmitter(filter, opt);
		ree.on('end', () => delete this.listeners[msg.id]);
		this.listeners[msg.id] = ree;

		return ree;
	}

	react(msg, emoji, userID, type) {
		if (!this.listeners[msg.id]) return;
		this.listeners[msg.id].collect(emoji, userID, type);
	}
}

class ReactionEventEmitter extends EventEmitter {
	constructor(filter, { time = null, idle = null }) {
		super();
		this.filter = filter;
		this.ended = false;
		this.idleTimeout = idle;

		if (time) this.time = setTimeout(() => this.stop('time'), time);
		if (idle) this.idle = setTimeout(() => this.stop('idle'), idle);
	}

	checkFilter(emoji, userID) {
		if (!this.filter) return true;
		return this.filter(emoji, userID);
	}

	collect(emoji, userID, type) {
		if (!this.checkFilter(emoji, userID)) return;
		if (this.ended) return;

		this.emit('collect', emoji, userID, type);

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

module.exports = ReactionCollector;
