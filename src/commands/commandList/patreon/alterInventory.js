/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const _blank = '<:blank:427371936482328596>';
const gems = require('../../../data/gems.json').gems;
const emojis = {
	box: '<:box:427352600476647425>',
	crate: '<:crate:523771259302182922>',
	wallpaper: '🖼️',
	photo: '🖼',
};
for (let i in gems) {
	emojis[i] = gems[i].emoji;
}

exports.alter = function (p, text, info) {
	switch (p.msg.author.id) {
		case '658299153042112512':
			return grace(text);
		case '456598711590715403':
			return lexx(p, info);
		case '427296171883626496':
			return lIlIIIll(p, info);
		case '460987842961866762':
			return estee(p, info);
		case '709396638661083146':
			return rosie(p, info);
		case '683742950668501001':
			return dadada(p, info);
		default:
			return text;
	}
};

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
		photo: '<:photo:792918613194440724>',
	};
	for (let i in newEmojis) {
		text = text.replace(emojis[i], newEmojis[i]);
	}
	text = text.split('\n');
	text[0] = "𝔊𝔯𝔞𝔠𝔢'𝔰 𝔇𝔦𝔤𝔦 𝔖𝔲𝔭𝔭𝔩𝔦𝔢𝔰";
	text = text.join('\n');

	return text;
}

function lexx(p, info) {
	const embed = {
		color: p.config.embed_color,
		description: `**${info.user.username}'s inv of Rings, Tickets, Gems & Weapons**\n${info.inv}`,
	};
	return { embed };
}

function lIlIIIll(p, info) {
	const embed = {
		color: 1,
		image: {
			url: 'https://cdn.discordapp.com/attachments/787404412335161354/889274811908513842/output-onlinegiftools_34.gif',
		},
		description: `**====== ${info.user.username}'s Inventory ======**\n${info.inv}`,
	};
	return { embed };
}

function estee(p, info) {
	const embed = {
		color: 8421504,
		author: {
			name: "꧁•⊹٭𝙴𝚜𝚝𝚎𝚎'𝚜 𝚂𝚎𝚌𝚛𝚎𝚝 𝚃𝚛𝚎𝚊𝚜𝚞𝚛𝚎𝚜٭⊹•꧂",
		},
		image: {
			url: 'https://imgur.com/YNXAIZC.gif',
		},
		description: info.inv,
	};
	return { embed };
}

function rosie(p, info) {
	const embed = {
		color: 1,
		author: {
			name: '❀ 𝐑𝐨𝐬𝐢𝐞𝐬 𝐅𝐥𝐨𝐰𝐞𝐫 𝐈𝐧𝐯𝐞𝐧𝐭𝐨𝐫𝐲 ❀',
		},
		image: {
			url: 'https://cdn.discordapp.com/attachments/915122067865751562/976038270255378512/3A85D5FA-B90D-40B5-AB5F-C7EEBCDCB4C1.gif',
		},
		description: info.inv,
	};
	return { embed };
}

function dadada(p, info) {
	const embed = {
		color: 1,
		image: {
			url: 'https://cdn.discordapp.com/attachments/961392039482753064/1004148773582295070/DA43901A-C66C-460A-AC6F-9DF885F253AB.gif',
		},
		description: `**<a:heart:1016125455511851068> 𝔻𝕒𝕕𝕒’𝕤 𝕚𝕟𝕧𝕖𝕟𝕥𝕠𝕣𝕪 <a:heart:1016125455511851068>**\n${info.inv}`,
	};
	return { embed };
}
