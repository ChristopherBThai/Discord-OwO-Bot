/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Pikachu extends Collectible {
	constructor() {
		super();

		this.key = 'pikachu';
		this.alias = ['pikachu', 'chu'];
		this.emoji = '<a:pikachu:1099236809390702612>';
		this.owners = [
			'768465041489657867',
			'968621197011062804',
			'879313703990870047',
			'969176350621589514',
		];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Charmeleons are red,\nWartortles are blue,\nIf you catch my heart,\nI’ll be your pikachu`;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Pikachu?plural?**';
		this.brokeMsg = ', you do not have any Pikachus! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Pikachu** from **?giver?**';

		this.init();
	}
}

module.exports = new Pikachu();
