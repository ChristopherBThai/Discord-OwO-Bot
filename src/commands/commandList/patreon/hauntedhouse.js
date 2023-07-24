/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const data = 'hauntedhouse';
const emoji = '<a:hauntedhouse:1033642053936095332>';

module.exports = new CommandInterface({
	alias: ['hauntedhouse'],

	args: '{@user}',

	desc: 'Combine a ghost, witch, bat, and a spider to create a haunted house. This command was created by ?665648471340220430?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 30000,
	half: 80,
	six: 400,
	bot: true,

	execute: async function (p) {
		if (p.args[0] === 'combine') {
			combine.bind(p)(p);
		} else if (p.args.length == 0) {
			display.bind(p)(p);
			p.setCooldown(5);
		} else {
			let user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
				if (!user) {
					p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
			give(p, user);
		}
	},
});

async function display() {
	let count = await this.redis.hget('data_' + this.msg.author.id, data);
	const displayMsg = ', you have ?count? haunted house?plural?.';
	const msg = displayMsg.replace('?count?', count || 0).replace('?plural?', count > 1 ? 's' : '');
	this.replyMsg(emoji, msg);
}

async function combine(p) {
	let bat = await this.redis.hincrby('data_' + this.msg.author.id, 'bat', -1);
	let witch = await this.redis.hincrby('data_' + this.msg.author.id, 'witch', -1);
	let ghost = await this.redis.hincrby('data_' + this.msg.author.id, 'ghost', -1);
	let spider = await this.redis.hincrby('data_' + this.msg.author.id, 'spider', -1);

	let missing;
	if (bat == null || bat < 0) {
		missing = 'bats';
	}
	if (witch == null || witch < 0) {
		missing = 'witches';
	}
	if (ghost == null || ghost < 0) {
		missing = 'ghosts';
	}
	if (spider == null || spider < 0) {
		missing = 'spiders';
	}

	if (missing) {
		this.redis.hincrby('data_' + this.msg.author.id, 'bat', 1);
		this.redis.hincrby('data_' + this.msg.author.id, 'witch', 1);
		this.redis.hincrby('data_' + this.msg.author.id, 'ghost', 1);
		this.redis.hincrby('data_' + this.msg.author.id, 'spider', 1);
		this.errorMsg(', you do not have any ' + missing + '!');
		this.setCooldown(5);
		return;
	}

	this.redis.hincrby('data_' + this.msg.author.id, data, 1);
	p.send(
		`${emoji} **| ${p.getName()}**, you combined a bat, witch, ghost, and a spider to create a haunted house!`
	);
}

async function give(p, user) {
	let result = await p.redis.hincrby('data_' + p.msg.author.id, data, -1);

	// Error checking
	if (result == null || result < 0) {
		if (result < 0) p.redis.hincrby('data_' + p.msg.author.id, data, 1);
		p.errorMsg(', you do not have any haunted houses to give! >:c', 3000);
		p.setCooldown(5);
		return;
	}

	await p.redis.hincrby('data_' + user.id, data, 1);
	p.send(`${emoji} **| ${p.getName(user)}**, **${p.getName()}** gave you 1 haunted house!`);
}
