/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

/* Page class */
module.exports = class ShopPage {
	constructor(p) {
		this.p = p;
		this.charLen = 30;
		this.id = -1;
	}

	async totalPages() {
		return 0;
	}

	async getPage(_page, _embed) {}

	toItem({ id, emoji, name, url, price, priceEmoji, lineThrough, offset }) {
		let cLength = this.charLen - name.length + (4 - ('' + price).length);
		if (offset) cLength += offset;
		if (cLength < 0) cLength = 0;
		return (
			(lineThrough ? '~~' : '') +
			'`' +
			id +
			'` ' +
			emoji +
			' **' +
			(url ? '[`' + name + '`](' + url + ')' : '`' + name + '`') +
			'**`' +
			'-'.repeat(cLength) +
			' ' +
			price +
			'` ' +
			priceEmoji +
			'\n' +
			(lineThrough ? '~~' : '')
		);
	}
};
