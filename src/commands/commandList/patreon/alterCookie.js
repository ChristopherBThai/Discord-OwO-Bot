/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
const cookie = '<a:cookieeat:423020737364885525>';

exports.alter = function(id,text,info={}){
	let result;
	if (result = check(id, text, info)) {
		return result;
	} else if (info.to && (result = check(info.to.id, text, { ...info, receive: true }))) {
		return result;
	}
	return text;
}

function check(id, text, info) {
	switch (id) {
		case '250383887312748545':
			return elsa(text,info);
		case '216710431572492289':
			return arichy(text,info);
	}
}

function elsa (text, info) {
	return text.replace(/ cookie/gi," lemon cookie");
}

function arichy (text, info) {
	const chef = "<a:chef:833952306083921940>";
	const cookies = "<a:cookies:833952634930855976>";
	if (info.timer) {
		return `${chef} **| ${info.from.username}**! Get some hot milk or tea for your ${info.count} gluten free cookies!\n`
			+ `${blank} **|** Good job with cookies delivery! Bakery will be opened again in **${info.timer}**! ❤️`
	} else if (info.receive) {
		return `${cookies} **| ${info.to.username}**! You open shiny box with gluten free cookies sent by **${info.from.username}**. Smells delicious, tastes amazing! ⭐`
	} else if (info.ready) {
		return `${chef} **| ${info.from.username}**! Get some hot milk or tea for your ${info.count} gluten free cookies!\n`
			+ `${blank} **|** Good morning, sunshine! Cookies are ready for delivery <:steal:833949446571294742>`;
	} else {
		return `${cookies} **| ${info.to.username}**! You open shiny box with gluten free cookies sent by **${info.from.username}**. Smells delicious, tastes amazing! ⭐`
	}
	return text;
}
