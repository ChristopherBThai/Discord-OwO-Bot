/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const owners = ['692146302284202134', '412812867348463636'];
const data = 'planet';
const planets = [
	{
		emoji: '<:uranus:1031470784566272051>',
		name: 'Uranus',
		data: 'uranus',
	},
	{
		emoji: '<:venus:1031470785543536731>',
		name: 'Venus',
		data: 'venus',
	},
	{
		emoji: '<a:saturn:1031470772927090758>',
		name: 'Saturn',
		data: 'saturn',
	},
	{
		emoji: '<a:jupiter:1031470773883375636>',
		name: 'Jupiter',
		data: 'jupiter',
	},
	{
		emoji: '<a:earth:1031470775372369961>',
		name: 'Earth',
		data: 'earth',
	},
	{
		emoji: '<a:neptune:1031470769907191838>',
		name: 'Neptune',
		data: 'neptune',
	},
	{
		emoji: '<:mercury:1031470770922192896>',
		name: 'Mercury',
		data: 'mercury',
	},
	{
		emoji: '<:mars:1031470771924647946>',
		name: 'Mars',
		data: 'mars',
	},
	{
		emoji: '<:p2203:1031470783391858719>',
		name: 'P-2203',
		data: 'p',
	},
];
const garbages = [
	{
		emoji: '<a:star:1031470786227208223>',
		name: 'vinii star',
		data: 'star',
		text: 'nothing...! so, you can have this vinii star <a:star:1031470786227208223> instead!',
	},
	{
		emoji: '<:rock:1031470776404148224>',
		name: 'space rock',
		data: 'rock',
		text: '<:rock:1031470776404148224> a space rock!',
	},
];

module.exports = new CommandInterface({
	alias: ['planet'],

	args: '{@user}',

	desc: 'Explore the galaxy and find all 9 planets, unless you get unlucky and collect some space rocks instead.. or a secret companion to keep you company on your space ship!\n\nThis collectible can only be given out by ?692146302284202134? & ?412812867348463636?',

	example: [],

	related: [],

	permissions: ['sendMessages'],

	group: ['patreon'],

	cooldown: 10000,

	execute: async function (p) {
		if (p.args.length == 0) {
			display(p);
			p.setCooldown(5);
		} else {
			if (['reset'].includes(p.args[0].toLowerCase())) {
				if (owners.includes(p.msg.author.id)) {
					reset.bind(this)();
				} else {
					await p.errorMsg(', only the owner of this command can use this!', 3000);
				}
				return;
			}
			let user = p.getMention(p.args[0]);
			if (!user) {
				user = await p.fetch.getMember(p.msg.channel.guild, p.args[0]);
				if (!user) {
					p.errorMsg(', Invalid syntax! Please tag a user!', 3000);
					p.setCooldown(5);
					return;
				}
			}
			if (!owners.includes(p.msg.author.id)) {
				p.errorMsg(', only the owner of this command can give items!', 3000);
				p.setCooldown(5);
				return;
			}
			give(p, user);
		}
	},
});

async function display(p) {
	let items = await p.redis.hget('data_' + p.msg.author.id, data);
	items = JSON.parse(items) || {};
	let text = `<:title1:1031470768820863076> <:title2:1031470777704402954> <:title3:1031470787712008192> **${p.msg.author.username} galaxy!** <:title3:1031470787712008192> <:title2:1031470777704402954> <:title1:1031470768820863076>\n`;
	text +=
		'<:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366><:bar:1031470778941710366>\n';
	let biggest = 1;
	for (let i in items) {
		if (items[i] > biggest) biggest = items[i];
	}
	const digits = Math.trunc(Math.log10(biggest) + 1);
	for (let i = 0; i < planets.length + garbages.length; i++) {
		let count = 0;
		let emoji = '<:question:1031474770035871784>';
		if (i < planets.length) {
			if (items[planets[i].data]) {
				emoji = planets[i].emoji;
				count = items[planets[i].data];
			}
		} else {
			if (items[garbages[i - planets.length].data]) {
				emoji = garbages[i - planets.length].emoji;
				count = items[garbages[i - planets.length].data];
			}
		}
		text += emoji + p.global.toSmallNum(count, digits) + ' ';
		if ((i + 1) % 5 == 0) text += '\n';
	}
	p.send(text);
}

async function give(p, user) {
	let text;
	let items = await p.redis.hget('data_' + user.id, data);
	try {
		items = JSON.parse(items) || {};
	} catch (err) {
		console.error(err);
		items = {};
	}
	if (Math.random() < 0.3) {
		const planet = planets[Math.floor(planets.length * Math.random())];
		text = `<a:ufo1:1031470781022089216> **|** **${user.username}**! you have received something from exploring space..\n<a:box:1031470781949022238> **|** and it is.. `;
		text += `${planet.emoji} **${planet.name}**`;
		if (!items[planet.data]) items[planet.data] = 0;
		items[planet.data]++;
	} else {
		const garbage = garbages[Math.floor(garbages.length * Math.random())];
		text = `<a:ufo2:1031470779717668885> **| ${user.username}**! you have received something from exploring space..\n<a:box:1031470781949022238> **|** you found: `;
		text += garbage.text;
		if (!items[garbage.data]) items[garbage.data] = 0;
		items[garbage.data]++;
	}
	await p.redis.hset('data_' + user.id, data, JSON.stringify(items));
	p.send(text);
}

async function reset() {
	this.setCooldown(5);
	let user = this.getMention(this.args[1]);
	if (!user) {
		user = await this.fetch.getMember(this.msg.channel.guild, this.args[1]);
		if (!user) {
			this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
			return;
		}
	}

	await this.redis.hset('data_' + user.id, data, '{}');
	await this.send(
		`⚙️ **| ${this.msg.author.username}**, I have reset the numbers for **${user.username}**`
	);
}
