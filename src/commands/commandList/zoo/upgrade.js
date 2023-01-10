/*
 * OwO Bot for Discord
 * Copyright (C) 2021 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const alterUpgrade = require('../patreon/alterUpgrade.js');
const autohuntUtil = require('./autohuntutil.js');
const essence = '<a:essence:451638978299428875>';
const traits = {};
const efficiency = ['efficiency', 'timer', 'cd', 'cooldown'];
for (let i = 0; i < efficiency.length; i++) traits[efficiency[i]] = 'efficiency';
const cost = ['cost', 'price', 'cowoncy'];
for (let i = 0; i < cost.length; i++) traits[cost[i]] = 'cost';
const duration = ['duration', 'totaltime', 'time'];
for (let i = 0; i < duration.length; i++) traits[duration[i]] = 'duration';
const gain = ['gain', 'essence', 'ess'];
for (let i = 0; i < gain.length; i++) traits[gain[i]] = 'gain';
const exp = ['exp', 'experience', 'pet', 'xp'];
for (let i = 0; i < exp.length; i++) traits[exp[i]] = 'exp';
const radar = ['radar'];
for (let i = 0; i < radar.length; i++) traits[radar[i]] = 'radar';

module.exports = new CommandInterface({
	alias: ['upgrade', 'upg'],

	args: '{trait} {count}',

	desc: 'Use animal essence to upgrade autohunt!\nYou can specify an amount, upgrade to the next level, or use all your essence.',

	example: ['owo upgrade efficiency 200', 'owo upgrade cost level', 'owo upgrade duration all'],

	related: ['owo autohunt', 'owo sacrifice'],

	permissions: ['sendMessages'],

	group: ['animals'],

	cooldown: 1000,
	half: 120,
	six: 500,
	bot: true,

	execute: async function (p) {
		let { global, msg, args } = p;
		let count, trait, all, lvl;

		//if arg0 is an int
		if (global.isInt(p.args[0])) {
			if (args[1]) {
				trait = traits[args[1].toLowerCase()];
			}
			count = parseInt(args[0]);

			//if arg1 is an int
		} else if (global.isInt(args[1])) {
			if (args[0]) {
				trait = traits[args[0].toLowerCase()];
			}
			count = parseInt(args[1]);

			// owo upg duration all
		} else if (args[1] && 'all' == args[1].toLowerCase()) {
			if (args[0]) {
				trait = traits[args[0].toLowerCase()];
			}
			all = true;

			// owo upg duration lvl
		} else if ((args[1] && 'lvl' == args[1].toLowerCase()) || 'level' == args[1].toLowerCase()) {
			if (args[0]) {
				trait = traits[args[0].toLowerCase()];
			}
			lvl = true;
		} else {
			p.errorMsg(', Please include how many animal essence to use!', 3000);
			return;
		}

		//Check if valid args
		if (!trait) {
			p.errorMsg(
				', I could not find that autohunt trait!\n**<:blank:427371936482328596> |** You can choose from: `efficiency`, `duration`, `cost`, `gain`,`exp`, or `radar`'
			);
			return;
		}
		if (!(all || lvl) && (!count || count <= 0)) {
			p.errorMsg(', You need to use more than 1 animal essence silly~', 3000);
			return;
		}

		const con = await p.startTransaction();
		let result;
		let sql = `SELECT * FROM autohunt WHERE id = ${msg.author.id};`;

		try {
			if (lvl) {
				// get current xp
				result = await con.query(sql);
				// determine xp needed for level
				let stat = autohuntUtil.getLvl(result[0][trait], 0, trait);
				if (stat.max) {
					count = 0;
					p.errorMsg(', this trait is already maxed out!', 3000);
					con.rollback();
					return;
				} else {
					count = stat.maxxp - stat.currentxp;
				}

				sql += `UPDATE autohunt SET essence = essence - ${count}, ${trait} = ${trait} + ${count} WHERE id = ${msg.author.id} AND essence >= ${count};`;
			} else if (all) {
				// dump all essence into the given trait
				sql += `UPDATE autohunt SET ${trait} = ${trait} + essence, essence = 0 WHERE id = ${msg.author.id};`;
			} else {
				// default logic
				sql += `UPDATE autohunt SET essence = essence - ${count}, ${trait} = ${trait} + ${count} WHERE id = ${msg.author.id} AND essence >= ${count};`;
			}

			result = await con.query(sql);
			await con.commit();
		} catch (err) {
			con.rollback();
			console.error(err);
			p.errorMsg(', there was an error upgrading! Please try again later.', 3000);
			return;
		}

		if (!result[0][0] || result[1].affectedRows == 0) {
			p.errorMsg(', You do not have enough animal essence!', 3000);
			return;
		}
		if (all) {
			count = result[0][0]['essence'];
		}

		let stat = autohuntUtil.getLvl(result[0][0][trait], count, trait);
		/* Refund overflowing mana */
		if (stat.max) {
			sql = `UPDATE autohunt SET essence = essence + ${stat.currentxp}, ${trait} = ${trait} - ${stat.currentxp} WHERE id = ${msg.author.id};`;
			await p.query(sql);
		}

		let text = `**🛠 | ${
			msg.author.username
		}**, You successfully upgraded \`${trait}\` with  **${p.global.toFancyNum(
			count
		)} Animal Essence** ${essence}!`;
		text += `\n**<:blank:427371936482328596> |** \`${trait}: ${stat.stat + stat.prefix} -  Lvl ${
			stat.lvl
		} ${stat.max ? '[MAX]' : `[${stat.currentxp}/${stat.maxxp}]`}\``;
		if (stat.max) {
			text += '\n**<:blank:427371936482328596> |** HuntBot is at max level!';
		} else if (stat.lvlup) {
			text += '\n**<:blank:427371936482328596> |** HuntBot Leveled Up!! 🎉';
		}
		text = alterUpgrade.alter(p.msg.author.id, text);
		p.send(text);
	},
});
