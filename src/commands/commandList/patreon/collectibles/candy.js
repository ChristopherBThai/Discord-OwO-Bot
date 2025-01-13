/*
 * OwO Bot for Discord
 * Copyright (C) 2025 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const Collectible = require('./CollectibleInterface.js');

class Candy extends Collectible {
    constructor() {
        super();

        this.key = 'candy';
        this.alias = ['candy'];
        this.singleName = 'candy';
        this.pluralName = 'candies';
        this.emoji = ''; // Replace with the actual emoji ID for Candy
        this.owners = [ 
            '768465041489657867',
            '1096503254898180287'
        ];
        this.fullControl = true;
        this.ownerOnly = true;
        this.giveAmount = 1;
        this.description = `Sweet and bright, a joyful delight,\nA treat to savor, morning or night.\nCandy so fine, it’s truly divine,\nA moment of bliss, every time.\n\nSubcommands: owo candy combine`;
        this.displayMsg = '?emoji? **| ?user?**, you have **?count? ?pluralName?** and **?mergeCount? Chocolate?mergePlural?**';
        this.brokeMsg = ', you do not have any candies! >:c';
        this.giveMsg = '?emoji? **| ?receiver?**, you have received **1 Candy** from **?giver?**';
        this.hasManualMerge = true;
        this.manualMergeCommands = ['combine'];
        this.mergeNeeded = 3;
        this.mergeEmoji = ''; // Replace with the actual emoji ID for Chocolate
        this.mergeMsg = 
            '?emoji? **|** ?user? combined ?mergeNeeded? candies to make a **Chocolate**! Enjoy the sweetness! ?mergeEmoji? ';
        this.manualMergeData = 'chocolate';
        this.init();
    }

    async manualMerge(p) {
        const { redis, msg } = p;

        let count = (await redis.hget(`data_${msg.author.id}`, this.data)) || 0;

        if (parseInt(count) < this.mergeNeeded) {
            p.errorMsg(`, you need at least **${this.mergeNeeded} candies** to make a chocolate!`);
            return;
        }

        await redis.hincrby(`data_${msg.author.id}`, this.data, -this.mergeNeeded);

        await redis.hincrby(`data_${msg.author.id}`, this.manualMergeData, 1);

        p.send(
            this.mergeMsg.replace('?emoji?', this.emoji).replace('?mergeEmoji?', this.mergeEmoji).replace('?mergeNeeded?',this.mergeNeeded).replace('?user?', p.getName())
        );
    }
}

module.exports = new Candy();