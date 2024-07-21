/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

module.exports = new CommandInterface({
	alias: ['owodex', 'od', 'dex', 'd'],

	args: '{animal}',

	desc: 'Use the owodex to get information on a pet!',

	example: ['owodex dog', 'owodex cat'],

	related: ['owo zoo'],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['animals'],

	cooldown: 3000,
	half: 150,
	six: 500,

	execute: async function (p) {
		let global = p.global,
			msg = p.msg,
			args = p.args;

		let animal = args[0] ? global.validAnimal(args[0]) : undefined;

		if (args.length > 1 || args.length == 0) {
			p.errorMsg(', the correct command is `owo dex {animal}`!', 3000);
			return;
		} else if (!animal) {
			p.errorMsg(', I could not find that animal in your zoo!', 3000);
			return;
		}

		let sql = `SELECT * FROM animal WHERE id = ${msg.author.id} AND name = '${animal.value}';`;
		let result = await p.query(sql);
		if (!result[0]) {
			p.errorMsg(', I could not find that animal in your zoo!', 3000);
			return;
		}
		const totalAnimals = await this.cache.getAnimalCount(animal.value, 6 * 60 * 60 * 1000);

		let emoji = animal.uni ? animal.uni : animal.value;
		let temp;
		if ((temp = emoji.match(/:[0-9]+>/))) {
			temp = 'https://cdn.discordapp.com/emojis/' + temp[0].match(/[0-9]+/)[0] + '.';
			if (emoji.match(/<a:/)) temp += 'gif';
			else temp += 'png';
			emoji = temp;
		} else emoji = undefined;

		let rankEmoji = p.animalUtil.getRank(animal.rank).emoji;
		let points = animal.points;
		let sell = '???';
		if (result[0].sellcount > 0)
			sell = animal.price + ' Cowoncy | ' + global.toFancyNum(result[0].sellcount) + ' sold';
		let sac = '???';
		if (result[0].saccount > 0)
			sac = animal.essence + ' Essence | ' + global.toFancyNum(result[0].saccount) + ' killed';
		let alias = 'None';
		if (animal.alt.length > 0) alias = animal.alt.slice(1).join(', ');
		let phys = `<:hp:531620120410456064> \`${animal.hp}\` <:att:531616155450998794> \`${animal.att}\` <:pr:531616156222488606> \`${animal.pr}\` `;
		let mag = `<:wp:531620120976687114> \`${animal.wp}\` <:mag:531616156231139338> \`${animal.mag}\` <:mr:531616156226945024> \`${animal.mr}\` `;
		let rarity = global.toFancyNum(totalAnimals) + ' total caught';
		let nickname = '';
		if (result[0].nickname) nickname = '**Nickname:** ' + result[0].nickname + '\n';
		let desc = "*No description created\nHave a fun/creative description?\nUse 'owo feedback'!*";
		if (animal.description) {
			desc = '*' + animal.description.trim() + '*';
			let ids = desc.match(/\?[0-9]+\?/g);
			for (let i in ids) {
				let descID = ids[i].match(/[0-9]+/);
				let tempUser = await p.fetch.getUser(descID[0]);
				desc = desc
					.replace(
						' ?' + descID + '? \n\n',
						tempUser ? '* ***' + p.getName(tempUser) + '*** \n*' : '* ***A User*** \n\n*'
					)
					.replace(
						' ?' + descID + '?\n\n',
						tempUser ? '* ***' + p.getName(tempUser) + '*** \n*' : '* ***A User*** \n\n*'
					)
					.replace(
						' ?' + descID + '? \n',
						tempUser ? '* ***' + p.getName(tempUser) + '*** \n*' : '* ***A User*** \n*'
					)
					.replace(
						' ?' + descID + '?\n',
						tempUser ? '* ***' + p.getName(tempUser) + '*** \n*' : '* ***A User*** \n*'
					)
					.replace(
						' ?' + descID + '? ',
						tempUser ? '* ***' + p.getName(tempUser) + '*** *' : '* ***A User*** *'
					)
					.replace(
						' ?' + descID + '?*',
						tempUser ? '* ***' + p.getName(tempUser) + '***' : '* ***A User***'
					)
					.replace(
						' ?' + descID + '?,',
						tempUser ? '* ***' + p.getName(tempUser) + '*** *,' : '* ***A User*** *,'
					);
			}
			ids = desc.match(/\?[0-9]+\!/g);
			for (let i in ids) {
				let descID = ids[i].match(/[0-9]+/);
				let tempUser = await p.fetch.getUser(descID[0]);
				const username = tempUser ? p.getUniqueName(tempUser) : 'A User';
				desc = desc
					.replace(' ?' + descID + '! \n\n', '* ***' + username + '*** \n\n*')
					.replace(' ?' + descID + '!\n\n', '* ***' + username + '*** \n\n*')
					.replace(' ?' + descID + '! \n', '* ***' + username + '*** \n*')
					.replace(' ?' + descID + '!\n', '* ***' + username + '*** \n*')
					.replace(' ?' + descID + '! ', '* ***' + username + '*** *')
					.replace(' ?' + descID + '!*', '* ***' + username + '***')
					.replace(' ?' + descID + '!,', '* ***' + username + '*** *,');
			}
		}
		desc = desc.replace(/\n\*\*$/, '');

		let embed = {
			title: (animal.uni ? animal.uni : animal.value) + ' ' + animal.name,
			color: p.config.embed_color,
			thumbnail: {
				url: emoji ? emoji : p.client.user.displayAvatarURL,
			},
			description:
				desc +
				'\n\n' +
				nickname +
				'**Count:** ' +
				result[0].count +
				'/' +
				result[0].totalcount +
				'\n**Rank:** ' +
				rankEmoji +
				' ' +
				animal.rank +
				'\n**Rarity:** ' +
				rarity +
				'\n**Alias:** ' +
				alias +
				'\n**Points:** ' +
				points +
				'\n**Sell:** ' +
				sell +
				'\n**Sacrifice:** ' +
				sac +
				'\n' +
				phys +
				'\n' +
				mag,
		};
		p.send({ embed });
	},
});
