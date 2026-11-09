const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

const originalLoad = Module._load;
let lookup;
Module._load = function (request, ...args) {
	if (request === 'axios') return { get: (...params) => lookup(...params) };
	return originalLoad.call(this, request, ...args);
};
const command = require('../src/commands/commandList/social/define.js');
Module._load = originalLoad;

function context(args = ['test']) {
	const messages = [];
	const errors = [];
	const reactions = [];
	return {
		args,
		msg: { channel: { nsfw: false }, author: { id: '1', avatarURL: 'avatar' } },
		config: { embed_color: 123 },
		global: { isProfane: (value) => value.includes('bad'), cleanString: () => 'cleaned' },
		errorMsg: (message) => errors.push(message),
		send: async (message) => {
			messages.push(message);
			return { addReaction: async (reaction) => reactions.push(reaction), edit: async () => {} };
		},
		reactionCollector: { create: () => ({ on: () => {} }) },
		messages,
		errors,
		reactions,
	};
}

test('define looks up and displays dictionary results', async () => {
	const p = context(['hello', 'world']);
	lookup = async (url, options) => {
		assert.equal(url, 'https://api.urbandictionary.com/v0/define');
		assert.deepEqual(options.params, { term: 'hello world' });
		return {
			data: {
				list: [
					{
						word: 'hello',
						definition: 'a greeting',
						example: 'hello!',
						permalink: 'https://example.com',
					},
				],
			},
		};
	};
	await command.execute(p);
	assert.match(p.messages[0].embed.description, /a greeting/);
	assert.equal(p.messages[0].embed.footer.text, 'Definition 1/1');
	assert.equal(p.reactions.length, 2);
});

test('define censors results outside NSFW channels', async () => {
	const p = context();
	lookup = async () => ({
		data: {
			list: [{ word: 'test', definition: 'bad', example: '', permalink: 'https://example.com' }],
		},
	});
	await command.execute(p);
	assert.match(p.messages[0].embed.description, /cleaned/);
});

test('define reports an empty result', async () => {
	const p = context();
	lookup = async () => ({ data: { list: [] } });
	await command.execute(p);
	assert.match(p.errors[0], /couldn't find/);
});

test('define reports lookup errors instead of claiming no results', async () => {
	const p = context();
	lookup = async () => {
		throw new Error('network error');
	};
	await command.execute(p);
	assert.match(p.errors[0], /unavailable/);
});

test('define requires a search term', async () => {
	const p = context([]);
	lookup = async () => assert.fail('Unexpected lookup');
	await command.execute(p);
	assert.match(p.errors[0], /add a word/);
});
