/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';

exports.alter = function(id,text,info={}){
	let result;
	if (result = check(id, text, info)) {
		return result;
	} else if (info.to && (result = check(info.to.id, text, info))) {
		return result;
	}
	return text;
}

function check(id, text, info) {
	switch (id) {
		case '250383887312748545':
			return elsa(text,info);
	}
}

function elsa (text, info) {
	return text.replace(/ cookie/gi," lemon cookie");
}
