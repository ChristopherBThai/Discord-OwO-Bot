/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */
const battleUtil = require('./battleUtil.js');
const teamUtil = require('./teamUtil.js');
const crateUtil = require('./crateUtil.js');
const battleDisplayUtil = require('./battleDisplayUtil.js');

module.exports = class BattleEvent {
	constructor(p, friendly) {
		this.p = p;
		this.friendly = friendly;
		this.initialized = false;
		this.simulated = false;

		this.logs = [];
		this.endResult = {};
		this.setting = undefined;
		this.player = undefined;
		this.enemy = undefined;
		this.images = [];
	}

	async init({ setting, player, enemy, levelOverride } = {}) {
		this.setting = setting || (await battleUtil.getBattleSetting.bind(this.p)());
		this.playerUser = player;
		this.enemyUser = enemy;

		this.player = await teamUtil.getBattleTeam.bind(this.p)(
			{ id: player?.id || this.p.msg.author.id },
			levelOverride
		);
		if (!this.player) {
			this.p.errorMsg(', Create a team with the command `owo team add {animal}`');
			return;
		}
		if (!enemy) {
			const enemyPgid = await battleUtil.getRandomPgid.bind(this.p)();
			this.enemy = await teamUtil.getBattleTeam.bind(this.p)({ pgid: enemyPgid }, levelOverride);
		} else {
			this.enemy = await teamUtil.getBattleTeam.bind(this.p)(
				{ id: enemy.id },
				levelOverride,
				player.id === enemy.id
			);
		}
		if (!this.enemy) {
			this.p.errorMsg(', there was an error finding an opponent...');
			return;
		}

		this.initialized = true;
	}

	simulateBattle() {
		if (!this.initialized) return;
		if (this.checkBattleDone()) {
			this.simulated = true;
			return;
		}

		/* Update previous hp before turn execution */
		battleUtil.updatePreviousStats(this);

		let battleLogs = [
			/* Pre turn */
			...battleUtil.preTurn(this.player.team, this.enemy.team),
			...battleUtil.preTurn(this.enemy.team, this.player.team),

			/* Execute actions */
			...battleUtil.executeTurn(this.player.team, this.enemy.team),

			/* Post turn */
			...battleUtil.postTurn(this.player.team, this.enemy.team),
			...battleUtil.postTurn(this.enemy.team, this.player.team),
		];

		/* Remove marked buffs */
		battleUtil.removeBuffs(this.player.team, this.enemy.team);

		/* Save only the HP and WP states (will need to save buff status later) */
		let state = battleUtil.saveStates(this);
		if (battleLogs.length > 0) {
			state.battleLogs = battleLogs;
		}
		this.logs.push(state);

		/* recursive call */
		return this.simulateBattle();
	}

	async displayBattles() {
		if (!this.simulated || !this.initialized) return;
		this.logLink = await battleDisplayUtil.getLogLink(this);
		await battleDisplayUtil.displayAllBattles(this);
	}

	checkBattleDone() {
		/* check if the battle is finished */
		let enemyWin = teamUtil.isDead(this.player.team);
		let playerWin = teamUtil.isDead(this.enemy.team);
		if (enemyWin || playerWin) {
			const logLength = this.logs.length + 1;
			/* tie */
			let color = 6381923;
			let text = "It's a tie in " + logLength + ' turns!';

			/* enemy wins */
			if (enemyWin && !playerWin) {
				color = 16711680;
				text = 'You lost in ' + logLength + ' turns!';
				if (this.friendly && this.enemyUser) {
					text = `${this.p.getName(this.enemyUser)} wins!`;
				}

				/* player wins */
			} else if (playerWin && !enemyWin) {
				color = 65280;
				text = 'You won in ' + logLength + ' turns!';
				if (this.friendly && this.playerUser) {
					text = `${this.p.getName(this.playerUser)} wins!`;
				}
			}

			/* Last event in log is winning result */
			this.endResult.enemyWin = enemyWin;
			this.endResult.playerWin = playerWin;
			this.endResult.color = color;
			this.endResult.text = text;

			return true;
		}

		/* Battle is way too long */
		if (this.logs.length >= 24) {
			this.endResult = {
				enemyWin: true,
				playerWin: true,
				color: 6381923,
				text: "Battle was too long! It's a tie!",
			};
			return true;
		}

		return false;
	}

	async distributeRewards() {
		if (!this.simulated || !this.initialized) return;

		const { playerWin, enemyWin } = this.endResult;

		/* An error occured */
		if (!playerWin && !enemyWin) return;

		/* Calculate and distribute xp */
		this.endResult.pXP = battleUtil.calculateXP(
			{ team: this.player, win: playerWin },
			{ team: this.enemy, win: enemyWin },
			this.player.streak
		);
		this.endResult.eXP = battleUtil.calculateXP(
			{ team: this.enemy, win: enemyWin },
			{ team: this.player, win: playerWin }
		);

		await teamUtil.giveXPToUserTeams(this.p, this.p.msg.author, this.endResult.pXP.total, {
			xpOverrides: this.endResult.pXP.xpOverrides,
			activePgid: this.player.pgid,
			activePids: teamUtil.getPidFromTeam(this.player),
		});
		await teamUtil.updateTeamStreak(this.player.pgid, this.endResult.pXP);
		await teamUtil.giveXPToUserTeams(this.p, null, this.endResult.eXP.total, {
			xpOverrides: this.endResult.eXP.xpOverrides,
			activePgid: this.enemy.pgid,
			activePids: teamUtil.getPidFromTeam(this.enemy),
			ignoreSecondary: true,
		});

		/* Update TT on weapons */
		await battleUtil.updateTT.bind(this.p)(this.player);
		await battleUtil.updateTT.bind(this.p)(this.enemy);

		let sql = `SELECT * FROM user INNER JOIN crate ON user.uid = crate.uid WHERE id = ${this.p.msg.author.id};`;
		let result = await this.p.query(sql);
		/* Decide if user receives a crate */
		let crateQuery = result[0];
		let crate = this.p.dateUtil.afterMidnight(crateQuery ? crateQuery.claim : undefined);
		if (!crateQuery || crateQuery.claimcount < 3 || crate.after) {
			crate = crateUtil.crateFromBattle(this.p, crateQuery, crate);
			if (crate.sql) await this.p.query(crate.sql);
		}
		/* send message for crate reward */
		if (crate && crate.text) await this.p.send(crate.text);

		/* quests */
		this.p.quest('battle');
		this.p.quest('xp', this.endResult.pXP.total);

		this.p.event.getEventItem.bind(this.p)();
	}

	getLength() {
		return this.logs.length;
	}

	get isInstant() {
		return this.setting.speed === 'instant';
	}

	get isShort() {
		return this.setting.speed === 'short';
	}

	get isLengthy() {
		return this.setting.speed === 'lengthy';
	}
};
