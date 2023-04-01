/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.alter = function (id, text, opt) {
	switch (id) {
		case '605994815317999635':
			return rhine(text, opt);
		case '459469724091154433':
			return quincey(text, opt);
		default:
			return text;
	}
};

function quincey(text, opt) {
	delete text.author.icon_url;
	text.author.name = "Quincey's " + opt.weapon.name;
	let description = text.description.split('\n');
	description[0] = '';
	description[1] = '**Owner:** Quincey ' + description[2];
	description.splice(3, 1);
	description.splice(2, 1);
	text.description = description.join('\n');

	switch (opt.weapon.rank?.name) {
		case 'Common':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967107847592747108/ezgif-1-c261544e0a.gif',
			};
			text.color = 13391445;
			break;
		case 'Uncommon':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108215689084958/ezgif-1-db8ec58a09.gif ',
			};
			text.color = 3978440;
			break;
		case 'Rare':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108216607604746/ezgif-1-431e2a63a0.gif',
			};
			text.color = 16107621;
			break;
		case 'Epic':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108218029506632/ezgif-1-ecf20f91c3.gif',
			};
			text.color = 4611818;
			break;
		case 'Mythical':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108218985779210/ezgif-1-d7cad771e7.gif',
			};
			text.color = 10445814;
			break;
		case 'Legendary':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108219610726441/ezgif-1-09cded431c.gif',
			};
			text.color = 16577355;
			break;
		case 'Fabled':
			text.image = {
				url: 'https://media.discordapp.net/attachments/606042546744852500/967108220227297380/ezgif-1-465fb20b21.gif',
			};
			text.color = 10280698;
			break;
	}

	return text;
}

function rhine(text, opt) {
	switch (opt.weapon.rank?.name) {
		case 'Common':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666108133130261/Design_1.gif',
			};
			text.color = 10761268;
			break;
		case 'Uncommon':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666105264222328/Design_2.gif',
			};
			text.color = 2396040;
			break;
		case 'Rare':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666106132435014/Design_4.gif',
			};
			text.color = 13540136;
			break;
		case 'Epic':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666105629130823/Design_3.gif',
			};
			text.color = 3689939;
			break;
		case 'Mythical':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666106577043586/Design_5.gif',
			};
			text.color = 9054434;
			break;
		case 'Legendary':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666107218759781/Design_6.gif',
			};
			text.color = 16776192;
			break;
		case 'Fabled':
			text.image = {
				url: 'https://media.discordapp.net/attachments/1045735158281678930/1048666107705307226/Design_7.gif',
			};
			text.color = 8900331;
			break;
	}

	return text;
}
