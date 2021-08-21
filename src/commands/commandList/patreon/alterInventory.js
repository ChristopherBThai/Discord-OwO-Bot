/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
const gems = require('../../../data/gems.json').gems;
const emojis = {
	box: '<:box:427352600476647425>',
	crate: '<:crate:523771259302182922>',
	wallpaper: '🖼️',
	photo: '🖼'
}
for (let i in gems) {
	emojis[i] = gems[i].emoji;
}

exports.alter = function(p, text, info) {
	switch(p.msg.author.id){
		case '658299153042112512':
			return grace(text);
		case '456598711590715403':
			return lexx(p, info);
		default:
			return text;
	}
}

function grace(text) {
	let newEmojis = {
		cgem1: '<:LoveDigivice:686456567419502622>',
		ugem1: '<:CourageDigivice:686456568056774687>',
		rgem1: '<:SincerityDigivice:686456568299913236>',
		egem1: '<:FriendshipDigivice:686456567511777320>',
		mgem1: '<:KnowledgeDigivice:686456567738007552>',
		lgem1: '<:HopeDigivice:686456568748834816>',
		fgem1: '<:LightDigivice:686456568329404436>',

		cgem3: '<:LoveDigicrest:686456648708915282>',
		ugem3: '<:CourageDigicrest:686456648348467210>',
		rgem3: '<:SincerityDigicrest:686456648457388032>',
		egem3: '<:FriendshipDigicrest:686456648675491865>',
		mgem3: '<:KnowledgeDigicrest:686456648973549599>',
		lgem3: '<:HopeDigicrest:686456648796995595>',
		fgem3: '<:LightDigicrest:686456649074212864>',

		cgem4: '<:SoraD3:686456689905762306>',
		ugem4: '<:TaichiD3:686456687682519056>',
		rgem4: '<:MimiD3:686456690207621161>',
		egem4: '<:YamatoD3:686456690182586368>',
		mgem4: '<:IzumiD3:686456690186387496>',
		lgem4: '<:TakeruD3:686456687363751937>',
		fgem4: '<:HikariD3:686456689225891901>',

		box: '<:Lootbox:691662873574768711>',
		crate: '<:WeaponCrate:691662214070796328>',
		wallpaper: '<:Background:686845466582974470>',
		photo: '<:photo:792918613194440724>'
	}
	for (let i in newEmojis) {
		text = text.replace(emojis[i], newEmojis[i]);
	}
	text = text.split('\n');
	text[0] = '𝔊𝔯𝔞𝔠𝔢\'𝔰 𝔇𝔦𝔤𝔦 𝔖𝔲𝔭𝔭𝔩𝔦𝔢𝔰';
	text = text.join('\n');

	return text;
}

function lexx (p, info) {
	const embed = {
		color: p.config.embed_color,
		image: {
			url: "https://cdn.discordapp.com/attachments/696878982758531152/840432649336127488/AmyWong.png"
		},
		description: `**${info.user.username}'s inv of Rings, Tickets, Gems & Weapons**\n${info.inv}`
	}
	return { embed }
}
