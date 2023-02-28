/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

exports.alter = function (id, text, opt) {
	switch (id) {
		case '408371860246364183':
			return lanre(text, opt);
		case '565212326291308545':
			return eliza(text, opt);
		case '413344554247258112':
			return ameodssbxiw(text, opt);
		case '427296171883626496':
			return lIlIIIll(text, opt);
		case '459469724091154433':
			return quincey(text, opt);
		default:
			return text;
	}
};

function lanre(text, opt) {
	text.description = opt.desc;
	text.author.name = "Senko's Stronghold";
	text.image = {
		url: 'https://cdn.discordapp.com/attachments/757362062421655603/788818074706247690/image0.gif',
	};
	if (opt.page % 2) {
		text.color = 16751401;
	} else {
		text.color = 12876847;
	}

	return text;
}

function eliza(text, opt) {
	text.description = opt.desc;
	text.author.name = 'Guarded by Danny and Roshi';
	text.image = {
		url: 'https://cdn.discordapp.com/attachments/833776274139775056/844240371731136533/IMG_20201019_175851_027.jpg',
	};
	text.footer.text += ' | Where a few successes brought us';
	text.color = 65280;

	return text;
}

function ameodssbxiw(text, opt) {
	text.description = opt.desc;
	text.author.name = 'Stronghold held by ameodssbxiw, Eliza and Nala';
	text.image = {
		url: 'https://cdn.discordapp.com/attachments/833776274139775056/843574384873570394/IMG_20201013_182144.jpg',
	};
	text.footer.text += ' | Where a few successes brought us';
	text.color = 2003199;

	return text;
}

function lIlIIIll(text, opt) {
	text.description = opt.desc;
	text.image = {
		url: 'https://cdn.discordapp.com/attachments/787404412335161354/927784700997677116/output-onlinegiftools_61.gif',
	};
	return text;
}

function quincey(text, opt) {
	text.description = opt.weapons
		.map((weapon) => {
			let emoji = `${weapon.rank.emoji}${weapon.emoji}`;
			for (let i = 0; i < weapon.passives.length; i++) {
				let passive = weapon.passives[i];
				emoji += passive.emoji;
			}
			let row = `\`${weapon.uwid}\` ${emoji} ${weapon.avgQuality}% **${weapon.name}**`;
			if (weapon.animal?.name) {
				row += ` | ${weapon.animal.name}`;
			}
			return row;
		})
		.join('\n');

	let image =
		'https://cdn.discordapp.com/attachments/718562499703603251/1074740072399765707/20230212_191407.png';
	text.color = 10183532;
	switch (opt.wid) {
		case 1:
			image =
				'https://media.discordapp.net/attachments/718562499703603251/1074740362188435487/20230211_132513.png?width=767&height=192';
			text.color = 10395294;
			break;
		case 2:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074740580854276196/20230205_220205.png';
			text.color = 118808;
			break;
		case 3:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074740777386774568/20230212_033126.png';
			text.color = 7946542;
			break;
		case 5:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074741114952753152/20230126_173534.png';
			text.color = 7946542;
			break;
		case 6:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074741333593440266/20221123_160638.png';
			text.color = 1055998;
			break;
		case 7:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074741535825993819/20230108_161135.png';
			text.color = 11601933;
			break;
		case 8:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074741785378701362/20221124_230334.png';
			text.color = 990463;
			break;
		case 9:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074741972209766420/20230212_182406.png';
			text.color = 935841;
			break;
		case 10:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074742272823918653/20230124_020341.png';
			text.color = 16733984;
			break;
		case 11:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074742434833121371/20230124_040140.png';
			text.color = 280063;
			break;
		case 12:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074742577472999515/20230124_225238.png';
			text.color = 14025217;
			break;
		case 13:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074742719412453440/20230124_162130.png';
			text.color = 935841;
			break;
		case 14:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074742868146659338/20230126_042125.png';
			text.color = 2204437;
			break;
		case 15:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074743005589815376/20230123_021153.png';
			text.color = 370672;
			break;
		case 16:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074743382196363306/20230126_144402.png';
			text.color = 15957525;
			break;
		case 17:
			image =
				'https://cdn.discordapp.com/attachments/718562499703603251/1074743192299253860/20230124_154008.png';
			text.color = 6765494;
			break;
	}
	text.image = {
		url: image,
	};
	return text;
}
