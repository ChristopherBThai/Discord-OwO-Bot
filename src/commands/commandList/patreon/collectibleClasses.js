/*
 * OwO Bot for Discord
 * Copyright (C) 2022 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const CommandInterface = require('../../CommandInterface.js');
const Collectible = require('./collectibles/CollectibleInterface.js');
const requireDir = require('require-dir');
const dir = requireDir('./collectibles');

const commands = [];

for (let key in dir) {
	const coll = dir[key];
	if (coll instanceof Collectible) {
		addCommand(coll);
	}
}

function addCommand(coll) {
	commands.push(
		new CommandInterface({
			alias: [coll.key, ...coll.alias],
			args: '{@user}',
			desc: `${coll.description}\n\nThis command was created by ${coll.ownersString}`,
			example: [],
			related: [],
			permissions: ['sendMessages'],
			group: ['patreon'],
			cooldown: 15000,

			execute: async function () {
				if (!this.args.length) {
					coll.display(this);
					this.setCooldown(5);
				} else {
					if (
						coll.fullControl &&
						['reset', 'remove'].includes(this.args[0]) &&
						coll.owners.includes(this.msg.author.id)
					) {
						coll.reset(this);
						return;
					}

					if (coll.hasManualMerge && coll.manualMergeCommands?.includes(this.args[0])) {
						coll.manualMerge(this);
						return;
					}

					let user = this.getMention(this.args[0]);
					if (!user) {
						user = await this.fetch.getMember(this.msg.channel.guild, this.args[0]);
						if (!user) {
							this.errorMsg(', Invalid syntax! Please tag a user!', 3000);
							this.setCooldown(5);
							return;
						}
					}
					if (coll.ownerOnly && !coll.owners.includes(this.msg.author.id)) {
						coll.ownerOnlyMsg(this);
						return;
					}

					if (!coll.owners.includes(this.msg.author.id) && user.id === this.msg.author.id) {
						coll.selfOnlyMsg(this);
						return;
					}

					coll.give(this, user);
				}
			},
		})
	);
}

module.exports = commands;
