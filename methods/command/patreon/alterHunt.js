exports.alter = function(id,text){
	switch(id){
		case '220934553861226498':
			return geist(text);
		case '369533933471268875':
			return light(text);
		default:
			return text;
	}
}

function geist(text){
	text = text.replace("🌱","🍀");
	text = text.replace("spent 5 <:cowoncy:416043450337853441> and caught a(n) **","has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible ");
	//text = "<:blank:427371936482328596>"+text.replace(/\n/gi,"\n<:blank:427371936482328596>");
	var topText =    "";//"<a:remdance:498702842962378752>\t\t\t\t<a:ramdance:498702842207404032>";
	var bottomText = "";//"<a:ramdance:498702842207404032>\t\t\t\t<a:remdance:498702842962378752>";
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
