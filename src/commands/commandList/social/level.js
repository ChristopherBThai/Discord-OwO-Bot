/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const levelRewards = require('../../../utils/levelRewards.js');
const levelUtil = require('./util/levelUtil.js');
const settingEmoji = '⚙';

module.exports = new CommandInterface({
	alias: ['level', 'lvl', 'levels', 'xp'],

	args: '[server|disabletext|enabletext]',

	desc: "Display your Level! Increase your level by talking on Discord!\nYou can gain a maximum of 3000xp per day with a bonus of 500 for the first message of the day! SPAMMING MESSAGES WILL NOT COUNT.\nYou will get rewards for leveling up. If you missed a level up reward, you can type this command to claim it. You can disable level up messages for the guild by using 'owo level disabletext'.",

	example: ['owo level', 'owo level server', 'owo level disabletext'],

	related: [],

	permissions: ['sendMessages', 'attachFiles'],

	group: ['social'],

	cooldown: 15000,
	half: 100,
	six: 500,

	execute: async function (p) {
		let perms = p.msg.member.permissions;
		if (p.args.length >= 1 && ['disable', 'disabletext', 'dt'].includes(p.args[0].toLowerCase())) {
			if (perms.has('manageChannels')) {
				let sql = `INSERT INTO guild_setting (id,levelup) VALUES (${p.msg.channel.guild.id},1) ON DUPLICATE KEY UPDATE levelup = 1;`;
				await p.query(sql);
				await p.replyMsg(
					settingEmoji,
					', level up messages will **not** be displayed in this guild.'
				);
			} else {
				p.errorMsg(', you do not have the `MANAGE_CHANNELS` permission!', 3000);
				return;
			}
		} else if (
			p.args.length >= 1 &&
			['enable', 'enabletext', 'et'].includes(p.args[0].toLowerCase())
		) {
			if (perms.has('manageChannels')) {
				let sql = `UPDATE guild_setting SET levelup = 0 WHERE id = ${p.msg.channel.guild.id};`;
				await p.query(sql);
				await p.replyMsg(settingEmoji, ', level up messages will be displayed in this guild.');
			} else {
				p.errorMsg(', you do not have the `MANAGE_CHANNELS` permission!', 3000);
				return;
			}
		} else {
			//try{
			let opt = {};
			if (p.args[0] == 's' || p.args[0] == 'server' || p.args[0] == 'g' || p.args[0] == 'guild') {
				opt.guild = true;
			}
			let uuid = await levelUtil.display(p, p.msg.author, opt);

			if (!uuid) {
				p.errorMsg(', I could not generate the image...', 3000);
				return;
			}

			let url = `${process.env.GEN_HOST}/level/${uuid}.png`;
			let data = await p.DataResolver.urlToBuffer(url);
			await p.send('', null, { file: data, name: 'level.png' });
			if (!opt.guild) await levelRewards.distributeRewards(p.msg);
			/*
			}catch(e){
				console.error(e);
				p.errorMsg(", failed to create level image... Try again later :(",3000);
			}
			*/
		}
	},
});
