/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const warnEmoji = '⚠️';

module.exports = new CommandInterface({
	alias: ['discordplays', 'twitchplays', 'emulator'],

	args: '',

	desc: '',

	example: [],

	related: [],

	permissions: ['sendMessages', 'embedLinks'],

	group: ['social'],

	cooldown: 10000,

	execute: async function (p) {
		let content =
			`${warnEmoji} **|** This is still a work in progress. The emulator will reset once everything goes live` +
			`\n${p.config.emoji.blank} **|** AGAIN, THIS COMMAND IS STILL A WORK IN PROGRESS!!` +
			`\n${p.config.emoji.blank} **|** https://www.twitch.tv/owobotplays`;
		let components = [
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 1,
						label: 'A',
						custom_id: 'emulator_a',
					},
					{
						type: 2,
						style: 1,
						label: '▲',
						custom_id: 'emulator_up',
					},
					{
						type: 2,
						style: 1,
						label: 'B',
						custom_id: 'emulator_b',
					},
					{
						type: 2,
						style: 1,
						label: 'START',
						custom_id: 'emulator_start',
					},
				],
			},
			{
				type: 1,
				components: [
					{
						type: 2,
						style: 1,
						label: '◄',
						custom_id: 'emulator_left',
					},
					{
						type: 2,
						style: 1,
						label: '▼',
						custom_id: 'emulator_down',
					},
					{
						type: 2,
						style: 1,
						label: '►',
						custom_id: 'emulator_right',
					},
					{
						type: 2,
						style: 1,
						label: 'SELECT',
						custom_id: 'emulator_select',
					},
				],
			},
		];

		await p.send({ content, components });
	},
});
