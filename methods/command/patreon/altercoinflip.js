exports.alter = function(id,text){
	if(id==220934553861226498)
		return geist(text);
	else
		return text;
}

function geist(text){
	text = text.replace("<:tail:436677926398853120>","<:dtail:521229587221315586>");
	text = text.replace("<:head:436677933977960478>","<:dhead:521229587611385876>");
	text = text.replace("<a:coinflip:436677458339823636>","<a:dcoin:521229588613955584>");
	return text;
}
