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
const botrank =
	'SELECT (COUNT(*)) AS rank, (SELECT COUNT(*) FROM autohunt) AS total FROM autohunt WHERE autohunt.total >= (SELECT autohunt.total FROM autohunt WHERE id = ';
const logger = require('../../../utils/logger.js');
const parse = require('parse-duration');

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

	let sql = `SELECT
		IF(
			patreonAnimal = 1
			OR (TIMESTAMPDIFF(MONTH, patreonTimer, NOW()) < patreonMonths)
			OR (endDate > NOW())
		,1,0) as patreon
		FROM user
			LEFT JOIN patreons ON user.uid = patreons.uid
			LEFT JOIN patreon_wh ON user.uid = patreon_wh.uid
		WHERE user.id = ${msg.author.id};`;
	sql +=
		'UPDATE autohunt SET huntmin = 0,huntcount=0,essence = essence +' +
		totalGain +
		',total = total + ' +
		totalGain +
		' WHERE id = ' +
		msg.author.id +
		' AND huntmin > 0;';
	let result = await p.query(sql);

	if (result[1].changedRows <= 0) {
		return;
	}

	//Check if patreon
	let patreon = false;
	if (result[0][0] && result[0][0].patreon == 1) patreon = true;

	sql = '';
	//Get total exp
	let totalExp = Math.floor(autohuntutil.getLvl(query.exp, 0, 'exp').stat * duration);
	sql += `UPDATE IGNORE user 
			INNER JOIN pet_team ON user.uid = pet_team.uid
			INNER JOIN pet_team_animal ON pet_team.pgid = pet_team_animal.pgid
			INNER JOIN animal ON pet_team_animal.pid = animal.pid
			LEFT JOIN (SELECT pt2.pgid FROM user u2
					INNER JOIN pet_team pt2 ON pt2.uid = u2.uid
					LEFT JOIN pet_team_active pt_act ON pt2.pgid = pt_act.pgid
					WHERE u2.id = ${msg.author.id}
					ORDER BY pt_act.pgid DESC, pt2.pgid ASC LIMIT 1) tmp
				ON tmp.pgid = pet_team.pgid
		SET animal.xp = animal.xp + (CASE WHEN tmp.pgid IS NULL THEN ${Math.round(
			totalExp / 2
		)} ELSE ${totalExp} END)
		WHERE  user.id = ${msg.author.id};`;

	//Get all animal
	let total = {};
	let digits = 1;
	let radar = autohuntutil.getLvl(query.radar, 0, 'radar');
	for (let i = 0; i < query.huntcount; i++) {
		let animal = animalUtil.randAnimal({
			patreon: patreon,
			huntbot: radar.stat / 100,
		});
		if (total[animal[1]]) {
			total[animal[1]].count++;
			if (total[animal[1]].count > digits) digits = total[animal[1]].count;
		} else {
			total[animal[1]] = { count: 1, rank: animal[2] };
		}
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
	for (let animal in total) {
		let animalString = animal + animalUtil.toSmallNum(total[animal].count, digits) + '  ';
		let animalLoc = p.animals.order.indexOf(total[animal].rank);
		if (animalLoc || animalLoc === 0) {
			if (!tempText[animalLoc])
				tempText[animalLoc] = ' \n' + p.animals.ranks[p.animals.order[animalLoc]] + ' **|**';
			tempText[animalLoc] += ' ' + animalString;
		}
		sql +=
			'INSERT INTO animal (id,name,count,totalcount) VALUES (' +
			msg.author.id +
			",'" +
			animal +
			"'," +
			total[animal].count +
			',' +
			total[animal].count +
			') ON DUPLICATE KEY UPDATE count = count + ' +
			total[animal].count +
			',totalcount = totalcount + ' +
			total[animal].count +
			';';
		sql +=
			'INSERT INTO animal_count (id,' +
			total[animal].rank +
			') VALUES (' +
			msg.author.id +
			',' +
			total[animal].count +
			') ON DUPLICATE KEY UPDATE ' +
			total[animal].rank +
			' = ' +
			total[animal].rank +
			'+' +
			total[animal].count +
			';';
	}

	for (let i = 0; i < tempText.length; i++) if (tempText[i]) text += tempText[i];

	result = await p.query(sql);
	text = alterhb(msg.author.id, text, 'returned');
	p.send(text);
	for (let animal in total) {
		let tempAnimal = global.validAnimal(animal);
		logger.incr(
			'animal',
			total[animal].count,
			{ rank: tempAnimal.rank, name: tempAnimal.name },
			p.msg
		);
		logger.incr('zoo', tempAnimal.points * total[animal].count, {}, p.msg);
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
		send('**🚫 | ' + msg.author.username + '**, Wrong syntax!', 3000);
		return;
	}

	if (cowoncy <= 0 && !length) {
		send('**🚫 | ' + msg.author.username + '**, Invalid cowoncy amount!', 3000);
		return;
	}

	if (length != null && length <= 0) {
		send('**🚫 | ' + msg.author.username + '**, Invalid duration!', 3000);
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
		send('**🚫 | ' + msg.author.username + "**, You don't have enough cowoncy!", 3000);
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
			msg.author.username +
			'**, Here is your password!\n**<:blank:427371936482328596> |** Use the command `owo autohunt ' +
			cowoncy +
			' {password}`';
		text = alterhb(msg.author.id, text, 'password');
		autohuntutil.captcha(p, rand, text);
		return;
	}
	//pw is set and wrong
	if (result[0][0].password != password) {
		if (!password)
			send(
				'**🚫 | ' +
					msg.author.username +
					'**, Please include your password! The command is `owo autohunt ' +
					cowoncy +
					' {password}`!\n**<:blank:427371936482328596> |** Password will reset in ' +
					(10 - result[0][0].pwtime) +
					' minutes'
			);
		else
			send(
				'**🚫 | ' +
					msg.author.username +
					'**, Wrong password! The command is `owo autohunt ' +
					cowoncy +
					' {password}`!\n**<:blank:427371936482328596> |** Password will reset in ' +
					(10 - result[0][0].pwtime) +
					' minutes'
			);
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
		msg.author.username +
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
			name: msg.author.username + "'s HuntBot",
			icon_url: msg.author.avatarURL,
		},
		fields: [
			{
				name: bot + ' `BEEP. BOOP. I AM HUNTBOT. I WILL HUNT FOR YOU MASTER.`',
				value:
					'Use the command `owo autohunt {cowoncy}` to get started.\nYou can use `owo upgrade {trait} {count}` to upgrade the traits below.\nTo obtain more essence, use `owo sacrifice {animal} {count}`.\n\n',
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
	p.send({ embed });
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
