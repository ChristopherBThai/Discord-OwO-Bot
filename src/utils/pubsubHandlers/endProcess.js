/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

let timer;

exports.handle = async function (main, _message) {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	const time = main.clusterID * 3 * 60 * 1000;
	console.log('ending ' + main.clusterID + ' in ' + time + 'ms');
	timer = setTimeout(() => {
		process.exit(0);
	}, time);
};
