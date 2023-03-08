/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const config = require('./../../../data/config.json');
const embed = {
	content: 'This is an automated message. All responses should go to <@184587051943985152>.',
	embed: {
		color: config.embed_color,
		timestamp: new Date(),
		author: {
			name: 'Thank you for the Patreon donation!',
			icon_url:
				'https://cdn.discordapp.com/avatars/408785106942164992/7f7a07bfad0ad6a2faaaccd9421e5392.png?size=1024',
		},
		title: 'To redeem your pet, please DM **Scuttler#0001** with the info below!',
		description: 'I will need these information below!\n```\n',
	},
};
embed.embed.description +=
	'Pet Name:  The name of your pet! Duplicate pet names are not\n           allowed and must be only latin characters! Special\n           characters and spaces are not allowed.\n';
embed.embed.description +=
	'Pet Image: The image can be any size! Keep in mind that there\n           will be a patreon logo on the top left of the\n           image.\n';
embed.embed.description +=
	'Pet Desc:  You can add a custom description of your pet. This\n           is optional.\n';
embed.embed.description +=
	'Pet Stats: You can distribute 20 points across\n           hp/str/pr/wp/mag/mr. All stats must be at least 1\n           point.\n```\n';
embed.embed.description += '**Here are a few rules**\n';
embed.embed.description += ' - The pet must be appropriate for all ages.\n';
embed.embed.description +=
	' - The pet cannot be a real life image and must contain at least a face.\n';
embed.embed.description +=
	' - You can change the stats of the pet if you request it within 1 week of pet creation.\n';
embed.embed.description += ' - Once the pet is created, there is no refund.\n';
embed.embed.description += '\nIf you have any questions, please feel free to ask!\n';
embed.embed.description +=
	'\n⚠️**__DO NOT REPLY TO THIS DM. ALL MESSAGES SHOULD GO TO <@184587051943985152>__**⚠️';

const embedString = JSON.stringify(embed);

module.exports = new CommandInterface({
	alias: ['custompet'],

	owner: true,

	execute: async function (p) {
		await msgUsers(p);
	},
});

async function msgUsers(p) {
	let success = '**Success**\n';
	let failed = '**Failed**\n';
	let lines = p.args.join(' ').split(/\n+/gi);
	for (let line of lines) {
		const args = line
			.replace(/[^ \d]/gi, ' ')
			.trim()
			.split(/\s+/gi);
		try {
			let result = await msgUser(p, args[0]);
			if (result) {
				success += `\`${result.user.username}#${result.user.discriminator}\`\n`;
			} else {
				failed += `\`failed for [${args.join(', ')}]\`\n`;
			}
		} catch (err) {
			console.error(err);
			failed += `failed for [${args.join(', ')}]\n`;
		}
	}

	p.send(success + failed);
}

async function msgUser(p, id) {
	//Parse id
	if (!p.global.isUser(id) && !p.global.isUser('<@' + id + '>')) {
		p.errorMsg(', Invalid user id: ' + id, 3000);
		return;
	}

	// Send msgs
	let user;
	user = await p.sender.msgUser(id, JSON.parse(embedString));
	console.log(user);

	if (user && !user.dmError) return { user };
	else await p.errorMsg(', Failed to message user for ' + id, 3000);
}
