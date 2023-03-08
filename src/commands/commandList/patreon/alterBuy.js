/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.alter = function (p, text, opt) {
	switch (p.msg.author.id) {
		case '459469724091154433':
			return quincey(text, opt);
		default:
			return text;
	}
};

function quincey(text, opt) {
	if (opt.type === 'ring') {
		let embed = {};
		switch (opt.ring.id) {
			case 1:
				embed.description =
					'<a:acring:876877807265927238>Quincey bought a <:Cring:873698208398852106> **Common Ring** <a:acring:876877807265927238>';
				embed.color = 13391445;
				break;
			case 2:
				embed.description =
					'<a:aucring:876877947431190578>Quincey bought an <:Ucring:876884532949831780> **Unommon Ring** <a:aucring:876877947431190578>';
				embed.color = 3978440;
				break;
			case 3:
				embed.description =
					'<a:arring:876877908214427748>Quincey bought a <:Rring:876884602772422698> **Rare Ring** <a:arring:876877908214427748>';
				embed.color = 16107621;
				break;
			case 4:
				embed.description =
					'<a:aering:876878478337769512>Quincey bought an <:Ering:876884663958900736> **Epic Ring** <a:aering:876878478337769512>';
				embed.color = 4611818;
				break;
			case 5:
				embed.description =
					'<a:amring:876877974312476714>Quincey bought a <:Mring:876884711656529980> **Mythic Ring** <a:amring:876877974312476714>';
				embed.color = 10445814;
				break;
			case 6:
				embed.description =
					'<a:alring:876877927826997259>Quincey bought a <a:Lring:76884817491402773> **Legendary Ring** <a:lring:876877927826997259>';
				embed.color = 16577355;
				break;
			case 7:
				embed.description =
					'<a:afring:876877836798009384>Quincey bought a <a:Fring:76884855231762433> **Fabled Ring** <a:fring:876877836798009384>';
				embed.color = 10280698;
				break;
			default:
				return text;
		}
		return { embed };
	}
	return text;
}
