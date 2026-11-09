const test = require('node:test');
const assert = require('node:assert');

test('captchaImage generates a PNG buffer', (t) => {
	let captchaImage;
	try {
		require('canvas');
		captchaImage = require('../src/utils/captchaImage.js');
	} catch (err) {
		return t.skip('canvas is not available');
	}
	const buffer = captchaImage.generate('Ab3xYz');
	assert.ok(Buffer.isBuffer(buffer));
	assert.strictEqual(buffer.slice(1, 4).toString(), 'PNG');
});
