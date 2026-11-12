/*
 * Roulette (European: a single 0) built with Components V2.
 *
 * The original discord.js version used ContainerBuilder/SectionBuilder/MediaGalleryBuilder.
 * Here the same layout is created with the raw payload helpers in utils/componentsV2.js
 * and sent through the bot's normal `p.send` (Eris) pipeline.
 *
 * Flow: pick a chip, then press a bet button. Every press adds the selected chip's value
 * to that bet. Pressing "Spin" takes the money, spins the wheel and pays the winnings.
 */

const fs = require('fs');
const path = require('path');
const random = require('random-number-csprng');
const CommandInterface = require('../../CommandInterface.js');
const {
	ButtonStyle,
	v2Message,
	container,
	section,
	textDisplay,
	separator,
	mediaGallery,
	actionRow,
	button,
} = require('../../../utils/componentsV2.js');
const table = require('../../../utils/rouletteTable.js');
const board = require('../../../utils/rouletteBoard.js');
const { getChipEmojis, getSpinEmoji } = require('../../../utils/rouletteEmojis.js');
const { keepWarm } = require('../../../utils/discordHttp.js');

const cowoncy = '<:cowoncy:416043450337853441>';
const maxBet = 250000;
const gifDir = path.join(__dirname, '../../../../resim/gif');
const fallbackGifPath = path.join(__dirname, '../../../data/images/roulette_spin.gif');
const fallbackSpinTime = 4000;

const colors = { lobby: 0x0099ff, spin: 0xf1c40f, win: 0x2ecc71, lose: 0xe74c3c, ended: 0x636363 };

const chips = table.CHIPS;
const chipPrefix = 'roulette_chip_';
const betPrefix = 'roulette_bet_';
const ids = { spin: 'roulette_spin', clear: 'roulette_clear' };

// Bet buttons, one array per row
const betButtonRows = [
	[
		{ key: 'd1', style: ButtonStyle.Primary },
		{ key: 'd2', style: ButtonStyle.Primary },
		{ key: 'd3', style: ButtonStyle.Primary },
		{ key: 'c1', style: ButtonStyle.Primary },
	],
	[
		{ key: 'odd', style: ButtonStyle.Primary },
		{ key: 'even', style: ButtonStyle.Primary },
		{ key: 'c2', style: ButtonStyle.Primary },
	],
	[
		{ key: 'red', style: ButtonStyle.Danger },
		{ key: 'black', style: ButtonStyle.Secondary },
		{ key: 'c3', style: ButtonStyle.Primary },
	],
	[{ key: table.ZERO_KEY, style: ButtonStyle.Success }],
];

const allIds = [
	ids.spin,
	ids.clear,
	...chips.map((amount) => chipPrefix + amount),
	...betButtonRows.flat().map(({ key }) => betPrefix + key),
];

const fancy = (num) => num.toLocaleString('en-US');

// Chip emoji as a button emoji object / as text. Falls back to a plain coin if not available.
const chipEmoji = (state, amount) => state.emojis[amount] || { name: '🪙' };
const chipText = (state, amount) => {
	const emoji = chipEmoji(state, amount);
	return emoji.id ? `<:${emoji.name}:${emoji.id}>` : emoji.name;
};

function totalBet(bets) {
	return Object.values(bets).reduce((sum, amount) => sum + amount, 0);
}

function betsText(state) {
	const lines = Object.entries(state.bets).map(
		([key, amount]) => `• **${table.betLabel(key)}** - ${cowoncy} ${fancy(amount)}`
	);
	return (
		(state.chip
			? `**Selected chip:** ${chipText(state, state.chip)} ${fancy(state.chip)}\n`
			: '**Selected chip:** *none - pick a chip first*\n') +
		(lines.length
			? lines.join('\n')
			: '*No bets yet. Pick a chip, then press a bet button!*') +
		`\n**Total bet:** ${cowoncy} ${fancy(totalBet(state.bets))}`
	);
}

function chunk(array, size) {
	const result = [];
	for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size));
	return result;
}

/** Lobby: Section (text + spin button), table image, bets and the chip/bet buttons */
function lobbyContent(state, { disabled = false, color = colors.lobby } = {}) {
	const spinButton = button({
		customId: ids.spin,
		label: 'Spin the Wheel',
		style: ButtonStyle.Success,
		emoji: '🎲',
		disabled: disabled || totalBet(state.bets) === 0,
	});

	const chipButtons = chips.map((amount) =>
		button({
			customId: chipPrefix + amount,
			label: fancy(amount),
			style: state.chip === amount ? ButtonStyle.Success : ButtonStyle.Secondary,
			emoji: chipEmoji(state, amount),
			disabled,
		})
	);
	const clearButton = button({
		customId: ids.clear,
		label: 'Clear',
		style: ButtonStyle.Secondary,
		emoji: '🗑️',
		disabled,
	});
	const [chipRow1, chipRow2] = chunk([...chipButtons, clearButton], 5);

	const betRows = betButtonRows.map((row) =>
		row.map(({ key, style }) =>
			button({
				customId: betPrefix + key,
				label: table.betLabel(key),
				style,
				disabled,
			})
		)
	);

	return v2Message(
		container(
			[
				section(
					[`## ${state.spinEmoji || '🎰'} Roulette`, 'Pick a chip, place your bets and spin the wheel!'],
					spinButton
				),
				separator(),
				mediaGallery('attachment://rulet-masasi.png'),
				textDisplay(betsText(state)),
				separator(),
				actionRow(...chipRow1),
				actionRow(...chipRow2),
				separator(),
				...betRows.map((row) => actionRow(...row)),
			],
			{ accentColor: color }
		)
	);
}

function textOnlyContent(text, color) {
	return v2Message(container([textDisplay(text)], { accentColor: color }));
}

function resultText(name, winning, results, total, payout) {
	const shown = results.slice(0, 15).map(({ key, amount, ret }) => {
		const label = table.betLabel(key);
		return ret > 0
			? `✅ **${label}** - ${cowoncy} ${fancy(amount)} → ${cowoncy} ${fancy(ret)}`
			: `❌ **${label}** - ${cowoncy} ${fancy(amount)}`;
	});

	const net = payout - total;
	const summary =
		net > 0
			? `🎉 **${name}** won ${cowoncy} **${fancy(net)}**!`
			: net === 0
			? `😐 **${name}** got the bet back.`
			: `💸 **${name}** lost ${cowoncy} **${fancy(-net)}**... :c`;

	return (
		`## 🎰 Roulette Result\n` +
		`The ball landed on **${table.numberEmoji(winning)} ${table.numberLabel(winning)}**!\n\n` +
		`${shown.join('\n')}\n\n${summary}`
	);
}

/**
 * Spin animation that ends on the winning number (resim/gif/spin_<n>.gif, made by
 * utils/generateWheelGifs.js). Falls back to src/data/images/roulette_spin.gif, then to no gif.
 */
async function readSpinGif(winning) {
	try {
		const gif = await fs.promises.readFile(path.join(gifDir, `spin_${winning}.gif`));
		let time = fallbackSpinTime;
		try {
			const info = JSON.parse(await fs.promises.readFile(path.join(gifDir, 'gif_bilgi.json')));
			time = info.sure_ms[winning] || time;
		} catch (e) {
			// Use the default duration
		}
		return { gif, time };
	} catch (e) {
		// Wheel gifs not generated
	}
	try {
		return { gif: await fs.promises.readFile(fallbackGifPath), time: fallbackSpinTime };
	} catch (e) {
		return null;
	}
}

module.exports = new CommandInterface({
	alias: ['roulette', 'rulet', 'rl'],

	args: '',

	desc: 'Play roulette! Pick a chip, place bets on the table and spin the wheel. A number pays 36x, dozens/columns 3x and red/black/even/odd 2x!',

	example: ['owo roulette'],

	related: ['owo money', 'owo slots', 'owo coinflip'],

	permissions: ['sendMessages'],

	group: ['gambling'],

	cooldown: 15000,
	half: 90,
	six: 500,
	bot: true,

	execute: async function (p) {
		const userId = p.msg.author.id;
		const name = p.getName();

		// Balance is checked once here and again (atomically) when spinning. Doing it on every
		// click would only slow down the button responses, which must happen within 3 seconds.
		const money = await p.query(`SELECT money FROM cowoncy WHERE id = ${userId};`);
		if (!money[0] || money[0].money <= 0) {
			p.send('**🚫 | ' + name + "**, You don't have enough cowoncy!", 3000);
			return;
		}

		const state = {
			chip: null,
			bets: {},
			balance: money[0].money,
			emojis: await getChipEmojis(p.client),
			spinEmoji: await getSpinEmoji(p.client),
		};

		const message = await p.send(lobbyContent(state), null, {
			file: board.drawBoard({ tray: true }),
			name: 'rulet-masasi.png',
		});
		state.message = message;

		const filter = (componentName, user) => allIds.includes(componentName) && user.id === userId;
		const collector = p.interactionCollector.create(message, filter, {
			time: 900000,
			idle: 180000,
		});
		keepWarm(collector);

		const respond = async (ack, content) => {
			const result = await ack(content);
			const ms = ack.age();
			if (ms > 2000) console.warn(`[roulette] slow interaction response: ${ms}ms`);
			return result;
		};

		collector.on('collect', async (componentName, user, ack, err) => {
			try {
				// Chip selection
				if (componentName.startsWith(chipPrefix)) {
					state.chip = Number(componentName.slice(chipPrefix.length));
					return await respond(ack, lobbyContent(state));
				}

				if (componentName === ids.clear) {
					state.bets = {};
					return await respond(ack, lobbyContent(state));
				}

				// Bet: adds the selected chip to the pressed bet
				if (componentName.startsWith(betPrefix)) {
					const key = componentName.slice(betPrefix.length);
					if (!table.isValidBetKey(key)) return await ack();

					if (!state.chip) return await err('🚫 **|** Pick a chip first!');

					const newTotal = totalBet(state.bets) + state.chip;
					if (newTotal > maxBet) {
						return await err(`🚫 **|** The total bet can be at most ${cowoncy} ${fancy(maxBet)}!`);
					}
					if (newTotal > state.balance) {
						return await err("🚫 **|** You don't have enough cowoncy!");
					}
					state.bets[key] = (state.bets[key] || 0) + state.chip;
					return await respond(ack, lobbyContent(state));
				}

				if (componentName === ids.spin) {
					return await spin(p, collector, state, name, ack, err);
				}
			} catch (e) {
				console.error('[roulette]', e.response?.data || e);
			}
		});

		collector.on('end', async (reason) => {
			if (reason === 'spin') return;
			try {
				await message.edit(lobbyContent(state, { disabled: true, color: colors.ended }));
			} catch (e) {
				// Message may have been deleted
			}
		});
	},
});

async function spin(p, collector, state, name, ack, err) {
	const userId = p.msg.author.id;
	const total = totalBet(state.bets);
	if (total <= 0) return err('🚫 **|** Place a bet on the table first!');

	// Decide everything before touching the database
	const winning = await random(0, 36);
	const results = Object.entries(state.bets).map(([key, amount]) => ({
		key,
		amount,
		ret: table.betReturn(key, amount, winning),
	}));
	const payout = results.reduce((sum, { ret }) => sum + ret, 0);

	// Take the bet and give the winnings in a single atomic query
	const sql = `UPDATE cowoncy SET money = money + ${payout - total} WHERE id = ${userId} AND money >= ${total};`;
	const result = await p.query(sql);
	if (!result || !result.affectedRows) {
		return err("🚫 **|** You don't have enough cowoncy!");
	}
	// Acknowledge the click without touching the lobby. The lobby message is deleted below, once
	// the spin animation (the full-size gif) is on screen.
	await ack.defer();
	collector.stop('spin');
	p.logger.incr('cowoncy', payout - total, { type: 'roulette' }, p.msg);
	p.logger.incr('gamble', payout > total ? 1 : -1, { type: 'roulette' }, p.msg);

	// From here on the bet is already paid, so a failure must never swallow the result
	let resultImage = null;
	try {
		resultImage = board.drawBoard({ bets: state.bets, winning });
	} catch (e) {
		console.error('[roulette] could not draw the result images:', e);
	}

	const spinGif = await readSpinGif(winning);
	let spinMessage = null;
	try {
		spinMessage = await p.send(
			spinGif
				? v2Message(
						container([mediaGallery('attachment://spin.gif')], { accentColor: colors.spin })
				  )
				: textOnlyContent(
						`## ${state.spinEmoji || '🎡'} Spinning...\n**${name}** bet ${cowoncy} **${fancy(total)}**.`,
						colors.spin
				  ),
			null,
			spinGif ? { file: spinGif.gif, name: 'spin.gif' } : undefined
		);
	} catch (e) {
		console.error('[roulette] could not send the spin gif:', e.response?.data || e);
	}
	// The lobby (small text) is replaced by the gif message
	await state.message.delete().catch(() => {});
	await new Promise((resolve) =>
		setTimeout(resolve, spinGif ? spinGif.time : fallbackSpinTime)
	);
	if (spinMessage) await spinMessage.delete().catch(() => {});

	const content = v2Message(
		container(
			[
				textDisplay(resultText(name, winning, results, total, payout)),
				...(resultImage
					? [separator(), mediaGallery('attachment://rulet-sonuc.png')]
					: []),
			],
			{ accentColor: payout > total ? colors.win : colors.lose }
		)
	);
	try {
		await p.send(
			content,
			null,
			resultImage ? { file: resultImage, name: 'rulet-sonuc.png' } : undefined
		);
	} catch (e) {
		console.error('[roulette] could not send the result with images:', e.response?.data || e);
		// Last resort: the result as plain text
		await p
			.send(textOnlyContent(resultText(name, winning, results, total, payout), colors.lose))
			.catch((e2) => console.error('[roulette] could not send the result:', e2));
	}
	p.quest('gamble');
}
