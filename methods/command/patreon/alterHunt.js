const huntEmoji = "🌱";
exports.alter = function(id,text){
	switch(id){
		case '220934553861226498':
			return geist(text);
		case '369533933471268875':
			return light(text);
		case '184587051943985152'://'242718397836558337':
			return shippig(text);
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
	var embed = {
		"description":text,
		"color":6315775,
		"thumbnail":{
			"url":"https://cdn.discordapp.com/attachments/514187412797390848/564804190837145624/PandaBag.png"
		}
	};
	return {embed};
}
