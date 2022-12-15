/*
 * Official OwO Bot for Discord
 * Copyright (C) 2018 - 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
*/
const dailyWeaponUtil = require('../../commands/commandList/battle/util/dailyWeaponUtil');

exports.handle = async function(main, message) {
	if (main.debug) return;
	let { shardID } = JSON.parse(message);
	if (!main.bot.shards.has(shardID)) return;
	await dailyWeaponUtil.resetDailyWeapons();
};	
