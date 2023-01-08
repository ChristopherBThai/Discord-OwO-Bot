/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const ranks = [0.2, 0.4, 0.6, 0.8, 0.94, 0.99, 1];

module.exports = class PassiveInterface {
    constructor(qualities, noCreate) {
        this.init();
        if (noCreate) { return; }

        if (!qualities) { qualities = this.randomQualities(); }

        const avgQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
        const emoji = this.getEmoji(avgQuality);
        const stats = this.toStats(qualities);

        /* Construct desc */
        let desc = this.statDesc;
        for (let i = 0; i < stats.length; i++) {
            desc = desc.replace('?', stats[i]);
        }
        /* Check if it has enough emojis */
        if (this.emojis.length !== 7) { throw new Error(`[${args.id}] does not have 7 emojis`); }

        this.avgQuality = avgQuality;
        this.qualities = qualities;
        this.emoji = emoji;
        this.stats = stats;
        this.desc = desc;
        this.sqlStat = qualities.join(',');
    }

    randomQualities() {
        const qualities = [];
        for (let i = 0; i < this.qualityList.length; i++) { qualities.push(Math.trunc(Math.random() * 101)); }
        return qualities;
    }

    getEmoji(quality) {
        /* If there are multiple quality, get avg */
        if (typeof quality === 'string') {
            quality = quality.split(',');
            quality = quality.reduce((a, b) => parseInt(a) + parseInt(b), 0) / quality.length;
        }

        quality /= 100;

        /* Get correct rank */
        for (let rankIndex = 0; rankIndex < ranks.length; rankIndex++) {
            const rankQuality = ranks[rankIndex];
            const previousRankQuality = ranks[rankIndex - 1] || 0;

            if (quality > previousRankQuality && quality < rankQuality) {
                return this.emojis[rankIndex];
            }
        }
        return this.emojis[0];
    }

    toStats(qualities) {
        if (qualities.length !== this.qualityList.length) {
            throw new Error(
                `Array size does not match in toStats. Passive id:${this.id}`
            );
        }
        const stats = [];
        for (let i = 0; i < qualities.length; i++) {
            let quality = qualities[i];
            if (quality > 100) { quality = 100; }
            if (quality < 0) { quality = 0; }
            const min = this.qualityList[i][0];
            const max = this.qualityList[i][1];

            /* rounds to 2 decimal places */
            stats.push(Math.round((min + (max - min) * (quality / 100)) * 100) / 100);
        }
        return stats;
    }

    alterStats(stats) { }

    static get getID() {
        return new this(null, true).id;
    }
    static get disabled() {
        return new this(null, true).disabled;
    }

    /* Before a turn executes */
    preTurn(animal, ally, enemy, action) { }
    /* After a turn executes */
    postTurn(animal, ally, enemy, action) { }

    /* If the passive owner is attacking*/
    attack(animal, attackee, damage, type, last) { }
    /* If the passive owner is attacked */
    attacked(animal, attacker, damage, type, last) { }
    /* If the passive owner is healing */
    heal(animal, healer, amount, tag) { }
    /* If the passive owner is healed */
    healed(animal, healer, amount, tag) { }
    /* If the passive owner is replenishing */
    replenish(animal, healer, amount, tag) { }
    /* If the passive owner is replenished */
    replenished(animal, healer, amount, tag) { }
    /* If the passive owner is attacking (after bonus damage) */
    postAttack(animal, attackee, damage, type, last) { }
    /* If the passive owner is attacked (after bonus damage) */
    postAttacked(animal, attacker, damage, type, last) { }
    /* If the passive owner is healing(after bonus heal) */
    postHeal(animal, healer, amount, tag) { }
    /* If the passive owner is healed (after bonus heal) */
    postHealed(animal, healer, amount, tag) { }
    /* If the passive owner is replenishing (after bonus heal) */
    postReplenish(animal, healer, amount, tag) { }
    /* If the passive owner is replenished (after bonus heal) */
    postReplenished(animal, healer, amount, tag) { }

    /* If the passive owner is allowed to attack */
    canAttack(me, ally, enemy, action, result) { }
};
