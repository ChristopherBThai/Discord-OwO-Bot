/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

/* Checks the current ram every hour.
 * It resets the all shards if we have less than 0.75GB of ram left
 */
const si = require('systeminformation');
// const global = require('./global.js');
/* Interval to check (0.5H) */
const interval = 3600000 / 2;
/* Minimum ram (1.5GB) */
const resetbyte = 2.5 * 1024 * 1024 * 1024;

class RamCheck {
	constructor() {
		setInterval(this.check, interval);
	}

	async check() {
		let mem = await si.mem();
		let ram = mem.available - mem.swaptotal;
		console.log('CURRENT RAM: ' + ram / (1024 * 1024 * 1024) + 'G');
		if (ram <= resetbyte) {
			console.log('NOT ENOUGH RAM. RESETTING SHARDS');
			//global.resetBot();
		}
	}
}

module.exports = RamCheck;
