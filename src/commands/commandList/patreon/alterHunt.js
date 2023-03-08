/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const blank = '<:blank:427371936482328596>';
const huntEmoji = '🌱';
exports.alter = async function (p, id, text, info) {
	const result = await checkDb(p, id, text, info);
	if (result) return result;
	switch (id) {
		case '220934553861226498':
			return geist(text);
		case '369533933471268875':
			return light(text);
		case '242718397836558337':
			return shippig(text);
		case '255750356519223297':
			return spotifybot(text);
		case '358448141424394251':
			return oliverLaVey(text);
		case '371344384366739457':
			return nou(text);
		case '176046069954641921':
			return crown(text);
		case '289411794672418819':
			return louis(text);
		case '348828692539113490':
			return michelle(text, info);
		case '250383887312748545':
			return elsa(text);
		case '181264821713371136':
			return pheonix(text);
		case '192692796841263104':
			return dalu(text);
		case '336611676604596227':
			return blacky(text);
		case '576758923688804357':
			return papershark(text);
		case '283000589976338432':
			return kuma(text);
		case '536711790558576651':
			return garcom(text, info);
		case '229299825072537601':
			return alradio(text, info);
		case '408875125283225621':
			return kirito(text, info);
		case '549876586720133120':
			return kitsune(text, info);
		case '343094664414363658':
			return tiggy(text, info);
		case '166619476479967232':
			return valentine(text, info);
		case '403989717483257877':
			return u_1s1k(text, info);
		case '541103499992367115':
			return ashley(text, info);
		case '216710431572492289':
			return arichy(text, info);
		case '103409793972043776':
			return potsun(text, info);
		case '417350932662059009':
			return sky(text, info);
		case '707939636835516457':
			return direwolf(text, info);
		case '554617574646874113':
			return notJames(text, info);
		case '456598711590715403':
			return lexx(text, info);
		case '490709773495435285':
			return koala(text, info);
		case '468873774960476177':
			return gojo(text, info);
		case '183696273382178816':
			return vanor(text, info);
		default:
			return text;
	}
};

function getA(text) {
	text = text.replace(/\*/gi, '');
	return ['a', 'e', 'i', 'o', 'u'].includes(text[0]) ? 'an' : 'a';
}

async function checkDb(p, id, text, info) {
	let type, replacers;

	if (info.gemText) {
		type = 'gems';
		replacers = {
			username: p.msg.author.username,
			discriminator: p.msg.author.discriminator,
			blank: p.config.emoji.blank,
			gems: info.gemText,
			animals: info.animalEmojis,
			pets: info.petText || '',
			xp: info.animalXp || '',
		};
	} else {
		type = 'nogems';
		const animal = p.global.validAnimal(info.animal[0][1]);
		replacers = {
			username: p.msg.author.username,
			discriminator: p.msg.author.discriminator,
			blank: p.config.emoji.blank,
			pets: info.petText || '',
			xp: info.animalXp || '',
			a: getA(info.animal[0][2]),
			animalRank: info.animal[0][2],
			animalRankEmoji: info.animal[0][0].match(/<a?:\w*:\d*>/i)[0],
			animal: info.animalEmojis,
			animalName: animal.name,
		};
	}
	const sql = `SELECT alterhunt.* from alterhunt INNER JOIN user ON alterhunt.uid = user.uid WHERE user.id = ${p.msg.author.id} AND alterhunt.type = '${type}'`;
	const result = (await p.query(sql))[0];
	if (!result || !result.text) return;

	result.text += info.lootboxText || '';
	result.text = p.global.replacer(result.text, replacers);
	if (!result.isEmbed) {
		return result.text;
	}

	const content = {
		embed: {
			description: result.text,
			title: p.global.replacer(result.title, replacers),
			color: result.color || 1,
		},
	};
	if (result.sideImg) {
		content.embed.thumbnail = { url: result.sideImg };
	}
	if (result.footer) {
		content.embed.footer = { text: p.global.replacer(result.footer, replacers) };
	}
	if (result.bottomImg) {
		content.embed.image = { url: result.bottomImg };
	}
	if (result.author) {
		content.embed.author = {
			name: p.global.replacer(result.author, replacers),
			icon_url: result.showAvatar ? p.msg.author.avatarURL : null,
		};
	}

	return content;
}

function geist(text) {
	text = text.replace('🌱', '🍀');
	text = text
		.replace(
			'spent 5 <:cowoncy:416043450337853441> and caught a **',
			'has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible '
		)
		.replace(
			'spent 5 <:cowoncy:416043450337853441> and caught an **',
			'has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible '
		);
	var topText = '';
	var bottomText = '';
	var embed = {
		description: topText + '\n' + text + '\n' + bottomText,
		color: 6315775,
		thumbnail: {
			url: 'https://i.imgur.com/PcQVN4l.gif',
		},
	};
	return { embed };
}

function light(text) {
	text = text.replace(
		'You found:',
		'Lighti cuddled and befriended many animals and found:\n<:blank:427371936482328596> **|**'
	);
	var embed = {
		description: text,
		color: 4286945,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/531265349375492146/531874556697247746/image0.gif',
		},
	};
	return { embed };
}

function shippig(text) {
	text = text
		.replace(huntEmoji, '<:pandabag:566537378303311872>')
		.replace('hunt is empowered', 'Roo is empowered')
		.replace('You found: ', 'I broke into a zoo and kidnapped:\n**<:blank:427371936482328596> |** ')
		.replace(
			'spent 5 <:cowoncy:416043450337853441> and caught an ',
			'I broke into a zoo and kidnapped an\n**<:blank:427371936482328596> |** '
		)
		.replace(
			'spent 5 <:cowoncy:416043450337853441> and caught a ',
			'I broke into a zoo and kidnapped a\n**<:blank:427371936482328596> |** '
		);
	let embed = {
		description: text,
		color: 6315775,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/514187412797390848/564804190837145624/PandaBag.png',
		},
	};
	return { embed };
}

function spotifybot(text) {
	let spotify = '<a:spotify:577027003656437766>';
	let swipeup = '<a:swipeup:577026648646483969>';
	let nowplaying = '<a:nowplaying:577026647434330132>';
	let img =
		'https://cdn.discordapp.com/attachments/547465561919979551/628087450815823912/image0.gif';
	if (text.indexOf('empowered by') >= 0) {
		text =
			spotify +
			' Hey **Spotify** *Make a New Playlist!*\n' +
			text
				.replace(', hunt is empowered by', "'s Playlist is Sponsored by")
				.replace(huntEmoji, '<:blank:427371936482328596>')
				.replace('**<:blank:427371936482328596> |** You found', nowplaying + ' **|** You added')
				.replace('xp**!', 'xp**! *Shuffle Play* ' + swipeup);
	} else {
		text =
			spotify +
			' Hey **Spotify** *Make a New Playlist!*\n' +
			text
				.replace(huntEmoji, nowplaying)
				.replace('caught', 'added')
				.replace('xp**!', 'xp**! *Shuffle Play* ' + swipeup);
	}
	let embed = {
		description: text,
		color: 1947988,
		thumbnail: {
			url: img,
		},
	};
	return { embed };
}

function oliverLaVey(text) {
	let dna = '<:dna:587991032562581535>';
	let tube = '<:testtube:587991032788942868>';
	let needle = '💉';
	if (text.indexOf('empowered by') >= 0) {
		text =
			tube +
			' *New specimens inbound!*\n' +
			text
				.replace(', hunt is empowered by', "'s research is empowered by")
				.replace(huntEmoji, dna)
				.replace('You found', 'You sampled')
				.replace('xp**!', 'xp**! *Downloading CRISPR-Cas9* ' + needle);
	} else {
		text =
			tube +
			' *New specimens inbound!*\n' +
			text
				.replace('caught a', 'sampled a')
				.replace(huntEmoji, dna)
				.replace('xp**!', 'xp**! *Downloading CRISPR-Cas9* ' + needle);
	}
	return text;
}

function nou(text) {
	let rainbow = '<a:rainbowcat:587998090045423637>';
	let scree = '<a:SCREE:587998074807255056>';
	let whitecomet = '<a:whitecomet:587998076032254002>';
	let ark = '<:ark:587998073368608772>';
	let ark2 = '<:ark2:587998074304200744>';
	let earth = '🌎';
	if (text.indexOf('empowered by') >= 0) {
		text =
			whitecomet +
			' **|** The Ark of Destruction has arrived\n' +
			ark +
			' **|** Activating Gravity Core\n' +
			ark +
			' **|** Charging Core!\n' +
			ark +
			' **|** Core active! ' +
			scree +
			'\n' +
			ark +
			' **|** Capturing Target Planet ' +
			earth +
			'\n' +
			text
				.replace(huntEmoji, whitecomet)
				.replace(
					/[a-z\* ]+, hunt is empowered by/gi,
					'** Ark of Destruction is currently energized with'
				)
				.replace('` !', '` ! ' + scree)
				.replace(
					'**<:blank:427371936482328596> |** You found:',
					ark2 + ' **|** Planet Captured, No U found '
				)
				.replace('\n<:blank', ' In the Planet! ' + rainbow + '\n<:blank');
	} else {
		text =
			whitecomet +
			' **|** The Ark of Destruction has arrived\n' +
			ark +
			' **|** Activating Gravity Core\n' +
			ark +
			' **|** Charging Core!\n' +
			ark +
			' **|** Core active! ' +
			scree +
			'\n' +
			ark +
			' **|** Capturing Target Planet ' +
			earth +
			'\n' +
			text
				.replace(huntEmoji, ark2)
				.replace('| ', '|** Planet Captured, **')
				.replace('spent 5 <:cowoncy:416043450337853441> and caught', 'found')
				.replace('!\n<:blank', ' In the Planet! ' + rainbow + '\n<:blank');
	}
	return text;
}

function crown(text) {
	let crown = '<a:crown:599030694953353216>';
	if (text.indexOf('empowered by') >= 0) {
		text = text
			.replace(', hunt is empowered by', "'s Elite Force marches into the forest with")
			.replace(huntEmoji, crown)
			.replace('You found', 'and after 1 week they found')
			.replace('  !', '');
	} else {
		text = text
			.replace(huntEmoji, crown)
			.replace(
				'spent 5 <:cowoncy:416043450337853441> and caught a',
				"'s Elite Force marches into the forest\n**<:blank:427371936482328596> |** and after 1 week they found a"
			);
	}
	let embed = {
		description: text,
		color: 3421756, //4286945,
		thumbnail: {
			url: 'https://i.imgur.com/nQwrbvd.gif',
		},
	};
	return { embed };
}

function louis(text) {
	let roorun = '<a:roorun:605562843416363018>';
	let roosleep = '<:roosleep:605562842107740203>';
	if (text.indexOf('empowered by') >= 0) {
		text =
			roorun +
			' **|** *panda is super excited!*\n' +
			text
				.replace(huntEmoji, blank)
				.replace(/[a-zA-z0-9!?\s.]+\*\*,\shunt/gi, 'roo**')
				.replace('You found', 'roo made friends with')
				.replace('xp**!', 'xp**!\n' + roosleep + ' **|** *panda is tired now*');
	} else {
		text =
			roorun +
			' **|** *panda is super excited!*\n' +
			text
				.replace(huntEmoji, blank)
				.replace(/[a-zA-z0-9!?]+\*\*\sspent/gi, 'roo** spent')
				.replace('and caught a', 'and made friends with a')
				.replace('xp**!', 'xp**!\n' + roosleep + ' **|** *panda is tired now*');
	}
	return text;
}

function michelle(text, info) {
	let meowth = '<a:meowth:605676882788089867>';
	let persian = '<a:persian:605676882599477249>';

	if (info.gemText) {
		text = `${meowth} **| Meowth** is empowered by ${info.gemText}!\n${blank} **|** It returned with: ${info.animalEmojis}\n${blank} **|** and evolved into a **Persian** ${persian}`;
	} else {
		const a = getA(info.animal[0][0]);
		text = `${meowth} **| Meowth** went out and caught ${a} ${info.animal[0][0]} ${info.animalEmojis}\n${blank} **|** and evolved into a **Persian** ${persian}`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';

	return text;
}

function elsa(text) {
	if (text.indexOf('empowered by') >= 0) {
		text = text.replace(', hunt is empowered by', "'s Knights gather recruits! Using");
	} else {
		text = text.replace(' spent 5 <:cowoncy:416043450337853441> and caught', "'s Knights found");
	}
	let embed = {
		description: text,
		color: 7319500,
		thumbnail: {
			url: 'https://i.imgur.com/kDnD8WQ.gif',
		},
	};
	return { embed };
}

function pheonix(text) {
	if (text.indexOf('empowered by') >= 0) {
		text = text
			.replace(', hunt is empowered by', ' has searched far and wide all over the galaxy with')
			.replace('You found', 'and found')
			.replace('  !', '');
	} else {
		text = text
			.replace(
				'spent 5 <:cowoncy:416043450337853441> and caught a **',
				'has searched far and wide all over the galaxy\n**<:blank:427371936482328596> |** and found an **amazing'
			)
			.replace(
				'spent 5 <:cowoncy:416043450337853441> and caught an **',
				'has searched far and wide\n**<:blank:427371936482328596> |** and found an **incredible '
			);
	}
	return text;
}

function dalu(text) {
	let _foxhappy = '<:foxhappy:641916900544217088>';
	let _foxlove = '<:foxlove:641916900212867073>';
	if (text.indexOf('empowered by') >= 0) {
		text = text
			.replace(', hunt is empowered by', ' is searching for food and uses ')
			.replace('  !', ' to help him.')
			.replace('You found', 'He found  his pray not far away');
	}
	let embed = {
		description: text,
		color: 63996,
		thumbnail: {
			url: 'https://i.imgur.com/sa5IZRo.gif',
		},
	};
	return { embed };
}

function blacky(text) {
	text = text.replace(huntEmoji, '<a:running:653370372997120010>');
	if (text.indexOf('empowered by') >= 0) {
		text = text
			.replace(', hunt is empowered by', "'s umbreon is empowered by\n" + blank + ' **|**')
			.replace('You found', 'and found');
	} else {
		text = text
			.replace(
				' spent 5 <:cowoncy:416043450337853441> and caught a **',
				', your umbreon went out for a walk\n' + blank + ' **|** and came back with an **amazing '
			)
			.replace(
				' spent 5 <:cowoncy:416043450337853441> and caught an **',
				', your umbreon went out for a walk\n' + blank + ' **|** and came back with an **amazing '
			);
	}
	let embed = {
		description: text,
		color: 1,
		thumbnail: {
			url: 'https://cdn.discordapp.com/emojis/648999664963551284.gif',
		},
	};
	return { embed };
}

function papershark(text) {
	const _shark1 = '<:shark1:663939570311888908>';
	const shark2 = '<a:shark2:663939570588450846>';
	const shark3 = '<a:shark3:663939571322454016>';
	const shark4 = '<a:shark4:663939571423117333>';
	const shark5 = '<:shark5:663939570827657250>';
	const shark6 = '<:shark6:663939570664210449>';
	if (text.indexOf('empowered by') >= 0) {
		text =
			'> ' +
			text
				.replace(huntEmoji, '')
				.replace(
					/^[*|,\d<:> \w]+empowered/i,
					`${shark2} Shark is lonely ${shark2}\n> ${shark3} Shark is empowered`
				)
				.replace(
					'**<:blank:427371936482328596> |** You found:',
					'> ' + shark4 + ' Shark made friends with'
				)
				.replace(blank + ' **|** ', '> ') +
			'\n> ' +
			shark5 +
			' Shark is no longer lonely ' +
			shark6;
	} else {
		text =
			text
				.replace(huntEmoji, '')
				.replace(
					/^[*|\d<:> \w]+caught/i,
					`> ${shark2} Shark is lonely ${shark2}\n> ${shark4} Shark made friends with`
				)
				.replace(blank + ' **|** ', '> ') +
			'\n> ' +
			shark5 +
			' Shark is no longer lonely ' +
			shark6;
	}
	return text;
}

function kuma(text) {
	const ck = '<:ck:674153651056410624>';
	if (text.indexOf('empowered by') >= 0) {
		text = text
			.replace(', hunt is empowered by', ' sends out the Cookie minions using')
			.replace('You found', 'and they returned with')
			.replace(huntEmoji, ck);
	} else {
		text = text
			.replace(
				' spent 5 <:cowoncy:416043450337853441> and caught',
				"'s Cookie minions came back with"
			)
			.replace(huntEmoji, ck);
	}
	return text;
}
function garcom(text, info) {
	const vold = '🌋';
	const swords = '⚔️';
	if (info.gemText) {
		text = `**YAF** began wiping Predator II NA!\nEmpowered by ${info.gemText} !\nthey returned with: ${info.animalEmojis}\nand successfully claimed the ${vold}\n${info.petText} gained **${info.animalXp}xp**!\n`;
	} else {
		text = `**YAF** began wiping Predator II NA!\nand successfully claimed the ${vold}\nand returned with ${info.animalEmojis}\nand successfully claimed the ${vold}\n${info.petText} gained **${info.animalXp}xp**!\n`;
	}
	text += `${swords} **YAF** ${swords} Hydra, Fancy, Lester, Imyo, Ntshai, Mog,\nElwood, Danny, CC, Flame, Palu, Feli`;
	text += info.lootboxText || '';
	const embed = {
		description: text,
		color: 1,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/674765942445703198/677421093392482324/ark.gif',
		},
	};
	return { embed };
}

function alradio(text, info) {
	if (info.gemText) {
		text = `Now let's give these burning fools a place to dwell.\n**${info.author.username}** activated ${info.gemText}\nand recruited: ${info.animalEmojis}`;
	} else {
		text = `**${info.author.username}** donated 5 and recruited ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';
	const embed = {
		description: text,
		color: 1,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/626155987904102402/686634765805289482/image0.gif',
		},
	};
	return { embed };
}

function kirito(text, info) {
	const emoji = '<a:bot:737118875585478767>';
	if (info.gemText) {
		text = `${emoji} **| Zero Two** empowers her hunts by ${info.gemText}\n${blank} **| Zero Two** caught: ${info.animalEmojis}`;
	} else {
		text = `${emoji} **| Zero Two** goes out to hunt and catches a(n) ${info.animal[0][0]} ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';
	return text;
}

function kitsune(text, info) {
	const emoji = '<:kitsune:737160182655615097>';
	if (info.gemText) {
		text = `${emoji} **| ${
			info.author.username
		}** plays a pledged game with OwO, the lord of games using: ${info.gemText.replace(
			/`/gi,
			'**'
		)} **ASCHENTE**!\n${blank} **|** Victoriously returns with: ${info.animalEmojis}`;
	} else {
		text = `${emoji} **| ${info.author.username}** plays a pledged game with OwO, the lord of games. **ASCHENTE**!\n${blank} **|** Victoriously returns with a(n) ${info.animal[0][0]} ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';
	const embed = {
		description: text,
		color: Math.random() > 0.5 ? 15399610 : 15523028,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/704215180044927030/728074508694454302/image0.gif',
		},
	};
	return { embed };
}

function tiggy(text, info) {
	const emoji = '🔥';
	if (info.gemText) {
		text = `${emoji} **| ${info.author.username}**, your flamethrower is fueled by ${info.gemText}\n${blank} **|** You destroyed the local habitats of: ${info.animalEmojis}`;
	} else {
		text = `${emoji} **| ${info.author.username}**, your flamethrower spurts out nothing...\n ${blank} **|** you managed to catch: ${info.animal[0][0]} ${info.animalEmojis} with your bare hands`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';
	return text;
}

function valentine(text, info) {
	const moon = '<a:moon:759722114201812993>';
	const cat = '<a:cat:759722302786764852>';
	const butterfly = '<:butterfly:759722177766621224>';
	const wand = '<a:wand:759724096954564630>';

	if (info.gemText) {
		text = `${moon} **| ${info.author.username}**  arrives at 火星, blessed by ${info.gemText}\n${butterfly} **|** you returned with: ${info.animalEmojis}`;
	} else {
		text = `${moon} **| ${info.author.username}**  arrives at 火星 ${wand}\n${butterfly} **|** you returned with a ${info.animal[0][0]} ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${butterfly} **|** ${info.petText} gained **${info.animalXp}xp** ${cat}!`;
	}
	text += info.lootboxText || '';
	text.replace(blank, butterfly);
	const embed = {
		description: text,
		color: 1,
		thumbnail: {
			url: 'https://i.imgur.com/19cjldb.gif',
		},
	};

	return { embed };
}

function u_1s1k(text, info) {
	const zen = '<:zen:770081925490016257>';
	const zen2 = '<:zen2:770081925401673760>';
	const crystal = '<a:crystal:770081927012155413>';
	const _money = '<a:money:770081926236340235>';

	if (info.gemText) {
		text = `${zen} **| ${info.author.username}**, ${crystal} Zeno ${crystal} has searched the universe far and wide with ${info.gemText}\n${zen2} **|** and came back with: ${info.animalEmojis}`;
	} else {
		text = `${zen} **| ${info.author.username}**, ${crystal} Zeno ${crystal} has searched the universe far and wide.\n${zen2} **|** and came back with a(n) ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${crystal} **|** ${info.petText} gained **${info.animalXp}xp**! ${crystal} SUPREME ${crystal}`;
	}
	text += info.lootboxText || '';
	const embed = {
		description: text,
		color: 11393254,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/628936051490160661/765164586654629888/image0.gif',
		},
	};

	return { embed };
}

function ashley(text, info) {
	const catpunch = '<a:catpunch:770114194774425630>';
	const qbert = '<:qbert:774557756376088586>';

	if (info.gemText) {
		text = `${catpunch} **| ${info.author.username}**, wants to wreck it!!! Harnessing power from ${info.gemText} ${qbert}\n${blank} **|** You helped these animals to safety first! ${info.animalEmojis}`;
	} else {
		text = `${catpunch} **| ${info.author.username}**, wants to wreck it!!! You spent 5 cowoncy to empower yourself!${qbert}\n${blank} **|** You helped this animal to safety first! ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**!`;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 9502720,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/661043173992169482/760890231942938705/ralph_main.gif',
		},
	};

	return { embed };
}

function arichy(text, info) {
	const wizard = '🧙‍♀️';

	if (info.gemText) {
		text = `${wizard} **| ${info.author.username}**, your Mage has returned from her adventure in an alternate universe learned new spells.\n`;
		text += `${blank} **|** Her magic powers were enhanced by: ${info.gemText}\n`;
		text += `${blank} **|** On the journey, she found... ${info.animalEmojis}`;
	} else {
		text = `${wizard} **| ${info.author.username}**, your Mage has returned from her adventure in an alternate universe learned new spells.\n`;
		text += `${blank} **|** On the journey, she found... ${info.animal[0][0]} ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${blank} **|** ${info.petText} gained **${info.animalXp}xp**! It's time to visit the Dungeon 🔥`;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 4886754,
		thumbnail: {
			url: 'https://i.imgur.com/vvpFulp.gif',
		},
	};

	return { embed };
}

function potsun(text, info) {
	const vollyball = '<a:vollyball:811866936857722890>';

	if (info.gemText) {
		text = `${vollyball} **| ${info.author.username}**, drop it like it's **hot hot** ${info.gemText}\n`;
		text += `${vollyball} **|** that's a **lot lot!**: ${info.animalEmojis}`;
	} else {
		text = `${vollyball} **| ${info.author.username}**, drop it like it's **hot hot**\n`;
		text += `${vollyball} **|** that's a **lot lot!**: ${info.animal[0][0]} ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${vollyball} **|** ${info.petText} **got got ${info.animalXp}xp**`;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 1,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/773753455004614708/799473320138506250/SmartSelect_20210114-190030_Discord.gif',
		},
	};

	return { embed };
}

function sky(text, info) {
	const moon = '<a:moon:812206696930869248>';
	const butterfly = '<:butterfly:812206696587329557>';
	const sparkle = '<a:sparkle:812206697182920734>';
	const rose = '<a:rose:812206697166012426>';
	let thumbnail;

	if (info.gemText) {
		text = `${moon} **|** Deep in the enchanted forest, the activation of:\n`;
		text += `${blank} **|** ${info.gemText} allowed **${info.author.username}** to cast a powerful spell!\n`;
		text += `${rose} **|** capturing: ${info.animalEmojis}`;
		thumbnail =
			'https://cdn.discordapp.com/attachments/771398927912009738/806678445680885770/image0.gif';
	} else {
		const a = getA(info.animal[0][0]);
		text = `${moon} **|** Searching the vast lands, wielding a guild artifact,\n`;
		text += `${butterfly} **| ${info.author.username}** and her party caught ${a} ${info.animal[0][0]} ${info.animalEmojis}`;
		thumbnail =
			'https://cdn.discordapp.com/attachments/733364738372665434/809928381743235112/VmSHDpYneoQ2HHn6ri03-vvR0srhK8OUUbSsn0Yp60iqPQXOB_xTuPrggC4Yo1jDPiHkNWGtTcNgB_TOkxeOUto5sHm4gf6Mptt-.png';
	}
	if (info.petText) {
		text += `\n${sparkle} **|** ${info.petText} gained **${info.animalXp}xp**`;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 15525304,
		thumbnail: {
			url: thumbnail,
		},
	};

	return { embed };
}

function direwolf(text, info) {
	const bluefire1 = '<a:bluefire1:812938075167916032>';
	const bluefire2 = '<a:bluefire2:812938075209859102>';
	const yellowfire = '<a:yellowfire:812938075281948693>';
	const redfire = '<a:redfire:812938075361378315>';
	const rainbowfire = '<a:rainbowfire:812938075696136232>';
	const sparkle = '<a:sparkle:812938075255603210>';
	let thumbnail, color;

	if (info.gemText) {
		text = `${redfire} **|** Natsu consumes the power of the gems!\n`;
		text += `${yellowfire} **|** ${info.gemText} Natsu slowly builds up and releases a dragon breath attack!\n`;
		text += `${bluefire1} **|** Caught in Natsu's breath attack are: ${info.animalEmojis}`;
		thumbnail =
			'https://cdn.discordapp.com/attachments/771398927912009738/807425550947582023/image0.gif';
		color = 16518144;
		if (info.petText) {
			text += `\n${rainbowfire} **|** ${info.petText} gained **${info.animalXp}xp**`;
		}
	} else {
		const a = getA(info.animal[0][0]);
		text = `${bluefire1} **|** The Twin Dragons enter their Dragon Force state and begin to focus their power on a single point!\n`;
		text += `${bluefire2} **|** They unlease a Unison Raid! Caught in it is ${a} ${info.animal[0][0]} ${info.animalEmojis}`;
		thumbnail =
			'https://cdn.discordapp.com/attachments/771398927912009738/807425397830451220/image0.gif';
		color = 1303277;
		if (info.petText) {
			text += `\n${sparkle} **|** ${info.petText} gained **${info.animalXp}xp**`;
		}
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color,
		thumbnail: {
			url: thumbnail,
		},
	};

	return { embed };
}

function notJames(text, info) {
	const moon = '<a:moon:819081050520813568>';
	const peach = '<:peach:819081050369949736>';
	const spark3 = '<a:spark3:843740415449890868>';
	const spark6 = '<a:spark6:843740442662404096>';
	const star8 = '<a:star8:843740415341625385>';
	const star7 = '<a:star7:843740442394099754>';

	if (info.gemText) {
		text =
			`${moon} **| ${info.author.username}** storms into a peach farm\n` +
			`${spark3} **|** with ${info.gemText.replace(/\/\d+|`+/gi, '')}\n` +
			`${spark6} **|** and runs away with ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${star8} **|** ${info.petText} gain **${info.animalXp}** ${peach}`;
		}
	} else {
		const a = getA(info.animal[0][0]);
		text = `${moon} **| ${info.author.username}** breaks into a peach farm with bare hands\n`;
		text += `${spark6} **|** and runs away with ${a} ${info.animal[0][0]} ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${star7} **|** ${info.petText} gain **${info.animalXp}** ${peach}`;
		}
	}
	if (info.lootboxText) {
		text += `\n${blank} **| Lootbox** [**${
			info.lootboxText.match(/\[\d+\//gi)[0].match(/\d+/gi)[0]
		}**] is found!`;
	}

	const url =
		Math.random() > 0.5
			? 'https://cdn.discordapp.com/attachments/815195361379090442/817327541010038784/J_1.gif'
			: 'https://cdn.discordapp.com/attachments/815195361379090442/835389547713003520/Test-4.gif';

	const embed = {
		description: text,
		color: 16776664,
		thumbnail: { url },
	};

	return { embed };
}

function lexx(text, info) {
	const lexx = '<a:pepegold:819452921144934400>';
	const clover = '☘️';

	if (info.gemText) {
		text = `${lexx} **| ${info.author.username}** with all his hard work, was able to grind\n`;
		text += `${blank} **|** and find ${info.gemText}\n`;
		text += `${clover} **|** and caught: ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${blank} **|** ${info.petText} gained **${info.animalXp} xp**!`;
		}
	} else {
		const a = getA(info.animal[0][0]);
		text = `${lexx} **| ${info.author.username}** with all his hard work, was able to grind\n`;
		text += `${clover} **|** and find ${a} ${info.animal[0][0]} ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${blank} **|** ${info.petText} gained **${info.animalXp} xp**`;
		}
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 8240363,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/696878982758531152/811499801782386757/Zoidberg.png',
		},
	};

	return { embed };
}

function koala(text, info) {
	const emoji = '🐨';
	const sapling = '🌱';

	if (info.gemText) {
		text = `${emoji} **| ${info.author.username}** goes into hunt!\n`;
		text += `${blank} **|** ${info.gemText.replace(/\/\d+|`+/gi, '')}`;
		const animals = info.animalEmojis.split(' ');
		for (let i in animals) {
			if (i % Math.ceil(animals.length / 2) == 0) {
				text += `\n${blank} **|**`;
			}
			text += ' ' + animals[i];
		}
		if (info.petText) {
			text += `\n${sapling} **|** **${info.animalXp}xp**!`;
		}
	} else {
		text = `${emoji} **| ${info.author.username}** goes into hunt!\n`;
		text += `${blank} **|** ${info.animal[0][0].replace(/\*{2}\w+\*{2}\s/gi, '')}\n`;
		text += `${blank} **|** ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${sapling} **|** **${info.animalXp}xp**!`;
		}
	}
	if (info.lootboxText) {
		text += `\n<:box:427352600476647425> **| Lootbox**!!! [**${
			info.lootboxText.match(/\[\d+\//gi)[0].match(/\d+/gi)[0]
		}**]`;
	}

	const embed = {
		description: text,
		color: 65280,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/541197084146270208/817734024936030208/Koalabatbuom_to.gif',
		},
	};

	if (info.lootboxText) {
		embed.image = {
			url: 'https://cdn.discordapp.com/attachments/541197084146270208/817733999287205908/boxopen.gif',
		};
	}

	return { embed };
}

function gojo(text, info) {
	let url, color;

	const flamePurple = '<a:flamePurple:832525958732447804>';
	const flameBlue = '<a:flameBlue:832525958731923526>';
	const flameRed = '<a:flameRed:832525958837043210>';
	const flameBlack = '<a:flameBlack:832525958635454484>';
	const sparkle1 = '<a:sparkle1:832525958749093889>';
	const sparkle2 = '<a:sparkle2:832525958748831804>';

	if (info.gemText) {
		text = `${flameBlue} **|** Gojo Satoru goes to hunt curses and uses Cursed Amplification Technique: Blue and Cursed Reversal Technique: Red\n`;
		text += `${flameRed} **|** ${info.gemText} Gojo combines them and forms Hollow Purple\n`;
		text += `${flamePurple} **|** Caught in Hollow Purple are: ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${sparkle1} **|** ${info.petText} gained **${info.animalXp} XP!**`;
		}
		url =
			'https://cdn.discordapp.com/attachments/793146733701234718/822707168410861568/ezgif-2-e3da357a121a.gif';
		color = 11796735;
	} else {
		const a = getA(info.animal[0][0]);
		text = `${flameBlack} **|** Itadori Yuji goes to hunt curses in Jujutsu Tech\n`;
		text += `${flameRed} **|** Itadori Yuji finds a curse and uses Black Flash. He catches ${a} ${info.animal[0][0]} ${info.animalEmojis}`;
		if (info.petText) {
			text += `\n${sparkle2} **|** ${info.petText} gained **${info.animalXp} XP!**`;
		}
		url =
			'https://cdn.discordapp.com/attachments/793146733701234718/822706902471147560/1616218993296.gif';
		color = 10027008;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: color,
		thumbnail: {
			url: url,
		},
	};

	return { embed };
}

function vanor(text, info) {
	const emoji = '<a:harleyquinn:832531027900628992>';

	if (info.gemText) {
		text = `${emoji} **|** Here Ya Go **Puddin'!** ${info.gemText}\n`;
		text += `${emoji} **| What Do** You Think? ${info.animalEmojis}`;
	} else {
		text = `${emoji} **|** Here Ya Go **Puddin'!**\n`;
		text += `${emoji} **| What Do** You Think? ${info.animalEmojis}`;
	}
	if (info.petText) {
		text += `\n${emoji} **|** ${info.petText} gained **${info.animalXp} xp**`;
	}
	text += info.lootboxText || '';

	const embed = {
		description: text,
		color: 16761035,
		thumbnail: {
			url: 'https://cdn.discordapp.com/attachments/803270612906410014/823821538616803348/ezgif.com-crop.gif',
		},
	};

	return { embed };
}
