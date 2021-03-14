/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const bossUtil = require('./util/bossUtil.js');
const battleUtil = require('./util/battleUtil.js');

module.exports = new CommandInterface({

	alias:["boss"],

	args:"[fight]",

	desc:"Bosses will appear randomly on a server! You can fight them with 'owo boss fight'! Rewards depend on how much damage you do.",

	example:["owo boss fight"],

	related:["owo battle"],

	permissions:["sendMessages","embedLinks"],

	group:["animals"],

	// TODO add cooldown
	cooldown:000,
	half:25,
	six:200,
	bot:true,

	execute: async function(p){
		const boss = await bossUtil.fetchBoss(p);
		if (!boss) {
			p.errorMsg(", there is no boss available!", 5000);
			p.setCooldown(5);
			return;
		}

		// TODO consume tickets
		
		const users = await bossUtil.fetchUsers(p);
		const player = await bossUtil.fetchPlayer(p);

		const battle = {
			player,
			enemy: boss
		}

		const prevHp = boss.team[0].stats.hp[0];
		const prevWp = boss.team[0].stats.wp[0];

		let logs = await battleUtil.calculateAll(p,battle);

		const currentHp = logs[logs.length-2].enemy[0].hp[0];
		const currentWp = logs[logs.length-2].enemy[0].wp[0];
		const hpChange = prevHp - currentHp;
		const wpChange = prevWp - currentWp;

		bossUtil.updateBoss(p, {boss: boss.team[0], hpChange, wpChange });
	}

})

