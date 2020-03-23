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
		case '283000589976338432':
			return kuma(text,type);
		case '536711790558576651':
			return garcom(text);
		case '229299825072537601':
			return alradio(text,type);
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

function kuma(text,type) {
	text.thumbnail = {
		"url":"https://cdn.discordapp.com/emojis/674153774088060957.png"
	};
	text.author.name = text.author.name.replace(" goes into battle!","'s minions defend the Cookie King");
	return text;

}

function garcom(text,type) {
	text.author.name = "전투를 시작합니다!";
	text.thumbnail = {
		url:"https://cdn.discordapp.com/attachments/674765942445703198/676257154893873172/C8fHZTfVYAIaFOc.png"
	}
	return text;
}

function alradio(text,type) {
	text.author.name = "Speech: ...then he'd broadcast his carnage all throughout Hell, just so everyone could witness his ability. Sinners started calling him, \"The Radio Demon.\"";
	text.thumbnail = {
		url: "https://cdn.discordapp.com/attachments/626155987904102402/686473789080600586/image0.gif"
	}
	switch (text.color) {
		case 16711680:
			text.color = 1;
			break;
		case 65280:
			text.color = 16777214;
			break;
	}
	return text;
}
