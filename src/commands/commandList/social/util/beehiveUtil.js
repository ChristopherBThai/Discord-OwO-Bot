/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const redis = require('../../../../utils/redis.js');
const pridebees = require('../../../../data/pridebee.json');
for (let i in pridebees) {
	pridebees[i].id = i;
}

exports.getBees = async function (id) {
	const bees = (await redis.hgetall(`bees_${id}`)) || {};
	const result = {};
	for (let i in bees) {
		if (pridebees[i]) {
			result[i] = {
				...pridebees[i],
				count: bees[i],
			};
		}
	}
	const total = (await redis.zscore(`bee_rank`, id)) || 0;

	return {
		bees: result,
		total,
	};
};

exports.addBee = async function (id, beeId) {
	const bee = pridebees[beeId];
	if (!bee) {
		throw `Invalid bee id: ${beeId}`;
	}
	const count = await redis.hincrby(`bees_${id}`, bee.id, 1);
	const totalcount = await redis.incr(`bee_rank`, id, 1);
	return { count, bee, totalcount };
};
