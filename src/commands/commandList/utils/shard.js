/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const request = require('request');
const maxDiff = 30000;
const perPage = 20;
const nextPageEmoji = '➡️';
const prevPageEmoji = '⬅️';

module.exports = new CommandInterface({
	alias: ['shards', 'shard'],

	args: 'View all the shards!',

	desc: '',

	example: [''],

	related: [''],

	permissions: ['sendMessages', 'embedLinks', 'attachFiles', 'addReactions'],

	group: ['utility'],

	cooldown: 15000,
	half: 80,
	six: 500,

	execute: async function (p) {
		let shardID = p.client.guildShardMap[p.msg.channel.guild.id];

		let shardInfo = await fetchInfo(p);
		let shards = [];
		// char size: 5 4 13 4 6 8 5
		for (let i in shardInfo) {
			let shard = shardInfo[i];

			if (i == shardID) {
				let tempShard = p.client.shards.get(shardID);
				shard.status = tempShard.status;
				shard.ping = tempShard.latency;
				shard.start = p.client.uptime;
			}

			let id, cluster, ping, uptime, shardStatus, offline;

			if (shard) {
				id = '[' + shard.shard + ']';
				cluster = '' + shard.cluster;
				ping = Math.round(shard.ping) + '';
				uptime = toTime(shard.start);
				shardStatus = shard.status;
			} else {
				id = i;
				cluster = '?';
				ping = '?';
				uptime = '?';
				shardStatus = 'OFFLINE';
				offline = true;
			}

			uptime += ' '.repeat(13 - uptime.length < 0 ? 0 : 13 - uptime.length);
			ping += ' '.repeat(4 - ping.length < 0 ? 0 : 4 - ping.length);
			id += ' '.repeat(5 - id.length < 0 ? 0 : 5 - id.length);
			cluster += ' '.repeat(7 - cluster.length < 0 ? 0 : 7 - cluster.length);
			let text = `${id} ${cluster} ${ping} ${uptime} ${shardStatus}`;
			if (i == shardID) text = text.replace(/\s/gi, '-');
			else {
				let diff = new Date() - new Date(shard?.updatedOn);
				if (diff > maxDiff || offline) text = `${id} ${cluster} OFFLINE OR LAGGING`;
			}
			shards.push(text);
		}

		let currentPage = Math.floor(shardID / perPage);
		let page = getPage(p, currentPage, shards, shardID);
		let maxPage = Math.ceil(shards.length / perPage);

		let msg = await p.send(page);
		await msg.addReaction(prevPageEmoji);
		await msg.addReaction(nextPageEmoji);

		let filter = (emoji, userID) =>
			[nextPageEmoji, prevPageEmoji].includes(emoji.name) && p.msg.author.id == userID;
		let collector = p.reactionCollector.create(msg, filter, {
			time: 900000,
			idle: 120000,
		});

		collector.on('collect', async function (emoji) {
			if (emoji.name === nextPageEmoji) {
				if (currentPage + 1 < maxPage) currentPage++;
				else currentPage = 0;
				page = getPage(p, currentPage, shards, shardID);
				await msg.edit(page);
			} else if (emoji.name === prevPageEmoji) {
				if (currentPage > 0) currentPage--;
				else currentPage = maxPage - 1;
				page = getPage(p, currentPage, shards, shardID);
				await msg.edit(page);
			}
		});
		collector.on('end', async function (_collected) {
			page.embed.color = 6381923;
			await msg.edit({
				content: 'This message is now inactive',
				embed: page.embed,
			});
		});
	},
});

function getPage(p, currentPage, shards, _shardID) {
	let desc = '```\n[ID]  cluster ping uptime        status\n';
	for (let i = currentPage * perPage; i < perPage + currentPage * perPage; i++) {
		if (shards[i]) desc += shards[i] + '\n';
	}
	desc += '```';
	let embed = {
		author: {
			name: p.msg.author.username + ", here are the bot's shards!",
			icon_url: p.msg.author.avatarURL,
		},
		description: desc,
		color: p.config.embed_color,
		footer: {
			text: 'Page ' + (currentPage + 1) + '/' + Math.ceil(shards.length / perPage),
		},
	};

	return { embed };
}

async function fetchInfo(p) {
	p.pubsub.publish('updateShardInfo');

	return new Promise((resolve, reject) => {
		setTimeout(function () {
			request(
				{
					method: 'GET',
					uri: process.env.SHARDER_HOST + '/shard-status',
				},
				(error, res, body) => {
					if (error) {
						reject();
						return;
					}
					if (res.statusCode == 200) resolve(JSON.parse(body));
					else reject();
				}
			);
		}, 500);
	});
}

function toTime(ms) {
	let result = '';
	ms = Math.floor(ms / 1000);
	var sec = ms % 60;
	if (ms >= 1) result = sec + 's';

	ms = Math.floor(ms / 60);
	var min = ms % 60;
	if (ms >= 1) result = min + 'm' + result;

	ms = Math.floor(ms / 60);
	var hour = ms % 24;
	if (ms >= 1) result = hour + 'h' + result;

	ms = Math.floor(ms / 24);
	let day = ms;
	if (ms >= 1) result = day + 'd' + result;

	return result;
}
