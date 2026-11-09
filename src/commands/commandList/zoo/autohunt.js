/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const alterhb = require('../patreon/alterHuntbot.js').alter;
const autohuntutil = require('./autohuntutil.js');
const animalUtil = require('./animalUtil.js');
const global = require('../../../utils/global.js');
const letters = 'abcdefghijklmnopqrstuvwxyz';
const botrank = `SELECT COUNT(id) AS rank FROM autohunt WHERE autohunt.total >= (SELECT autohunt.total FROM autohunt WHERE id = `;
const logger = require('../../../utils/logger.js');
const parse = require('parse-duration');
const patreonUtil = require('../patreon/utils/patreonUtil.js');
const teamUtil = require('../battle/util/teamUtil.js');
const numberModal = require('../../../utils/numberModal.js');

const upgradeTraits = ['efficiency', 'duration', 'cost', 'gain', 'exp', 'radar'];

module.exports = new CommandInterface({
	alias: ['autohunt', 'huntbot', 'hb', 'ah'],

	args: '{cowoncy}',

	desc: 'Use autohunt to hunt for animals automatically! Upgrade huntbot for more efficient hunts!',

	example: ['owo autohunt', 'owo autohunt 1000', 'owo autohunt 10h'],

	related: ['owo sacrifice', 'owo upgrade'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['animals'],

	cooldown: 1000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let args = p.args,
			con = p.con;
		if (args.length == 0) await display(p, p.msg, con, p.send);
		else await autohunt(p, p.msg, con, p.args, p.global, p.send);
	},
});

async function claim(p, msg, con, query, bot) {
	let timer = parseInt(query.timer);
	if (timer < query.huntmin) {
		let time = query.huntmin - timer;
		let min = time % 60;
		let hour = Math.trunc(time / 60);
		let percent = generatePercent(timer, query.huntmin, 25);
		return {
			time: (hour > 0 ? hour + 'H ' : '') + min + 'M',
			bar: percent.bar,
			percent: percent.percent,
			count: Math.trunc(query.huntcount * (timer / query.huntmin)),
		};
	}

	let duration = query.huntmin / 60;
	//Get Total essence
	let totalGain = Math.floor(autohuntutil.getLvl(query.gain, 0, 'gain').stat * duration);

	let sql =
		'UPDATE autohunt SET huntmin = 0,huntcount=0,essence = essence +' +
		totalGain +
		',total = total + ' +
		totalGain +
		' WHERE id = ' +
		msg.author.id +
		' AND huntmin > 0;';
	let result = await p.query(sql);

	if (result.changedRows <= 0) {
		return;
	}

	//Check if patreon
	const supporter = await patreonUtil.getSupporterRank(p, p.msg.author);
	let patreon = supporter.benefitRank > 0;

	//Get total exp
	let totalExp = Math.floor(autohuntutil.getLvl(query.exp, 0, 'exp').stat * duration);
	await teamUtil.giveXPToUserTeams(p, p.msg.author, totalExp);

	//Get all animal
	let radar = autohuntutil.getLvl(query.radar, 0, 'radar');
	let { animals, animalSql } = await animalUtil.getMultipleAnimals(query.huntcount, p.msg.author, {
		patreon: patreon,
		huntbot: radar.stat,
	});
	let digits = 0;
	for (let key in animals) {
		if (animals[key].count > digits) digits = animals[key].count;
	}
	digits = Math.trunc(Math.log10(digits) + 1);
	let text =
		'**' +
		bot +
		' |** `BEEP BOOP. I AM BACK WITH ' +
		query.huntcount +
		' ANIMALS,`\n**<:blank:427371936482328596> |** `' +
		totalGain +
		' ESSENCE, AND ' +
		totalExp +
		' EXPERIENCE`';
	let tempText = [];

	for (let animal in animals) {
		let animalString = animal + p.global.toSmallNum(animals[animal].count, digits) + '  ';
		const order = p.animalUtil.getOrder();
		let animalLoc = order.indexOf(animals[animal].rank);
		if (animalLoc || animalLoc === 0) {
			if (!tempText[animalLoc])
				tempText[animalLoc] = ' \n' + p.animalUtil.getRank(order[animalLoc]).emoji + ' **|**';
			tempText[animalLoc] += ' ' + animalString;
		}
	}

	for (let i = 0; i < tempText.length; i++) if (tempText[i]) text += tempText[i];

	result = await p.query(animalSql);
	text = alterhb(msg.author.id, text, 'returned');
	p.send(text);
	for (let animal in animals) {
		let tempAnimal = global.validAnimal(animal);
		logger.incr(
			'animal',
			animals[animal].count,
			{ rank: tempAnimal.rank, name: tempAnimal.name },
			p.msg
		);
		logger.incr('zoo', tempAnimal.points * animals[animal].count, {}, p.msg);
	}
	logger.incr('essence', totalGain, { type: 'huntbot' }, p.msg);
}

async function autohunt(p, msg, con, args, global, send) {
	let cowoncy;
	let password;
	let length;
	if (global.isInt(args[0]) || parse(args[0], 'h')) {
		cowoncy = parseInt(args[0]);
		password = args[1];
		length = parse(args[0], 'h');
	} else if (global.isInt(args[1]) || parse(args[1], 'h')) {
		cowoncy = parseInt(args[1]);
		password = args[0];
		length = parse(args[1], 'h');
	}

	if (password) password = password.toLowerCase();

	if (!cowoncy && !length) {
		send('**🚫 | ' + p.getName() + '**, Wrong syntax!', 3000);
		return;
	}

	if (cowoncy <= 0 && !length) {
		send('**🚫 | ' + p.getName() + '**, Invalid cowoncy amount!', 3000);
		return;
	}

	if (length != null && length <= 0) {
		send('**🚫 | ' + p.getName() + '**, Invalid duration!', 3000);
		return;
	}

	let sql =
		'SELECT *,TIMESTAMPDIFF(MINUTE,start,NOW()) AS timer,TIMESTAMPDIFF(MINUTE,passwordtime,NOW()) AS pwtime FROM autohunt WHERE id = ' +
		msg.author.id +
		';';
	sql += 'SELECT * FROM cowoncy WHERE id = ' + msg.author.id + ';';
	sql += botrank + msg.author.id + ');';
	let result = await p.query(sql);

	//Get emoji
	let bot = autohuntutil.getBot(result[2][0]);

	//Check if still hunting
	let hunting;
	if (result[0][0] && result[0][0].huntmin != 0) {
		hunting = await claim(p, msg, con, result[0][0], bot);
		if (hunting) {
			let text =
				'**' +
				bot +
				' |** `BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN ' +
				hunting.time +
				'`\n**<:blank:427371936482328596> |** `' +
				hunting.percent +
				'% DONE | ' +
				hunting.count +
				' ANIMALS CAPTURED`\n**<:blank:427371936482328596> |** ' +
				hunting.bar;
			text = alterhb(msg.author.id, text, 'progress');
			send(text);
		}
		return;
	}

	// convert duration to cowoncy
	if (length) {
		let efficiency = autohuntutil.getLvl(result[0][0].efficiency, 0, 'efficiency');
		let cost = autohuntutil.getLvl(result[0][0].cost, 0, 'cost');
		cowoncy = Math.floor(efficiency.stat * cost.stat * length);
	}

	//Check if enough cowoncy
	if (!result[1][0] || result[1][0].money < cowoncy) {
		send('**🚫 | ' + p.getName() + "**, You don't have enough cowoncy!", 3000);
		return;
	}

	//Check if password
	//no pw set
	if (
		!result[0][0] ||
		result[0][0].password == undefined ||
		result[0][0].password == '' ||
		result[0][0].pwtime >= 10
	) {
		let rand = '';
		for (let i = 0; i < 5; i++) rand += letters.charAt(Math.floor(Math.random() * letters.length));
		sql =
			'INSERT INTO autohunt (id,start,huntcount,huntmin,password,passwordtime) VALUES (' +
			msg.author.id +
			",NOW(),0,0,'" +
			rand +
			"',NOW()) ON DUPLICATE KEY UPDATE password = '" +
			rand +
			"',passwordtime = NOW();";

		result = await p.query(sql);
		let text =
			'**' +
			bot +
			' | ' +
			p.getName() +
			'**, Select the button that matches the CAPTCHA to start autohunt!';
		text = alterhb(msg.author.id, text, 'password');
		await sendCaptcha(p, rand, text, cowoncy);
		return;
	}
	//pw is set and wrong
	if (result[0][0].password != password) {
		let text = '**🚫 | ' + p.getName() + '**, That CAPTCHA answer was incorrect. Try again.';
		text = alterhb(msg.author.id, text, 'password');
		await sendCaptcha(p, result[0][0].password, text, cowoncy);
		return;
	}

	//Extract info
	let duration, efficiency, cost, gain, exp;
	if (result[0][0]) {
		duration = autohuntutil.getLvl(result[0][0].duration, 0, 'duration');
		efficiency = autohuntutil.getLvl(result[0][0].efficiency, 0, 'efficiency');
		cost = autohuntutil.getLvl(result[0][0].cost, 0, 'cost');
		gain = autohuntutil.getLvl(result[0][0].gain, 0, 'gain');
		exp = autohuntutil.getLvl(result[0][0].exp, 0, 'exp');
	} else {
		duration = autohuntutil.getLvl(0, 0, 'duration');
		efficiency = autohuntutil.getLvl(0, 0, 'efficiency');
		cost = autohuntutil.getLvl(0, 0, 'cost');
		gain = autohuntutil.getLvl(0, 0, 'gain');
		exp = autohuntutil.getLvl(0, 0, 'exp');
	}
	let maxhunt = Math.floor(duration.stat * efficiency.stat);
	let maxgain = Math.floor(gain.stat * duration.stat);
	let maxexp = Math.floor(exp.stat * duration.stat);

	//Format cowoncy
	cowoncy -= cowoncy % cost.stat;
	if (cowoncy > maxhunt * cost.stat) cowoncy = maxhunt * cost.stat;

	let huntcount = Math.trunc(cowoncy / cost.stat);
	let huntmin = Math.ceil((huntcount / efficiency.stat) * 60);
	let tempPercent = huntmin / (duration.stat * 60);
	let huntgain = Math.floor(tempPercent * maxgain);
	let huntexp = Math.floor(tempPercent * maxexp);

	sql = 'UPDATE cowoncy SET money = money - ' + cowoncy + ' WHERE id = ' + msg.author.id + ';';
	sql +=
		'INSERT INTO autohunt (id,start,huntcount,huntmin,password) VALUES (' +
		msg.author.id +
		',NOW(),' +
		huntcount +
		',' +
		huntmin +
		",'') ON DUPLICATE KEY UPDATE start = NOW(), huntcount = " +
		huntcount +
		',huntmin = ' +
		huntmin +
		",password = '';";
	result = await p.query(sql);
	logger.decr('cowoncy', -1 * cowoncy, { type: 'huntbot' }, p.msg);
	let min = huntmin % 60;
	let hour = Math.trunc(huntmin / 60);
	let timer = '';
	if (hour > 0) timer = hour + 'H' + min + 'M';
	else timer = min + 'M';
	let text =
		'**' +
		bot +
		' |** `BEEP BOOP. `**`' +
		p.getName() +
		'`**`, YOU SPENT ' +
		global.toFancyNum(cowoncy) +
		' cowoncy`\n**<:blank:427371936482328596> |** `I WILL BE BACK IN ' +
		timer +
		' WITH ' +
		huntcount +
		' ANIMALS,`\n**<:blank:427371936482328596> |** `' +
		huntgain +
		' ESSENCE, AND ' +
		huntexp +
		' EXPERIENCE`';
	text = alterhb(msg.author.id, text, 'spent');
	send(text);
}

async function display(p, msg, con) {
	let sql =
		'SELECT *,TIMESTAMPDIFF(MINUTE,start,NOW()) AS timer FROM autohunt WHERE id = ' +
		msg.author.id +
		';';
	sql += botrank + msg.author.id + ');';
	let result = await p.query(sql);

	//Get emoji
	let bot = autohuntutil.getBot(result[1][0]);
	let rank = result[1][0]?.rank || autohuntutil.getTotalBots();

	let hunting;
	if (result[0][0] && result[0][0].huntmin != 0) {
		hunting = await claim(p, msg, con, result[0][0], bot);
		if (!hunting) return;
	}
	let duration, efficiency, cost, essence, maxhunt, gain, exp, radar;
	if (result[0][0]) {
		duration = autohuntutil.getLvl(result[0][0].duration, 0, 'duration');
		efficiency = autohuntutil.getLvl(result[0][0].efficiency, 0, 'efficiency');
		cost = autohuntutil.getLvl(result[0][0].cost, 0, 'cost');
		gain = autohuntutil.getLvl(result[0][0].gain, 0, 'gain');
		exp = autohuntutil.getLvl(result[0][0].exp, 0, 'exp');
		radar = autohuntutil.getLvl(result[0][0].radar, 0, 'radar');
		essence = result[0][0].essence;
	} else {
		duration = autohuntutil.getLvl(0, 0, 'duration');
		efficiency = autohuntutil.getLvl(0, 0, 'efficiency');
		cost = autohuntutil.getLvl(0, 0, 'cost');
		gain = autohuntutil.getLvl(0, 0, 'gain');
		exp = autohuntutil.getLvl(0, 0, 'exp');
		radar = autohuntutil.getLvl(0, 0, 'radar');
		essence = 0;
	}

	let traits = [duration, efficiency, cost, gain, exp, radar];
	for (let i = 0; i < traits.length; i++) {
		traits[i].percent = generatePercent(traits[i].currentxp, traits[i].maxxp).bar;
		if (traits[i].max)
			traits[i].value = '`Lvl ' + traits[i].lvl + ' [MAX]`\n' + generatePercent(1, 1).bar;
		else
			traits[i].value =
				'`Lvl ' +
				traits[i].lvl +
				' [' +
				traits[i].currentxp +
				'/' +
				traits[i].maxxp +
				']`\n' +
				traits[i].percent;
	}

	maxhunt = Math.floor(duration.stat * efficiency.stat);
	let embed = {
		color: p.config.embed_color,
		author: {
			name: p.getName() + "'s HuntBot",
			icon_url: msg.author.avatarURL,
		},
		thumbnail: {
			url: p.global.getEmojiURL(bot),
		},
		footer: {
			text: `Rank #${p.global.toFancyNum(rank)} • ${p.getUniqueName(msg.author)}`,
		},
		fields: [
			{
				name: `\`BEEP. BOOP. I AM HUNTBOT. I WILL HUNT FOR YOU MASTER.\``,
				value:
					'Use the buttons below to start autohunt or manage upgrades.\nTo obtain more essence, use `owo sacrifice {animal} {count}`.\n\n',
				inline: false,
			},
			{
				name: '⏱ Efficiency - `' + efficiency.stat + efficiency.prefix + '`',
				value: efficiency.value,
				inline: true,
			},
			{
				name: '⏳ Duration - `' + duration.stat + duration.prefix + '`',
				value: duration.value,
				inline: true,
			},
			{
				name: '<:cowoncy:416043450337853441> Cost - `' + cost.stat + cost.prefix + '`',
				value: cost.value,
				inline: true,
			},
			{
				name: '🔧 Gain - `' + gain.stat + gain.prefix + '`',
				value: gain.value,
				inline: true,
			},
			{
				name: '⚔ Experience - `' + exp.stat + exp.prefix + '`',
				value: exp.value,
				inline: true,
			},
			{
				name: '📡 Radar - `' + radar.stat + radar.prefix + '`',
				value: radar.value,
				inline: true,
			},
			{
				name:
					'<a:essence:451638978299428875> Animal Essence - `' + global.toFancyNum(essence) + '`',
				value:
					'`Current Max Autohunt: ' +
					global.toFancyNum(maxhunt) +
					' animals, ' +
					global.toFancyNum(Math.floor(gain.stat * duration.stat)) +
					' essence, and ' +
					global.toFancyNum(Math.floor(exp.stat * duration.stat)) +
					' xp for ' +
					global.toFancyNum(maxhunt * cost.stat) +
					' cowoncy`',
				inline: false,
			},
		],
	};
	if (hunting) {
		embed.fields.push({
			name: bot + ' HUNTBOT is currently hunting!',
			value:
				'`BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN ' +
				hunting.time +
				'`\n`' +
				hunting.percent +
				'% DONE | ' +
				hunting.count +
				' ANIMALS CAPTURED`\n' +
				hunting.bar,
		});
	}
	embed = alterhb(msg.author.id, embed, 'hb');
	const components = [
		{
			type: 1,
			components: [
				{ type: 2, style: 1, label: 'Start', custom_id: 'hb_start' },
				{ type: 2, style: 2, label: 'Upgrades', custom_id: 'hb_upgrades' },
			],
		},
	];
	const message = await p.send({ embed, components });
	const collector = p.interactionCollector.create(
		message,
		(_component, user) => user.id === msg.author.id,
		{ time: 15 * 60 * 1000 }
	);

	collector.on('collect', async (component, user, ack) => {
		try {
			if (component === 'hb_start') {
				const start = await getStartInfo(p, msg);
				await ack(startPage(start));
			} else if (component === 'hb_upgrades') {
				const current = await p.query(`SELECT * FROM autohunt WHERE id = ${msg.author.id};`);
				const stats = getTraitStats(current[0][0]);
				await ack(upgradesPage(p, msg, stats));
			} else if (component === 'hb_back') {
				collector.stop('back');
				await ack({ content: 'Loading HuntBot status...', components: [] });
				await runCommand(p, 'autohunt', []);
			} else if (component === 'hb_start_max') {
				const start = await getStartInfo(p, msg);
				if (start.max > 0) {
					await ack({ content: 'Opening CAPTCHA...', components: [] });
					await runCommand(p, 'autohunt', [String(start.max)]);
					await message.edit(startPage(start));
				} else await ack({ content: 'You do not have enough cowoncy to start autohunt.' });
				return;
			} else if (component === 'hb_start_other') {
				await numberModal.open(p, ack, user, 'Start autohunt', 'Cowoncy amount', async (amount) => {
					await runCommand(p, 'autohunt', [String(amount)]);
					await message.edit(startPage(await getStartInfo(p, msg)));
				});
			} else if (component === 'hb_upgrade_back') {
				const current = await p.query(`SELECT * FROM autohunt WHERE id = ${msg.author.id};`);
				await ack(upgradesPage(p, msg, getTraitStats(current[0][0])));
			} else if (component.startsWith('hb_trait_')) {
				const trait = component.slice('hb_trait_'.length);
				if (!upgradeTraits.includes(trait)) return ack();
				const current = await p.query(`SELECT * FROM autohunt WHERE id = ${msg.author.id};`);
				const stats = getTraitStats(current[0][0]);
				await ack(traitPage(p, trait, stats[trait]));
			} else if (component.startsWith('hb_level_')) {
				const trait = component.slice('hb_level_'.length);
				if (!upgradeTraits.includes(trait)) return ack();
				await ack({ content: 'Processing upgrade...', components: [] });
				await runCommand(p, 'upgrade', [trait, 'level']);
				const result = await p.query(`SELECT * FROM autohunt WHERE id = ${msg.author.id};`);
				await message.edit(traitPage(p, trait, getTraitStats(result[0][0])[trait]));
			} else if (component.startsWith('hb_other_')) {
				const trait = component.slice('hb_other_'.length);
				if (!upgradeTraits.includes(trait)) return ack();
				await numberModal.open(
					p,
					ack,
					user,
					`Upgrade ${trait}`,
					'Animal essence amount',
					async (amount) => {
						await runCommand(p, 'upgrade', [trait, String(amount)]);
						const result = await p.query(`SELECT * FROM autohunt WHERE id = ${msg.author.id};`);
						await message.edit(traitPage(p, trait, getTraitStats(result[0][0])[trait]));
					}
				);
			} else await ack({ content: 'Unknown HuntBot action.', components: [] });
		} catch (err) {
			console.error('HuntBot panel interaction failed.', err);
			if (!ack.responded)
				await ack({ content: 'This action could not be completed. Please try again later.' });
			else await p.send('This action could not be completed. Please try again later.');
		}
	});
}

async function getStartInfo(p, msg) {
	const result = await p.query(
		`SELECT * FROM autohunt WHERE id = ${msg.author.id}; SELECT money FROM cowoncy WHERE id = ${msg.author.id};`
	);
	const row = result[0][0] || {};
	const duration = autohuntutil.getLvl(row.duration || 0, 0, 'duration');
	const efficiency = autohuntutil.getLvl(row.efficiency || 0, 0, 'efficiency');
	const cost = autohuntutil.getLvl(row.cost || 0, 0, 'cost');
	const capacity = Math.floor(duration.stat * efficiency.stat) * cost.stat;
	const balance = result[1][0]?.money || 0;
	return {
		max: cost.stat > 0 ? Math.floor(Math.min(capacity, balance) / cost.stat) * cost.stat : 0,
	};
}

function getTraitStats(row) {
	const stats = {};
	for (const trait of upgradeTraits) {
		stats[trait] = autohuntutil.getLvl(row?.[trait] || 0, 0, trait);
	}
	return stats;
}

function startPage(start) {
	return {
		embed: {
			color: 0x5865f2,
			title: 'Start autohunt',
			description: `Maximum available amount: **${global.toFancyNum(start.max)} cowoncy**`,
		},
		components: [
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 1,
						label: `Max (${start.max})`,
						custom_id: 'hb_start_max',
						disabled: start.max <= 0,
					},
					{ type: 2, style: 2, label: 'Other', custom_id: 'hb_start_other' },
					{ type: 2, style: 2, label: 'Back', custom_id: 'hb_back' },
				],
			},
		],
	};
}

function upgradesPage(p, msg, stats) {
	const names = {
		efficiency: 'Efficiency',
		duration: 'Duration',
		cost: 'Cost',
		gain: 'Gain',
		exp: 'Experience',
		radar: 'Radar',
	};
	return {
		embed: {
			color: p.config.embed_color,
			title: `${p.getName()}'s HuntBot upgrades`,
			description: upgradeTraits
				.map(
					(trait) =>
						`**${names[trait]}** — Level ${stats[trait].lvl}${stats[trait].max ? ' (MAX)' : ''}`
				)
				.join('\n'),
			footer: { text: p.getUniqueName(msg.author) },
		},
		components: [
			{
				type: 1,
				components: upgradeTraits.slice(0, 5).map((trait) => ({
					type: 2,
					style: 2,
					label: names[trait],
					custom_id: `hb_trait_${trait}`,
				})),
			},
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 2,
						label: names.radar,
						custom_id: 'hb_trait_radar',
					},
					{ type: 2, style: 2, label: 'Back', custom_id: 'hb_back' },
				],
			},
		],
	};
}

function traitPage(p, trait, stat) {
	const nextLevel = stat.max
		? 'Already at maximum level.'
		: `Next level requires ${stat.maxxp - stat.currentxp} essence.`;
	return {
		embed: {
			color: p.config.embed_color,
			title: `${trait[0].toUpperCase()}${trait.slice(1)} upgrade`,
			description: `Current level: **${stat.lvl}${stat.max ? ' (MAX)' : ''}**\n${nextLevel}`,
		},
		components: [
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 1,
						label: 'Next level',
						custom_id: `hb_level_${trait}`,
						disabled: stat.max,
					},
					{ type: 2, style: 2, label: 'Other', custom_id: `hb_other_${trait}` },
					{ type: 2, style: 2, label: 'Back', custom_id: 'hb_upgrade_back' },
				],
			},
		],
	};
}

function runCommand(p, command, args) {
	return p.runCommand
		? p.runCommand(command, args)
		: p.commands[command].execute({ ...p, args, command, commandAlias: command });
}

async function sendCaptcha(p, password, text, cowoncy, existingChoices) {
	let choices = existingChoices;
	if (!choices) {
		choices = [password];
		while (choices.length < 6) {
			let choice = '';
			for (let i = 0; i < 5; i++)
				choice += letters.charAt(Math.floor(Math.random() * letters.length));
			if (!choices.includes(choice)) choices.push(choice);
		}
		for (let i = choices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[choices[i], choices[j]] = [choices[j], choices[i]];
		}
	}

	const buttons = choices.map((choice, index) => ({
		type: 2,
		style: 2,
		label: choice,
		custom_id: `hb_captcha_${index}`,
	}));
	const components = [
		{ type: 1, components: buttons.slice(0, 5) },
		{ type: 1, components: buttons.slice(5) },
	];
	const message = await autohuntutil.captcha(p, password, text, components);
	const collector = p.interactionCollector.create(
		message,
		(_component, user) => user.id === p.msg.author.id,
		{ time: 2 * 60 * 1000 }
	);
	let processing = false;
	collector.on('collect', async (component, _user, ack) => {
		try {
			if (processing) return ack();
			processing = true;
			const selected = Number(component.slice('hb_captcha_'.length));
			if (choices[selected] === password) {
				collector.stop();
				await ack({ content: 'Correct CAPTCHA. Autohunt is starting.', components: [] });
				await runCommand(p, 'autohunt', [String(cowoncy), password]);
				return;
			}

			await ack();
			collector.stop();
			await message.edit({ components: [] });
			await sendCaptcha(
				p,
				password,
				`**🚫 | ${p.getName()}**, That CAPTCHA answer was incorrect. Try again.`,
				cowoncy,
				choices
			);
		} catch (err) {
			console.error('HuntBot CAPTCHA interaction failed.', err);
			await p.send('The CAPTCHA could not be processed. Please try again.');
		}
	});
}

function generatePercent(current, max, length) {
	let percent = current / max;
	let result = '`[';
	if (!length) length = 16;
	for (let i = 0; i < length; i++) {
		if (i < percent * length) result += '■';
		else result += '□';
	}
	percent = Math.trunc(percent * 10000) / 100;
	result += ']`';
	return { bar: result, percent: percent };
}
