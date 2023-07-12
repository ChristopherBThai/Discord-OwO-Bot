/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['addpet'],

	owner: true,

	execute: async function () {
		const name = this.args[0];
		const id = this.args[1];

		const animal = this.global.validAnimal(name);
		if (!animal) {
			return this.errorMsg(', Unknown animal');
		}
		if (!this.global.isInt(id)) {
			return this.errorMsg(', Invalid user id');
		}

		const sql = `INSERT INTO animal (id, name, count, totalcount) VALUES (?, ?, 1, 1);`;
		const result = await this.query(sql, [id, animal.value]);
		this.send(`\`\`\`\n${JSON.stringify(result, null, 2)}\n\`\`\``);
	},
});
