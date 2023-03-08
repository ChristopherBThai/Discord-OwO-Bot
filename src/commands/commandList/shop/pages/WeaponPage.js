/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const PageClass = require('./../PageClass.js');

const dailyWeaponUtil = require('../../battle/util/dailyWeaponUtil.js');
const dateUtil = require('../../../../utils/dateUtil.js');
const shardEmoji = '<:weaponshard:655902978712272917>';
const crate = '<:crate:523771259302182922>';

module.exports = class WeaponPage extends PageClass {
	constructor(p) {
		super(p);
		this.id = 3;
	}

	async totalPages() {
		return 1;
	}

	async getPage(page, embed) {
		// Add crate item
		let result = this.toItem({
			id: dailyWeaponUtil.crateId,
			name: 'Weapon Crate',
			emoji: crate,
			price: dailyWeaponUtil.cratePrice,
			priceEmoji: shardEmoji,
		});

		// Parse weapons
		let weapons = await dailyWeaponUtil.getDailyWeapons(this.p);
		for (let i in weapons) {
			let weapon = weapons[i];
			let emojis = weapon.emoji;
			let offset = weapon.passives.length * -3;
			for (let j in weapon.passives) {
				emojis += weapon.passives[j].emoji;
			}
			result += this.toItem({
				id: weapon.shopID,
				name: weapon.rank.name + ' ' + weapon.name,
				emoji: emojis,
				price: weapon.shardPrice,
				priceEmoji: shardEmoji,
				lineThrough: weapon.purchased,
				offset,
			});
		}

		// Add description text
		embed.description =
			'Use your Weapon Shards to purchase weapons and crates!\nWeapons are randomly generated every day!\n- **`owo buy {id}`** to buy a weapon\n- **`owo shop weapon`** to view the weapons\n';
		embed.description += '═'.repeat(this.charLen + 2) + '\n' + result;
		embed.author.name = 'OwO Shop: Weapons';

		// Get remaining time
		let timeUntil = dateUtil.afterMidnight();
		embed.footer.text +=
			' | Resets in: ' +
			timeUntil.hours +
			'H ' +
			timeUntil.minutes +
			'M ' +
			timeUntil.seconds +
			'S';

		return embed;
	}
};
