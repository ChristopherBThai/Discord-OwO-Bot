/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const _blank = '<:blank:427371936482328596>';
const eggplant = '<:eggplant:417475705719226369>';
const heart = '<:heart:417475705899712522>';
const cherry = '<:cherry:417475705178161162>';
const cowoncy = '<:cowoncy:417475705912426496>';
const o = '<:o_:417475705899843604>';
const w = '<:w_:417475705920684053>';
const moving = '<a:slot_gif:417473893368987649>';

exports.alter = function (id, text) {
	switch (id) {
		case '220934553861226498':
			return geist(text);
		default:
			return text;
	}
};

function geist(text) {
	let fw = '<:fw:615450761911861261>';
	let fo = '<:fo:615450761890889738>';
	let fheart = '<:fheart:615450761962323978>';
	let feggplant = '<:feggplant:615450761857466368>';
	let fcowoncy = '<:fcowoncy:615450761899409418>';
	let fcherry = '<:fcherry:615450761748283394>';
	let fmoving = '<a:dslot:614229928388591635>';
	text = text
		.replace(new RegExp(eggplant, 'g'), feggplant)
		.replace(new RegExp(heart, 'g'), fheart)
		.replace(new RegExp(cherry, 'g'), fcherry)
		.replace(new RegExp(cowoncy, 'g'), fcowoncy)
		.replace(new RegExp(o, 'g'), fo)
		.replace(new RegExp(w, 'g'), fw)
		.replace(new RegExp(moving, 'g'), fmoving)
		.replace('**`___SLOTS___  `**', '**`⭐  SLOTS  ⭐`**')
		.replace('`|         |`', '`|           |`')
		.replace('`|         |`', '`|    OwO    |`')
		.replace('\n<', '\n      <');
	let line1 = text.match(/[^>]+bet <:cowoncy:416043450337853441> [0-9,]+/gi);
	if (line1) {
		text = text.replace(line1[0], '');
		text += '\n' + line1[0].trim();
	}
	let line2 = text.match(/ {2}and won <:cowoncy:416043450337853441> [0-9,]+/gi);
	if (line2) {
		text = text.replace(line2[0], '');
		text += '\n' + line2[0].trim();
	}
	let line3 = text.match('and won nothing... :c');
	if (line3) {
		text = text.replace(line3[0], '');
		text += '\n' + line3[0].trim();
	}

	return text;
}
