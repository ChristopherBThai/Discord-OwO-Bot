/*
 * OwO Bot for Discord
 * Copyright (C) 2023 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Pikachu extends Collectible {
	constructor() {
		super();

		this.key = 'pikachu';
		this.alias = ['pikachu', 'chu'];
		this.emoji = '<a:pikachu:1099236809390702612>';
		this.owners = [
			'768465041489657867',
            '968621197011062804',
            '879313703990870047',
            '969176350621589514',
            '528801657111445544',
            '956133987653398569'
		];
		this.fullControl = true;
		this.ownerOnly = true;
		this.giveAmount = 1;
		this.description = `Charmeleons are red,\nWartortles are blue,\nIf you catch my heart,\nI’ll be your pikachu\n\nSubcommands: owo pikachu thunderstone`;
		this.displayMsg = '?emoji? **| ?user?**, you have **?count? Pikachu?plural?** and **?mergeCount? Raichu?mergePlural?**';
		this.brokeMsg = ', you do not have any Pikachus! >:c';
		this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Pikachu** from **?giver?**';
		this.hasManualMerge = true;
		this.manualMergeCommands = ['thunderstone'];
		this.mergeNeeded = 3;
		this.mergeEmoji = ''; // Emoji Required

		this.mergeMsg = 
			'?emoji? **|** ?user? used a thunderstone to evolve Pikachu into **Raichu**! It looks electrifying! ?mergeEmoji? ';
		this.manualMergeData = 'raichu';
		this.init();
	}
	async manualMerge(p) {
        const { redis, msg } = p;

        // Get the current count of Pikachus
        let count = (await redis.hget(`data_${msg.author.id}`, this.data)) || 0;

        // Check if the user has enough Pikachus to evolve
        if (parseInt(count) < this.mergeNeeded) {
            p.errorMsg(`, you need at least **${this.mergeNeeded} Pikachus** to evolve into Raichu!`);
            return;
        }

        // Deduct the required Pikachus for evolution
        await redis.hincrby(`data_${msg.author.id}`, this.data, -this.mergeNeeded);

        // Add a Raichu
        await redis.hincrby(`data_${msg.author.id}`, this.manualMergeData, 1);

        // Send evolution message
        p.send(
            this.mergeMsg.replace('?emoji?', this.mergeEmoji).replace('?mergeEmoji?', this.mergeEmoji).replace('?user?', p.getName())
        );
    }
}

module.exports = new Pikachu();
