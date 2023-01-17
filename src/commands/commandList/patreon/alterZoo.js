/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const ranks = {
	c: '<:common:416520037713838081>',
	u: '<:uncommon:416520056269176842>',
	r: '<:rare:416520066629107712>',
	e: '<:epic:416520722987614208>',
	m: '<:mythic:416520808501084162>',
	p: '<:patreon:449705754522419222>',
	cp: '<a:cpatreon:483053960337293321>',
	l: '<a:legendary:417955061801680909>',
	g: '<a:gem:510023576489951232>',
	f: '<a:fabled:438857004493307907>',
	s: '<:special:427935192137859073>',
	h: '<a:hidden:459203677438083074>',
	b: '<a:botrank:716545289497870407>',
};

exports.alter = function (id, text, opt) {
	switch (id) {
		case '250383887312748545':
			return elsa(text);
		case '192692796841263104':
			return dalu(text);
		case '176046069954641921':
			return crown(text);
		case '658299153042112512':
			return heysay(text);
		case '575555630312456193':
			return xmelanie(text);
		case '343094664414363658':
			return tiggy(text);
		case '714215538821431398':
			return ivy(text);
		case '427296171883626496':
			return lIlIIIll(text, opt);
		case '460987842961866762':
			return estee(text, opt);
		default:
			return text;
	}
};

function replaceRanks(text, newRanks) {
	for (let rank in newRanks) {
		text = text.replace(ranks[rank], newRanks[rank]);
	}
	return text;
}

//
function elsa(text) {
	let newRanks = {
		c: '<:lilotitlecommon:653376193994686504>',
		u: '<:mutitleuncommon:653376194686877726>',
		r: '<:bravetitlerare:653376194594734087>',
		e: '<:disneytitleepic:653376193864794113>',
		m: '<:muppetstitlemythic:653376194460516362>',
		p: '<:treasureplanettitlepat:653376194468773888>',
		cp: '<:pixarcpat:653376193747222572>',
		l: '<:lionkingtitlelegendary:655692394762731530>',
		g: '<:pandfroggem:653376194170978306>',
		f: '<:frozentitlefabled:653376194602991645>',
		s: '<:atlantistitlespecial:653376193806204943>',
		h: '<:hocuspocustitlehidden:653376194305064960>',
	};
	text = replaceRanks(text, newRanks)
		.replace('Zoo Points', '<:frozentitlefabled:653376194602991645>ilm Collection Points')
		.split('\n');
	text[0] =
		"<:elsasnowflake1:653376194414379029><:elsasnowflake2:653384773234065438> <:frozenN:653376194854518794>**erdy**<:frozenE:653376194594734117>**lsa's zoo!** <:elsasnowflake2:653384773234065438><:elsasnowflake1:653376194414379029>";

	return text.join('\n');
}

function dalu(text) {
	text = text.replace('Zoo Points', 'Fox Friends').split('\n');
	text[0] = "**Dalu's Kitsune Home**";
	text.pop();
	return text.join('\n');
}

function crown(text) {
	let newRanks = {
		c: '<a:c1:663634208014598144> <a:c2:663634213597347877>',
		u: '<a:u1:663634210392768532> <a:u2:663634214234751013>',
		r: '<:r1:663634208715046923> <a:r2:663634214356516864>',
		e: '<a:e1:663634214813433856> <a:e2:663634213483839498>',
		m: '<a:m1:663634214268305408> <a:m2:663634215270744075>',
		p: '<a:p1:663634213953732609> <a:p2:663634214046007296>',
		cp: '<a:cp1:663634207746162718> <a:cp2:663634213190369299>',
		l: '<a:l1:663634215061028864> <a:l2:663634213135974420>',
		g: '<a:g1:663634211814506498> <a:g2:663634214079561760>',
		f: '<a:f1:663634213194694674> <a:f2:663634213391564800>',
		s: '<:blank:427371936482328596> <a:s1:663634214322700298>',
		h: '<a:h1:663634208035569666> <a:h2:663634208828162049>',
	};
	text = replaceRanks(text, newRanks).split('\n');
	text[0] =
		"<a:peek1:663634457294798859> <a:peek2:663634216021655559> <a:peek3:663634215069417477> <a:crown:663613803786797056> <:c:663634207175868425> <:r:663634208731824138> <:o:663634208400474113> <:w:663634208530366464> <:n_:663634208115392518> <a:crown:663613803786797056> 's zoo! <a:peek4:663634215086325771> <a:peek2:663634216021655559> <a:peek1:663634457294798859>";

	return text.join('\n');
}

function heysay(text) {
	let newRanks = {
		c: '<:1:688486319793504293>',
		u: '<:2:688486338152235240>',
		r: '<:3:688486357995094176>',
		e: '<:4:688486373518606346>',
		m: '<:5:688486388743929927>',
		p: '<:6:688486404954783774>',
		cp: '<:7:688486423384293383>',
		l: '<:8:688486438895222820>',
		g: '<:9_:688486456288739402>',
		f: '<:10:688486468263346206>',
		s: '<:11:688486516170817604>',
		h: '<:12:792917067547541514>',
	};
	text = replaceRanks(text, newRanks).split('\n');

	text[0] =
		'<:KyoTohru:688486616833982579>𝔾𝕣𝕒𝕔𝕖’𝕤 𝔽𝕣𝕦𝕚𝕥𝕤 𝔹𝕒𝕤𝕜𝕖𝕥<:KyoTohruFlipped:688486645494054930>';

	return text.join('\n');
}

function xmelanie(text) {
	let newRanks = {
		c: '<a:xmelanie_c:755346243798040587>',
		u: '<a:xmelanie_u:755346244036984833>',
		r: '<a:xmelanie_r:755346244280385536>',
		e: '<a:xmelanie_e:755346244217602078>',
		m: '<a:xmelanie_m:755346244255088670>',
		cp: '<a:xmelanie_p:755346244255088710>',
		p: '<a:xmelanie_p:755346244255088710>',
		l: '<a:xmelanie_l:758969896385904690>',
		g: '<a:xmelanie_g:755346244246962186>',
		f: '<a:xmelanie_f:755346244183916554>',
		s: '<a:xmelanie_s:755346243949166603>',
		b: '<a:xmelanie_b:755346243957424128>',
	};
	text = replaceRanks(text, newRanks).split('\n');
	text[0] =
		'<:mickey:747723512768102453><a:stitch:747723512982274060><a:olaf:747723512755650591>**Mels Animal Kingdom**<a:dory:747723513242058786><a:baby_yoda:747723513367887914><a:castle:747723513758220339>';
	return text.join('\n');
}

function tiggy(text) {
	let newRanks = {
		c: '<a:C:747731098917929031>',
		u: '<a:U:747731099165130812>',
		r: '<a:R:747731098880049204>',
		e: '<a:E:747731098645299212>',
		m: '<a:M:747732700173041694>',
		cp: '<a:P:747731099039301652>',
		p: '<:TigsSpecialP:747731304870707222>',
		l: '<a:L:747732700127035453>',
		g: '<a:G:747728798430003230>',
		f: '<a:F:747731099039301702>',
		s: '<a:S:747728798488723516>',
		h: '<a:H:747731098871660607>',
		b: '<a:B_:747731099030913064>',
	};
	text = replaceRanks(text, newRanks).split('\n');
	text[0] =
		'<:tigbush:747728843325833267> <:TigTree:747728843246272523> <:tigflowerbush:747728843011522611> <a:T:747728798367219773><a:I:747728798463688814><a:G:747728798430003230><a:G:747728798430003230><a:Y:747728798233002021><a:Apostrophy:747728798061166606><a:S:747728798488723516>  <a:Z:747728798295785565><a:O:747728798241521716><a:O_:747728798241521716> <:tigflowerbush:747728843011522611> <:TigTree:747728843246272523> <:tigbush:747728843325833267>';

	return text.join('\n');
}

function ivy(text) {
	let newRanks = {
		c: '<a:arrow:856794924955205652><a:flower1:856794924670517248>',
		u: '<a:arrow:856794924955205652><a:butterfly1:856794924585975838>',
		r: '<a:arrow:856794924955205652><a:flower2:856794924485836851>',
		e: '<a:arrow:856794924955205652><a:butterfly2:856794925248413706>',
		m: '<a:arrow:856794924955205652><a:flower3:856794924715474975>',
		p: '<a:arrow:856794924955205652><a:butterfly3:856794925206601778>',
		cp: '<a:arrow:856794924955205652><a:flower4:856794924874596372>',
		l: '<a:arrow:856794924955205652><a:butterfly4:856794924895830037>',
		g: '<a:arrow:856794924955205652><a:flower5:856794924812599296>',
		f: '<a:arrow:856794924955205652><a:butterfly5:856794924980371486>',
		s: '<a:arrow:856794924955205652><a:flower6:856794924812075008>',
		h: '<a:arrow:856794924955205652><a:butterfly1:856794924585975838>',
		b: '<a:arrow:856794924955205652><a:flower1:856794924670517248>',
	};

	text = replaceRanks(text, newRanks).split('\n');
	text[0] =
		'<a:butterfly1:856794924585975838> <a:heart1:856794924858998784> <a:wingleft:856794924430393385> <:_i:856794924413354004> <:_v:856794924396445716> <:_y:856794924028788758> <a:wingright:856794924777996288> <a:heart1:856794924858998784> <a:butterfly1:856794924585975838>';

	return text.join('\n');
}

function lIlIIIll(text, opt) {
	let newRanks = {
		c: '<:death:975319820461563914>',
		u: '<:death:975319820461563914>',
		r: '<:death:975319820461563914>',
		e: '<:death:975319820461563914>',
		m: '<:death:975319820461563914>',
		p: '<:death:975319820461563914>',
		cp: '<:death:975319820461563914>',
		l: '<:death:975319820461563914>',
		g: '<:death:975319820461563914>',
		f: '<:death:975319820461563914>',
		s: '<:death:975319820461563914>',
		h: '<:death:975319820461563914>',
		b: '<:death:975319820461563914>',
	};

	text = replaceRanks(text, newRanks).split('\n');
	text[0] = `-漫~'¨¯¨'·舞~ ${opt.user.username} ~舞'¨¯¨'·~漫-`;

	return text.join('\n');
}

function estee(text, _opt) {
	let newRanks = {
		c: '<a:c_:993718849914548225>',
		u: '<a:u_:993718860471603280>',
		r: '<a:r_:993718858303164476>',
		e: '<a:e_:993718851349004338>',
		m: '<a:m_:993718856252141638>',
		p: '<a:p_:993718857250381875>',
		cp: '<a:p_:993718857250381875>',
		l: '<a:l_:993718855312605265>',
		g: '<a:g_:993718853353877534>',
		f: '<a:f_:993718852418535494>',
		s: '<a:s_:993718859502735360>',
		h: '<a:h_:993718854356324374>',
		b: '<a:b_:993718849058918521>',
	};

	text = replaceRanks(text, newRanks).split('\n');
	text[0] = "꧁༺ 𝓔𝓼𝓽𝓮𝓮'𝓼 𝓒𝓮𝓶𝓮𝓽𝓮𝓻𝔂 ༻꧂";

	return text.join('\n');
}
