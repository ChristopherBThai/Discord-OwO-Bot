/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Lxv extends Collectible {
	constructor() {
		super();

		this.key = 'lxv';
		this.emoji = '<:822377757958340640:1055044682423484416>';
		this.owners = ['412812867348463636'];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 2;
		this.description =
			'Make sure to give Hedge some love, and he might bring you a gift!\nOnly given out in lovesick. A server for OwO, anigame and ERPG grinders! .gg/lxv';
		this.displayMsg =
			"<:846997443278274610:1055044684382208010> **| ?user?**, you currently have ?count? ?emoji? lxv. Don't forget to take care of them!\n<:1039236830022868992:1055044688979185664> **|** Hedge has collected ?mergeCount? **lovesick** for you!";
		this.brokeMsg = ', you do not have any Lxv! >:c';
		this.giveMsg =
			"<:822030768981016577:1055044681429422080> **| ?receiver?**, you were walking around and **?giver?** surprised you with 2 lxv!\n?blank? **|** Remember to take care of them! or they'll run away <:821431807425642567:1055044680162742283>";

		this.hasManualMerge = true;
		this.manualMergeCommands = ['pet'];
		this.mergeNeeded = 0;
		this.mergeEmoji = '<:822377757958340640:1055044682423484416>';
		this.mergeMsg =
			'?emoji? **|** ?user? pats Hedge. In excitement both of them dig around..\n<:1039236830022868992:1055044688979185664> **|** and they found 1 **lovesick**! ';
		this.manualMergeData = 'lovesick';

		this.init();
	}

	async getDisplayMsg(p, args, msgOverride) {
		let reset = await p.redis.hget(
			`data_${p.msg.author.id}`,
			`${this.data}_reset`
		);
		let afterMid = p.dateUtil.afterMidnight(reset);
		let msg =
			'<:847033688302551061:1055044687527948298> **| ?user?**, you currently have ?count? ?emoji? lxv. You have taken care of it for today!\n<:1039236830022868992:1055044688979185664> **|** Hedge has collected ?mergeCount? **lovesick** for you!';
		if (afterMid.after) {
			if (afterMid.withinDay) {
				msg =
					"<:846997443278274610:1055044684382208010> **| ?user?**, you currently have ?count? ?emoji? lxv. Don't forget to take care of them!\n<:1039236830022868992:1055044688979185664> **|** Hedge has collected ?mergeCount? **lovesick** for you!";
			} else {
				msg =
					"<:846997478246318080:1055044685153972225> **| ?user?**, you currently have ?count? ?emoji? lxv. One of them ran away because you didn't take care of it...\n<:1039236830022868992:1055044688979185664> **|** Hedge has collected ?mergeCount? **lovesick** for you!";
				await p.redis.hset(
					`data_${p.msg.author.id}`,
					`${this.data}_reset`,
					afterMid.now
				);
				const result = await p.redis.hincrby(
					`data_${p.msg.author.id}`,
					this.manualMergeData,
					-1
				);
				args.mergeCount -= 1;
				if (result < 0) {
					await p.redis.hset(
						`data_${p.msg.author.id}`,
						this.manualMergeData,
						0
					);
					args.mergeCount = 0;
				}
			}
		}
		return super.getDisplayMsg(p, args, msg);
	}

	async manualMerge(p) {
		const { redis, msg, config } = p;
		let reset = await redis.hget(`data_${msg.author.id}`, `${this.data}_reset`);
		let afterMid = p.dateUtil.afterMidnight(reset);
		if (!afterMid.after) {
			p.errorMsg(', Please come back tomorrow! Hedge is asleep.');
			return;
		}
		await redis.hset(
			`data_${msg.author.id}`,
			`${this.data}_reset`,
			afterMid.now
		);
		if (Math.random() < 0.3) {
			super.manualMerge(p);
		} else {
			p.send(
				`${this.emoji} **| ${p.msg.author.username}** pats the hedge. But it seems to have made them mad...` +
					'\n<:826054135518199818:1055044683396562984> **|** They are very angry now. Mind your fingers!'
			);
		}
	}
}

module.exports = new Lxv();
