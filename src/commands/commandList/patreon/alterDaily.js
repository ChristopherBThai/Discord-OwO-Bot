/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
//const alterUtils = require('../../../utils/alterUtils.js');

exports.alter = async function (_p, _info) {
	return;
	/*
	const replacers = {
		username: p.getName(info.user),
		discriminator: info.user.discriminator,
		blank: p.config.emoji.blank,
		amount: alterInfo.amount,
		streak: alterInfo.streak,
		box_emoji: alterInfo.box_emoji,
		box_name: alterInfo.box_name,
	};
	let type;
	if (alterInfo.marriage) {
		type = 'display';
		replacers.ring_name = alterInfo.ring_name;
		replacers.ring_emoji = alterInfo.ring_emoji;
		replacers.marriage_amount = alterInfo.marriage_amount;
		replacers.marriage_box_emoji = alterInfo.marriage_box_emoji;
		replacers.marriage_box_name = alterInfo.marriage_box_name;
		replacers.partner = p.getName(alterInfo.partner);
	} else {
		type = 'marriage';
	}

	return alterUtils.getAlterCommand('daily', info.user, type, replacers);
	*/
};
