/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

exports.alter = function(id, text, opt){
	switch (id) {
		case '408371860246364183':
			return lanre(text, opt);
		case '565212326291308545':
			return eliza(text, opt);
		case '413344554247258112':
			return ameodssbxiw(text, opt);
		case '427296171883626496':
			return lIlIIIll(text, opt);
		default:
			return text
	}
}

function lanre (text, opt) {
	text.description = opt.desc;
	text.author.name = "Senko's Stronghold";
	text.image = {
		url: "https://cdn.discordapp.com/attachments/757362062421655603/788818074706247690/image0.gif"
	}
	if (opt.page % 2) {
		text.color = 16751401;
	} else {
		text.color = 12876847;
	}
	
	return text;
}

function eliza (text, opt) {
	text.description = opt.desc;
	text.author.name = "Guarded by Danny and Roshi";
	text.image = {
		url: "https://cdn.discordapp.com/attachments/833776274139775056/844240371731136533/IMG_20201019_175851_027.jpg"
	}
	text.footer.text += ' | Where a few successes brought us';
	text.color = 65280;
	
	return text;
}

function ameodssbxiw (text, opt) {
	text.description = opt.desc;
	text.author.name = "Stronghold held by ameodssbxiw, Eliza and Nala";
	text.image = {
		url: "https://cdn.discordapp.com/attachments/833776274139775056/843574384873570394/IMG_20201013_182144.jpg"
	}
	text.footer.text += ' | Where a few successes brought us';
	text.color = 2003199;
	
	return text;
}

function lIlIIIll (text, opt) {
	text.description = opt.desc;
	text.image = {
		url: "https://cdn.discordapp.com/attachments/787404412335161354/927784700997677116/output-onlinegiftools_61.gif"
	}
	return text;
}
