/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const mysql = require('./../botHandlers/mysqlHandler.js');

class CacheUtil {
	constructor() {
		this.getUid = this.getUid.bind(this);
		this.getAnimalNames = this.getAnimalNames.bind(this);
		this.get = this.get.bind(this);
		this.set = this.set.bind(this);
		this.cache = {};
	}

	get(type, key) {
		if (this.cache[type]) {
			return this.cache[type][key];
		}
		return undefined;
	}

	set(type, key, value, ttl) {
		if (!this.cache[type]) {
			this.cache[type] = {};
		}
		this.cache[type][key] = value;
		if (ttl) {
			setTimeout(() => {
				delete this.cache[type][key];
			}, ttl);
		}
	}

	clear(type, key) {
		if (!this.cache[type]) {
			return;
		}
		delete this.cache[type][key];
	}

	async getAnimalCount(animalName) {
		let result = this.get('animalcount', animalName);
		if (result) {
			return result;
		}

		const sql = `SELECT SUM(totalcount) as total FROM animal WHERE name = ?;`;
		result = await mysql.query(sql, animalName);
		const total = result[0].total;

		// Only cache if we have over 1000 animals
		if (total > 1000) {
			this.set('animalcount', animalName, total, 1 * 60 * 60 * 1000);
		}
		return total;
	}

	async getUid(id) {
		id = BigInt(id);
		let result = this.get('uid', id);
		if (result) {
			return result;
		}
		let sql = 'SELECT uid FROM user where id = ?;';
		result = await mysql.query(sql, id);

		if (result[0]?.uid) {
			this.set('uid', id, result[0].uid);
			return result[0].uid;
		}

		sql = 'INSERT INTO user (id, count) VALUES (?, 0);';
		result = await mysql.query(sql, id);

		this.set('uid', id, result.insertId);
		return result.insertId;
	}

	async getQuests(id) {
		let result = this.get('quest', id);
		if (result) {
			return result;
		}

		/* Check if user has this quest */
		const uid = await this.getUid(id);
		result = await mysql.query('SELECT * FROM quest WHERE uid = ?;', [uid]);

		this.set('quest', id, result, 1 * 60 * 60 * 1000);
		return result;
	}

	clearQuests(id) {
		this.clear('quest', id);
	}

	async getQuestByName(questName, id, showLocked = false) {
		const quests = await this.getQuests(id);
		return quests.filter((quest) => {
			return quest.qname === questName && (showLocked || quest.locked === 0);
		});
	}

	async getAnimalNames(id) {
		id = BigInt(id);
		let result = this.get('animalNames', id);
		if (result) {
			return result;
		}

		const sql = `SELECT name FROM animal WHERE id = ${id};`;
		result = await mysql.query(sql);
		const animals = {};
		result.forEach((row) => {
			animals[row.name] = true;
		});
		this.set('animalNames', id, animals);
		return animals;
	}

	async insertAnimal(id, animalName) {
		const animals = await this.getAnimalNames(id);
		if (animals[animalName]) {
			return;
		}

		const sql = `INSERT IGNORE INTO animal (id, name, count, totalcount) VALUES (${id}, '${animalName}', 0, 0);`;
		await mysql.query(sql);

		animals[animalName] = true;
	}
}

module.exports = new CacheUtil();
