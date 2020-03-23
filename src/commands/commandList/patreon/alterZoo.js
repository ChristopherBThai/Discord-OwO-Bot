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
		case '192692796841263104':
			return dalu(text);
		case '176046069954641921':
			return crown(text);
		case '658299153042112512':
			return heysay(text);
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

function dalu(text){
	text = text.replace("Zoo Points","Fox Friends")
		.split("\n");
	text[0] = "**Dalu's Kitsune Home**";
	text.pop();
	return text.join("\n");
}

function crown(text){
	let newRanks = {
		c:"<a:c1:663634208014598144> <a:c2:663634213597347877>",
		u:"<a:u1:663634210392768532> <a:u2:663634214234751013>",
		r:"<:r1:663634208715046923> <a:r2:663634214356516864>",
		e:"<a:e1:663634214813433856> <a:e2:663634213483839498>",
		m:"<a:m1:663634214268305408> <a:m2:663634215270744075>",
		p:"<a:p1:663634213953732609> <a:p2:663634214046007296>",
		cp:"<a:cp1:663634207746162718> <a:cp2:663634213190369299>",
		l:"<a:l1:663634215061028864> <a:l2:663634213135974420>",
		g:"<a:g1:663634211814506498> <a:g2:663634214079561760>",
		e:"<a:e1:663634214813433856> <a:e2:663634213483839498>",
		f:"<a:f1:663634213194694674> <a:f2:663634213391564800>",
		s:"<:blank:427371936482328596> <a:s1:663634214322700298>",
		h:"<a:h1:663634208035569666> <a:h2:663634208828162049>"
	}
	text = replaceRanks(text,newRanks)
		.split("\n");
	text[0] = "<a:peek1:663634457294798859> <a:peek2:663634216021655559> <a:peek3:663634215069417477> <a:crown:663613803786797056> <:c:663634207175868425> <:r:663634208731824138> <:o:663634208400474113> <:w:663634208530366464> <:n_:663634208115392518> <a:crown:663613803786797056> 's zoo! <a:peek4:663634215086325771> <a:peek2:663634216021655559> <a:peek1:663634457294798859>";

	return text.join("\n");
}

function heysay(text){
	let newRanks = {
		c: "<:1:688486319793504293>",
		u: "<:2:688486338152235240>",
		r: "<:3:688486357995094176>",
		e: "<:4:688486373518606346>",
		m: "<:5:688486388743929927>",
		p: "<:6:688486404954783774>",
		cp: "<:7:688486423384293383>",
		l: "<:8:688486438895222820>",
		g: "<:9_:688486456288739402>",
		f: "<:10:688486468263346206>",
		s: "<:11:688486516170817604>",
		h: "<:12:688486536081178731>"
	}
	text = replaceRanks(text,newRanks)
		.split("\n");

	text[0] = "<:KyoTohru:688486616833982579>𝔾𝕣𝕒𝕔𝕖’𝕤 𝔽𝕣𝕦𝕚𝕥𝕤 𝔹𝕒𝕤𝕜𝕖𝕥<:KyoTohruFlipped:688486645494054930>"

	return text.join("\n");
}
