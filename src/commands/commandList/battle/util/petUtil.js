/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const teamUtil = require('./teamUtil.js');
const animalUtil = require('./animalUtil.js');
const WeaponInterface = require('../WeaponInterface.js');

const PAGE_SIZE = 9;

/* get and parse animals from the database */
exports.getAnimals = async function (p) {
	let sql = `SELECT 
			animal.name, animal.nickname, animal.pid, animal.xp,
			user_weapon.uwid, user_weapon.wid, user_weapon.stat, user_weapon.wear,
			user_weapon_passive.pcount, user_weapon_passive.wpid, user_weapon_passive.stat as pstat,
			user_weapon_kills.uwid as tt, user_weapon_kills.kills
		FROM animal
			LEFT JOIN user_weapon ON user_weapon.pid = animal.pid
			LEFT JOIN user_weapon_passive ON user_weapon.uwid = user_weapon_passive.uwid
			LEFT JOIN user_weapon_kills ON user_weapon.uwid = user_weapon_kills.uwid
		WHERE animal.id = ${p.msg.author.id}
			AND animal.xp > 0
		ORDER BY animal.xp DESC;`;
	let result = await p.query(sql);
	let animals = teamUtil.parseTeam(result, result);
	for (let i in animals) animalUtil.stats(animals[i]);
	return animals;
};

/* Construct embed message */
exports.getDisplay = function (p, animals, page = 0) {
	const totalPages = Math.max(1, Math.ceil(animals.length / PAGE_SIZE));
	const pageAnimals = animals.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

	let embed = {
		author: {
			name: p.getName() + "'s pets",
			icon_url: p.msg.author.avatarURL,
		},
		color: p.config.embed_color,
		fields: [],
		footer: {
			text: `Page ${page + 1} of ${totalPages}`,
		},
	};

	for (let i in pageAnimals) {
		let animal = pageAnimals[i];
		let digits = 1;
		let tempDigit = Math.log10(animal.stats.hp[1] + animal.stats.hp[3]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.wp[1] + animal.stats.wp[3]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.att[0] + animal.stats.att[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.mag[0] + animal.stats.mag[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.pr[0] + animal.stats.pr[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		tempDigit = Math.log10(animal.stats.mr[0] + animal.stats.mr[1]) + 1;
		if (tempDigit > digits) digits = tempDigit;
		digits = Math.trunc(digits);

		let hp = ('' + Math.ceil(animal.stats.hp[1] + animal.stats.hp[3])).padStart(digits, '0');
		let wp = ('' + Math.ceil(animal.stats.wp[1] + animal.stats.wp[3])).padStart(digits, '0');
		let att = ('' + Math.ceil(animal.stats.att[0] + animal.stats.att[1])).padStart(digits, '0');
		let mag = ('' + Math.ceil(animal.stats.mag[0] + animal.stats.mag[1])).padStart(digits, '0');
		let pr = WeaponInterface.resToPrettyPercent(animal.stats.pr);
		let mr = WeaponInterface.resToPrettyPercent(animal.stats.mr);
		let stats = `<:hp:531620120410456064> \`${hp}\` <:wp:531620120976687114> \`${wp}\`\n<:att:531616155450998794> \`${att}\` <:mag:531616156231139338> \`${mag}\`\n<:pr:531616156222488606> \`${pr}\` <:mr:531616156226945024> \`${mr}\``;

		let weapon = animal.weapon;
		let weaponText = '';
		if (weapon) {
			weaponText += `\`${weapon.uwid}\` ${weapon.rank.emoji} ${weapon.emoji} `;
			for (var j = 0; j < weapon.passives.length; j++) {
				weaponText += `${weapon.passives[j].emoji} `;
			}
			weaponText += `${weapon.avgQuality}%`;
		}

		let field = {
			name:
				(animal.animal.uni ? animal.animal.uni : animal.animal.value) +
				' ' +
				p.replaceMentions(animal.nickname ? animal.nickname : animal.animal.name),
			value: `Lvl.${animal.stats.lvl} \`[${p.global.toFancyNum(
				animal.stats.xp[0]
			)}/${p.global.toFancyNum(animal.stats.xp[1])}]\`\n${stats}\n${weaponText}`,
			inline: true,
		};
		embed.fields.push(field);
	}

	return embed;
};

exports.PAGE_SIZE = PAGE_SIZE;
