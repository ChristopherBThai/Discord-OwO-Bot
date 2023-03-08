/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

module.exports = class Logs {
	constructor() {
		this.logs = [];
	}

	push(log, subLogs) {
		if (log) {
			if (log instanceof Logs) for (let i in log.logs) this.logs.push(log.logs[i]);
			else if (typeof log === 'string' || log instanceof String) this.logs.push(log);
			else if (log.logs instanceof Logs)
				for (let i in log.logs.logs) this.logs.push(log.logs.logs[i]);
		}
		if (subLogs) this.addSubLogs(subLogs);
	}

	addSubLogs(subLogs) {
		if (!subLogs) return;
		for (let i = 0; i < subLogs.logs.length; i++) {
			this.logs.push(`  ${subLogs.logs[i]}`);
		}
	}

	toString() {
		let result = '';
		for (let i in this.logs) {
			result += this.logs[i] + '\n';
		}
		return result;
	}
};
