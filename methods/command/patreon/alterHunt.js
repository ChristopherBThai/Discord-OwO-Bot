exports.alter = function(id,text){
	if(id==0)
		return geist(text);
	else
		return text;
}

function geist(text){
	//text.replace("",""):
	var topText = "";
	var bottomText = "";
	return {
		"description":topText+"\n"+text+"\n"+bottomText,
		"color":000000
	};
}
