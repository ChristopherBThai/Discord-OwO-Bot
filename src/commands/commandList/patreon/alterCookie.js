/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const alterUtils = require('../../../utils/alterUtils.js');

const blank = '<:blank:427371936482328596>';
const _cookie = '<a:cookieeat:423020737364885525>';

exports.alter = async function (p, text, info = {}) {
	let result;
	if ((result = await check(p, p.msg.author.id, text, info))) {
		return result;
	} else if (info.to && (result = await check(p, info.to.id, text, { ...info, receive: true }))) {
		return result;
	}
	return text;
};

async function check(p, id, text, info) {
	const result = await checkDb(p, info);
	if (result) return result;
	switch (id) {
		case '250383887312748545':
			return elsa(text, info);
		case '216710431572492289':
			return arichy(text, info);
		case '412812867348463636':
			return erys(text, info);
	}
}

async function checkDb(p, info) {
	let user = info.from;
	let type, replacers;
	if (info.receive) {
		user = info.to;
		type = 'receive';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
		};
	} else if (info.ready) {
		type = 'ready';
		replacers = {
			username: p.getName(info.from),
			user_tag: p.getName(info.from),
			blank: p.config.emoji.blank,
			amount: info.count,
		};
	} else if (info.timer) {
		type = 'cooldown';
		replacers = {
			username: p.getName(info.from),
			user_tag: p.getName(info.from),
			blank: p.config.emoji.blank,
			amount: info.count,
			cooldown: info.timer,
		};
	} else {
		type = 'give';
		replacers = {
			sender: p.getName(info.from),
			sender_tag: p.getTag(info.from),
			receiver: p.getName(info.to),
			receiver_tag: p.getTag(info.to),
			blank: p.config.emoji.blank,
		};
	}

	return alterUtils.getAlterCommand('cookie', user, type, replacers);
}

function elsa(text, _info) {
	return text.replace(/ cookie/gi, ' lemon cookie');
}

function arichy(text, info) {
	const chef = '<a:chef:833952306083921940>';
	const cookies = '<a:cookies:833952634930855976>';
	if (info.timer) {
		return (
			`${chef} **| ${info.from.username}**! Get some hot milk or tea for your ${info.count} gluten free cookies!\n` +
			`${blank} **|** Good job with cookies delivery! Bakery will be opened again in **${info.timer}**! ❤️`
		);
	} else if (info.receive) {
		return `${cookies} **| ${info.to.username}**! You open shiny box with gluten free cookies sent by **${info.from.username}**. Smells delicious, tastes amazing! ⭐`;
	} else if (info.ready) {
		return (
			`${chef} **| ${info.from.username}**! Get some hot milk or tea for your ${info.count} gluten free cookies!\n` +
			`${blank} **|** Good morning, sunshine! Cookies are ready for delivery <:steal:833949446571294742>`
		);
	} else {
		return `${cookies} **| ${info.to.username}**! You open shiny box with gluten free cookies sent by **${info.from.username}**. Smells delicious, tastes amazing! ⭐`;
	}
}

function erys(text, info) {
	let img, color, desc;
	if (info.timer) {
		desc = `<:cat1:993750688448389170> **| ${info.from.username}**! hope you enjoy your **${info.count}** freshly baked cookies!\n<:cat2:993750689404698684> **|** Hope they fill you with love and joy! <a:cat3:993750690411319396>\n<:cat4:993750691476668506> **|** You may start baking your cookies in **${info.timer}**!`;
		img =
			'https://cdn.discordapp.com/attachments/970816432696881174/1002523522758873098/cookiedex.gif';
		color = 15127782;
	} else if (info.receive) {
		desc =
			`<a:receive1:993752858342199376> **${info.to.username} | ${info.from.username}** made you freshly baked cookies, delivered by the magic cat <:receive2:993752859298517043>` +
			'\n<a:receive3:993752859973787693> **|** Hope you enjoy them! nom';
		img = 'https://cdn.discordapp.com/attachments/936398283750907965/984144172229459988/cookie.gif';
		color = 16436896;
	} else if (info.ready) {
		desc = `<:cat1:993750688448389170> **| ${info.from.username}**! hope you enjoy your **${info.count}** freshly baked cookies!\n<:cat2:993750689404698684> **|** Hope they fill you with love and joy! <a:cat3:993750690411319396>`;
		img =
			'https://cdn.discordapp.com/attachments/970816432696881174/1002523522758873098/cookiedex.gif';
		color = 15127782;
	} else {
		desc =
			`<a:give1:993752854877716521> **${info.to.username}**, **${info.from.username}** sent you a cookie from his catto's bakery! <:give2:993752856005980160>` +
			"\n<a:give3:993752857348157460> **|** It was made with love, hope it's tasty! nom";
		img = 'https://cdn.discordapp.com/attachments/936398283750907965/984144172229459988/cookie.gif';

		color = 16436896;
	}
	return {
		embed: {
			description: desc,
			color: color,
			image: { url: img },
		},
	};
}
