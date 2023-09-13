/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

module.exports = class Tags {
	constructor({ me, allies, enemies }, tags = {}) {
		this._me = me;
		this._allies = allies;
		this._enemies = enemies;
		this.tags = tags;
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

	copy({ me, allies, enemies } = {}) {
		me = me || this._me;
		allies = allies || this._allies;
		enemies = enemies || this._enemies;
		return new Tags({ me, allies, enemies }, JSON.parse(JSON.stringify(this.tags)));
	}

	copyAdd(tag, animal, info) {
		const copy = this.copy(info);
		copy.add(tag, animal);
		return copy;
	}

	get allies() {
		return this._allies;
	}

	getAnimalAllies(animal) {
		for (let i in this.allies) {
			if (animal.pid === this.allies[i].pid) {
				return this.allies;
			}
		}
		for (let i in this.enemies) {
			if (animal.pid === this.enemies[i].pid) {
				return this.enemies;
			}
		}
		return [];
	}

	get me() {
		return this._me;
	}

	get enemies() {
		return this._enemies;
	}

	getAnimalEnemies(animal) {
		for (let i in this.allies) {
			if (animal.pid === this.allies[i].pid) {
				return this.enemies;
			}
		}
		for (let i in this.enemies) {
			if (animal.pid === this.enemies[i].pid) {
				return this.allies;
			}
		}
		return [];
	}
};
