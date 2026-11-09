/*
 * OwO Bot for Discord
 * Copyright (C) 2024 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['refreshanimals', 'ra'],

	owner: true,

	execute: function (p) {
		let animalName;
		if (p.args[0]) {
			animalName = p.args[0];
		}
		p.send('Refreshing all animals');
		p.pubsub.publish('refreshAnimals', { animalName });
	},
});
