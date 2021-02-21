/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

exports.alter = function(id, text, opt){
	switch (id) {
		case '408371860246364183':
			return lanre(text, opt);
		default:
			return text
	}
}

function lanre (text, opt){
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
