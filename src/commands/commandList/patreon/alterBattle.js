/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
exports.alter = function(id,text,type){
	switch(id){
		case '176046069954641921':
			return crown(text,type);
		case '250383887312748545':
			return elsa(text,type);
		case '323347251705544704':
			return rikudou(text,type);
		case '192692796841263104':
			return dalu(text,type);
		default:
			return text;
	}
}


function crown(text,type){
	text.thumbnail = {
		"url":"http://cdn.discordapp.com/attachments/598115387158036500/615856437708455936/image0.gif"
	}
	text.author.name = "Someone accidently stepped on "+text.author.name.replace(" goes into battle","'s garden");
	text.color = 16776960;
	return text;
}

function elsa(text,type){
	text.thumbnail = {
		"url":"https://i.imgur.com/HovVT8A.gif"
	}
	text.color = 7319500;
	text.author.name = text.author.name.replace(" goes into battle!","'s Knights fight for their Queen's Glory!");
	return text;
}

function rikudou(text,type){
	text.thumbnail = {
		"url":"https://cdn.discordapp.com/attachments/598318102307930114/620814063764766725/image0.gif"
	}
	text.color = 255;
	text.author.name = "Rikudou Sennin Arrives on the Battlefield";
	return text;
}

function dalu(text,type){
	text.thumbnail = {
		"url":"https://i.imgur.com/iks7lY3.gif"
	};
	text.color = 63996;
	text.author.name = text.author.name.replace(" goes into battle!"," starts it off with a bite!");
	return text;
}
