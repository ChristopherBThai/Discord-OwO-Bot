exports.alter = function(id,text){
	if(id==220934553861226498)
		return geist(text);
	else
		return text;
}

function geist(text){
	text = text.replace("🌱","🍀");
	text = "<:blank:427371936482328596>"+text.replace(/\n/gi,"\n<:blank:427371936482328596>");
	var topText =    "<a:remdance:498702842962378752>──────────────────────────────────<a:ramdance:498702842207404032>";
	var bottomText = "<a:ramdance:498702842207404032>──────────────────────────────────<a:remdance:498702842962378752>";
	var embed = {
		"description":topText+"\n"+text+"\n"+bottomText,
		"color":6315775
	};
	return {embed};
}
