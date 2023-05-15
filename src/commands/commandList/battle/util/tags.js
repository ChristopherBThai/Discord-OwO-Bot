/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

module.exports = class Tags {
	constructor({ me, allies, enemies }) {
		this._me = me;
		this._allies = allies;
		this._enemies = enemies;
		this.tags = {};
	}

	add(tag, animal) {
		if (!this.tags[tag]) {
			this.tags[tag] = {};
		}
		this.tags[tag][animal.pid] = true;
	}

	has(tag, animal) {
		if (this.tags[tag]) {
			return !!this.tags[tag][animal.pid];
		}
		return false;
	}

	get allies() {
		return this._allies;
	}

	get me() {
		return this._me;
	}

	get enemies() {
		return this._enemies;
	}
};
