/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const mysql = require('./../botHandlers/mysqlHandler.js');

class CacheUtil {
	constructor() {
		this.getAnimalCount = this.getAnimalCount.bind(this);
		this.animalCount = {};
	}

	async getAnimalCount(animalName, ttl = 1 * 60 * 60 * 1000) {
		if (this.animalCount[animalName] !== undefined) {
			return this.animalCount[animalName];
		}

		const sql = `SELECT SUM(totalcount) as total FROM animal WHERE name = ?;`;
		const result = await mysql.query(sql, animalName);
		const total = result[0].total;

		// Only cache if we have over 1000 animals
		if (total > 1000) {
			this.animalCount[animalName] = total;
			setTimeout(() => {
				delete this.animalCount[animalName];
			}, ttl);
		}
		return total;
	}
}

module.exports = new CacheUtil();
