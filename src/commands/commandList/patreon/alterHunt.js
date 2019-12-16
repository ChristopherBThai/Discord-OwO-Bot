/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
const huntEmoji = "🌱";
exports.alter = function(id,text){
	switch(id){
		case '220934553861226498':
			return geist(text);
		case '369533933471268875':
			return light(text);
		case '242718397836558337':
			return shippig(text);
		case '255750356519223297':
			return spotifybot(text);
		case '358448141424394251':
			return oliverLaVey(text);
		case '371344384366739457':
			return nou(text);
		case '176046069954641921':
			return crown(text);
		case '289411794672418819':
			return louis(text);
		case '348828692539113490':
			return michelle(text);
		case '250383887312748545':
			return elsa(text);
		case '181264821713371136':
			return pheonix(text);
		case '192692796841263104':
			return dalu(text);
		case '336611676604596227':
			return blacky(text);
		default:
			return text;
	}
}

function geist(text){
	text = text.replace("🌱","🍀");
	text = text.replace("spent 5 <:cowoncy:416043450337853441> and caught a **","has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible ")
		.replace("spent 5 <:cowoncy:416043450337853441> and caught an **","has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible ");
	var topText =    "";
	var bottomText = "";
	var embed = {
		"description":topText+"\n"+text+"\n"+bottomText,
		"color":6315775,
		"thumbnail":{
			"url":"https://i.imgur.com/PcQVN4l.gif"
		}
	};
	return {embed};
}

function light(text){
	text = text.replace("You found:","Lighti cuddled and befriended many animals and found:\n<:blank:427371936482328596> **|**");
	var embed = {
		"description":text,
		"color":4286945,
		"thumbnail":{
			"url":"https://cdn.discordapp.com/attachments/531265349375492146/531874556697247746/image0.gif"
		}
	};
	return {embed};
}

function shippig(text){
	text = text.replace(huntEmoji,"<:pandabag:566537378303311872>")
		.replace("hunt is empowered","Roo is empowered")
		.replace("You found: ","I broke into a zoo and kidnapped:\n**<:blank:427371936482328596> |** ")
		.replace("spent 5 <:cowoncy:416043450337853441> and caught an ","I broke into a zoo and kidnapped an\n**<:blank:427371936482328596> |** ")
		.replace("spent 5 <:cowoncy:416043450337853441> and caught a ","I broke into a zoo and kidnapped a\n**<:blank:427371936482328596> |** ");
	let embed = {
		"description":text,
		"color":6315775,
		"thumbnail":{
			"url":"https://cdn.discordapp.com/attachments/514187412797390848/564804190837145624/PandaBag.png"
		}
	};
	return {embed};
}

function spotifybot(text){
	let spotify = '<a:spotify:577027003656437766>';
	let swipeup = '<a:swipeup:577026648646483969>';
	let nowplaying = '<a:nowplaying:577026647434330132>';
	let img = 'https://cdn.discordapp.com/attachments/547465561919979551/628087450815823912/image0.gif';
	if(text.indexOf("empowered by")>=0){
		text = spotify+" Hey **Spotify** *Make a New Playlist!*\n"+
			text.replace(", hunt is empowered by","'s Playlist is Sponsored by")
			.replace(huntEmoji,"<:blank:427371936482328596>")
			.replace("**<:blank:427371936482328596> |** You found",nowplaying+" **|** You added")
			.replace("xp**!","xp**! *Shuffle Play* "+swipeup)
	}else{
		text = spotify+" Hey **Spotify** *Make a New Playlist!*\n"+
			text.replace(huntEmoji, nowplaying)
			.replace("caught","added")
			.replace("xp**!","xp**! *Shuffle Play* "+swipeup)
	}
	let embed = {
		description:text,
		color:1947988,
		thumbnail:{
			url:img
		}
	}
	return {embed};
}

function oliverLaVey(text){
	let dna = '<:dna:587991032562581535>';
	let tube = '<:testtube:587991032788942868>';
	let needle = '💉';
	if(text.indexOf("empowered by")>=0){
		text = tube + " *New specimens inbound!*\n"+
			text.replace(", hunt is empowered by","'s research is empowered by")
			.replace(huntEmoji,dna)
			.replace("You found","You sampled")
			.replace("xp**!","xp**! *Downloading CRISPR-Cas9* "+needle);
	}else{
		text = tube + " *New specimens inbound!*\n"+
			text.replace("caught a","sampled a")
			.replace(huntEmoji,dna)
			.replace("xp**!","xp**! *Downloading CRISPR-Cas9* "+needle);
	}
	return text;

}

function nou(text){
	let rainbow = '<a:rainbowcat:587998090045423637>';
	let scree = '<a:SCREE:587998074807255056>';
	let whitecomet = '<a:whitecomet:587998076032254002>';
	let ark = '<:ark:587998073368608772>';
	let ark2 = '<:ark2:587998074304200744>';
	let earth = '🌎';
	if(text.indexOf("empowered by")>=0){
		text = whitecomet+" **|** The Ark of Destruction has arrived\n"+
			ark+" **|** Activating Gravity Core\n"+
			ark+" **|** Charging Core!\n"+
			ark+" **|** Core active! "+scree+"\n"+
			ark+" **|** Capturing Target Planet "+earth+"\n"+
			text.replace(huntEmoji,whitecomet)
			.replace(/[a-z\* ]+, hunt is empowered by/gi,"** Ark of Destruction is currently energized with")
			.replace("` !","` ! "+scree)
			.replace("**<:blank:427371936482328596> |** You found:",ark2+" **|** Planet Captured, No U found ")
			.replace("\n<:blank"," In the Planet! "+rainbow+"\n<:blank");
	}else{
		text = whitecomet+" **|** The Ark of Destruction has arrived\n"+
			ark+" **|** Activating Gravity Core\n"+
			ark+" **|** Charging Core!\n"+
			ark+" **|** Core active! "+scree+"\n"+
			ark+" **|** Capturing Target Planet "+earth+"\n"+
			text.replace(huntEmoji,ark2)
			.replace("| ","|** Planet Captured, **")
			.replace("spent 5 <:cowoncy:416043450337853441> and caught","found")
			.replace("!\n<:blank"," In the Planet! "+rainbow+"\n<:blank");
	}
	return text;
}


function crown(text){
	let crown = '<a:crown:599030694953353216>';
	if(text.indexOf("empowered by")>=0){
		text = text.replace(", hunt is empowered by","'s Elite Force marches into the forest with")
			.replace(huntEmoji,crown)
			.replace("You found","and after 1 week they found")
			.replace("  !","");
	}else{
		text = text.replace(huntEmoji,crown)
			.replace("spent 5 <:cowoncy:416043450337853441> and caught a","'s Elite Force marches into the forest\n**<:blank:427371936482328596> |** and after 1 week they found a")
	}
	let embed = {
		"description":text,
		"color":3421756,//4286945,
		"thumbnail":{
			"url":"https://i.imgur.com/nQwrbvd.gif"
		}
	};
	return {embed};
}

function louis(text){
	let roorun = '<a:roorun:605562843416363018>';
	let roosleep = '<:roosleep:605562842107740203>';
	if(text.indexOf("empowered by")>=0){
		text = roorun+" **|** *panda is super excited!*\n"+
			text.replace(huntEmoji,blank)
			.replace(/[a-zA-z0-9!?\s.]+\*\*,\shunt/gi,"roo**")
			.replace("You found","roo made friends with")
			.replace("xp**!","xp**!\n"+roosleep+" **|** *panda is tired now*")
	}else{
		text = roorun+" **|** *panda is super excited!*\n"+
			text.replace(huntEmoji,blank)
			.replace(/[a-zA-z0-9!?]+\*\*\sspent/gi,"roo** spent")
			.replace("and caught a","and made friends with a")
			.replace("xp**!","xp**!\n"+roosleep+" **|** *panda is tired now*")
	}
	return text;
}

function michelle(text){
	let meowth = '<a:meowth:605676882788089867>';
	let persian = '<a:persian:605676882599477249>';
	if(text.indexOf("empowered by")>=0){
		text = text.replace(huntEmoji,meowth)
			.replace(/[\s\[\]a-zA-z0-9!?]+\*\*,\shunt/gi," Meowth**")
			.replace("You found","It returned with")
			.replace("\n<:blank","\n"+blank+" **|** and evolved into a Persian "+persian+"\n<:blank");
	}else{
		text = text.replace(huntEmoji,meowth)
			.replace(/[\s\[\]a-zA-z0-9!?]+\*\*\sspent/gi," Meowth** went out andspent")
			.replace("spent 5 <:cowoncy:416043450337853441> and","")
			.replace("!\n<:blank","!\n"+blank+" **|** It returned and evolved into a Persian "+persian+"\n<:blank")
	}
	return text;
}

function elsa(text){
	if(text.indexOf("empowered by")>=0){
		text = text.replace(", hunt is empowered by","'s Knights gather recruits! Using");
	}else{
		text = text.replace(" spent 5 <:cowoncy:416043450337853441> and caught","'s Knights found");
	}
	let embed = {
		"description":text,
		"color":7319500,
		"thumbnail":{
			"url":"https://i.imgur.com/kDnD8WQ.gif"
		}
	};
	return {embed};
}

function pheonix(text){
	if(text.indexOf("empowered by")>=0){
		text = text.replace(", hunt is empowered by"," has searched far and wide all over the galaxy with")
			.replace("You found","and found")
			.replace("  !","");
	}else{
		text = text.replace("spent 5 <:cowoncy:416043450337853441> and caught a **","has searched far and wide all over the galaxy\n**<:blank:427371936482328596> |** and found an **amazing")
		.replace("spent 5 <:cowoncy:416043450337853441> and caught an **","has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible ");
	}
	return text;
}

function dalu(text){
	let foxhappy = "<:foxhappy:641916900544217088>";
	let foxlove = "<:foxlove:641916900212867073>";
	if(text.indexOf("empowered by")>=0){
		text = text.replace(", hunt is empowered by"," is searching for food and uses ")
			.replace("  !"," to help him.")
			.replace("You found","He found  his pray not far away");
	}else{
	}
	let embed = {
		"description":text,
		"color":63996,
		"thumbnail":{
			"url":"https://i.imgur.com/sa5IZRo.gif"
		}
	};
	return {embed};
}

function blacky(text){
	text = text.replace(huntEmoji,"<a:running:653370372997120010>");
	if(text.indexOf("empowered by")>=0){
		text = text.replace(", hunt is empowered by","'s umbreon is empowered by\n"+blank+" **|**")
			.replace("You found","and found");
	}else{
		text = text.replace(" spent 5 <:cowoncy:416043450337853441> and caught a **",", your umbreon went out for a walk\n"+blank+" **|** and came back with an **amazing ")
			.replace(" spent 5 <:cowoncy:416043450337853441> and caught an **",", your umbreon went out for a walk\n"+blank+" **|** and came back with an **amazing ");
	}
	let embed = {
		"description":text,
		"color":1,
		"thumbnail":{
			"url":"https://cdn.discordapp.com/emojis/648999664963551284.gif"
		}
	};
	return {embed};
}
