/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
exports.handle = async function(main) {
	let timer;
	if (timer) {
		clearTimeout(timer);
		delete timer;
	}
	const time = main.clusterID * 3 * 60 * 1000;
	console.log(`Ending ${main.clusterID} in ${time}ms`);
	timer = setTimeout(() => {
		process.exit(0);
	}, time);
};
