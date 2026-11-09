/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PassiveInterface = require('../PassiveInterface.js');

module.exports = class Snail extends PassiveInterface {
	init() {
		this.id = 21;
		this.name = 'Knowledge';
		this.basicDesc = '';
		this.emojis = [
			'<:ckno:1155427304663691294>',
			'<:ukno:1155427316000886794>',
			'<:rkno:1155427313857605652>',
			'<:ekno:1155427306437873848>',
			'<:mkno:1155427312234418236>',
			'<:lkno:1155427310355353610>',
			'<:fkno:1155427308480503808>',
		];
		this.statDesc =
			'This passive does not do anything in battle. However, it will give this animal **?%** extra xp after each battle.';
		this.qualityList = [[5, 15]];
	}
};
