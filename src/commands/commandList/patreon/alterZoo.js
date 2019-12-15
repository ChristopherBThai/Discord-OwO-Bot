/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
const ranks = {c:"<:common:416520037713838081>",
		u:"<:uncommon:416520056269176842>",
		r:"<:rare:416520066629107712>",
		e:"<:epic:416520722987614208>",
		m:"<:mythic:416520808501084162>",
		p:"<:patreon:449705754522419222>",
		cp:"<a:cpatreon:483053960337293321>",
		l:"<a:legendary:417955061801680909>",
		g:"<a:gem:510023576489951232>",
		f:"<a:fabled:438857004493307907>",
		s:"<:special:427935192137859073>",
		h:"<a:hidden:459203677438083074>"}
exports.alter = function(id,text){
	switch(id){
		case '250383887312748545':
			return elsa(text);
		default:
			return text;
	}
}

function replaceRanks(text,newRanks){
	for(let rank in newRanks){
		text = text.replace(ranks[rank],newRanks[rank]);
	}
	return text;
}

//             
function elsa(text){
	let newRanks = {
		c:"<:lilotitlecommon:653376193994686504>",
		u:"<:mutitleuncommon:653376194686877726>",
		r:"<:bravetitlerare:653376194594734087>",
		e:"<:disneytitleepic:653376193864794113>",
		m:"<:muppetstitlemythic:653376194460516362>",
		p:"<:treasureplanettitlepat:653376194468773888>",
		cp:"<:pixarcpat:653376193747222572>",
		l:"<:lionkingtitlelegendary:655692394762731530>",
		g:"<:pandfroggem:653376194170978306>",
		f:"<:frozentitlefabled:653376194602991645>",
		s:"<:atlantistitlespecial:653376193806204943>",
		h:"<:hocuspocustitlehidden:653376194305064960>"
	}
	text = replaceRanks(text,newRanks)
		.replace("Zoo Points","<:frozentitlefabled:653376194602991645>ilm Collection Points")
		.split("\n");
	text[0] = "<:elsasnowflake1:653376194414379029><:elsasnowflake2:653384773234065438> <:frozenN:653376194854518794>**erdy**<:frozenE:653376194594734117>**lsa's zoo!** <:elsasnowflake2:653384773234065438><:elsasnowflake1:653376194414379029>";

	return text.join("\n");
}
