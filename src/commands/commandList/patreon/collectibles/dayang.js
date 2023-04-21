/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Dayang extends Collectible {
	constructor() {
		super();

		this.key = 'dayang';
		this.emoji = '<a:dayang:1098860750891655219>';
		this.owners = ['707939636835516457'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Hallo...!!\nI am dayang🌷 from Indonesia\n\nWhen you have 𝖈𝖎𝖓𝖙𝖆, 𝖐𝖆𝖘𝖎𝖍 and 𝖘𝖆𝖞𝖆𝖓𝖌, you can get my 𝖇𝖚𝖓𝖌𝖆 as a present from me...♡\n\n♧ OwOd cinta ♧ OwOd kasih ♧ OwOd sayang ♧\n♧ find me in .gg/direwolf`;
		this.displayMsg =
			'?emoji? **| ?user?**, you currently have **?count? ?emoji? Dayang?plural?!**';
		this.brokeMsg = ', you do not have any Dayangs! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Dayang** from **?giver?**';

		this.init();
	}
}

module.exports = new Dayang();
