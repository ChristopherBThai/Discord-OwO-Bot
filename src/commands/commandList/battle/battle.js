/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');

const battleFriendUtil = require('./util/battleFriendUtil.js');
const BattleEvent = require('./util/BattleEvent.js');

module.exports = new CommandInterface({
	alias: ['battle', 'b', 'fight'],

	args: '',

	desc: '',

	example: [''],

	related: ['owo zoo', 'owo pet', 'owo team', 'owo weapon'],

	permissions: ['sendMessages', 'embedLinks', 'addReactions'],

	group: ['animals'],

	cooldown: 15000,
	half: 80,
	six: 500,
	bot: true,

	execute: async function () {
		/* If its a friendly battle... */
		if (await isFriendlyBattle.bind(this)()) {
			return;
		}

		const battleEvent = new BattleEvent(this);
		await battleEvent.init();
		battleEvent.simulateBattle();
		await battleEvent.distributeRewards();
		await battleEvent.displayBattles();
	},
});

async function isFriendlyBattle() {
	if (this.global.isUser(this.args[0])) {
		let id = this.args[0].match(/[0-9]+/)[0];
		let opponent = this.msg.mentions[0];
		if (!opponent) {
			this.errorMsg(', That is not a valid id!');
			return true;
		}
		if (!id) {
			await this.errorMsg(', The correct command is `owo battle @user`!', 3000);
		} else if (id == this.msg.author.id) {
			battleFriendUtil.challenge(this, this.msg.author);
		} else {
			battleFriendUtil.challenge(this, opponent, 0);
		}
		return true;
	} else if (this.options.user) {
		if (this.options.user.id == this.msg.author.id) {
			battleFriendUtil.challenge(this, this.msg.author);
		} else {
			battleFriendUtil.challenge(this, this.options.user);
		}
		return true;
	}
	return false;
}
