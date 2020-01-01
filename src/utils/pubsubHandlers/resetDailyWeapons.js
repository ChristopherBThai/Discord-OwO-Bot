/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const dailyWeaponUtil = require('../../commands/commandList/battle/util/dailyWeaponUtil.js');

exports.handle = async function(main, message){
	if(main.debug) return;
	let {clusterID} = JSON.parse(message);
	if(clusterID!=main.clusterID) return;
	await dailyWeaponUtil.resetDailyWeapons();
}
	
