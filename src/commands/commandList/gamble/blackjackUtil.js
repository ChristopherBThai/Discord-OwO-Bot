/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const cards = [
	'<:cardback:457084762230751254>',
	'<:as:457412291457974272>',
	'<:2s:457412287372722176>',
	'<:3s:457412291382738954>',
	'<:4s:457412290988343296>',
	'<:5s:457412291059646465>',
	'<:6s:457412291303047208>',
	'<:7s:457412291302916096>',
	'<:8s:457412291004989441>',
	'<:9s:457412291378413578>',
	'<:10s:457412291093069826>',
	'<:js:457412291881598988>',
	'<:qs:457412292007690251>',
	'<:ks:457412292015816720>',
	'<:ac:457412292238114826>',
	'<:2c:457412287389630475>',
	'<:3c:457412291764420608>',
	'<:4c:457412291290464267>',
	'<:5c:457412291655106561>',
	'<:6c:457412292166811659>',
	'<:7c:457412292083187743>',
	'<:8c:457412291780935691>',
	'<:9c:457412291651043329>',
	'<:10c:457412291877404674>',
	'<:jc:457412292359880716>',
	'<:qc:457412292469063682>',
	'<:kc:457412292577853441>',
	'<:ah:457412292972249093>',
	'<:2h:457412292766597140>',
	'<:3h:457412292758470659>',
	'<:4h:457412293056266250>',
	'<:5h:457412293223776287>',
	'<:6h:457412292993351682>',
	'<:7h:457412293232164865>',
	'<:8h:457412293207130123>',
	'<:9h:457412293253267466>',
	'<:10h:457412293236621312>',
	'<:jh:457412293039226892>',
	'<:qh:802675572836532254>',
	'<:kh:457412293261524997>',
	'<:ad:802675572143554601>',
	'<:2d:457412292116611084>',
	'<:3d:457412292938563604>',
	'<:4d:457412292775116800>',
	'<:5d:457412293244747791>',
	'<:6d:457412293068718103>',
	'<:7d:457412293253267476>',
	'<:8d:457412292976574476>',
	'<:9d:457412293257330688>',
	'<:10d:457412292871585794>',
	'<:jd:457412292917854223>',
	'<:qd:457412292980637729>',
	'<:kd:802675572428767294>',
];
const cardsf = [
	'<:cardback:457084762230751254>',
	'<a:asf:467565463950458890>',
	'<a:2sf:467565461886992394>',
	'<a:3sf:467565462092382208>',
	'<a:4sf:467565462864265228>',
	'<a:5sf:467565463304536085>',
	'<a:6sf:467565463938007051>',
	'<a:7sf:467565463703126016>',
	'<a:8sf:467565464000659486>',
	'<a:9sf:802675578586136598>',
	'<a:10sf:802675577214861342>',
	'<a:jsf:467565463753195520>',
	'<a:qsf:802675578427539526>',
	'<a:ksf:467565463639949313>',
	'<a:acf:467565462566338561>',
	'<a:2cf:467565449736093696>',
	'<a:3cf:467565457566859265>',
	'<a:4cf:467565460401946654>',
	'<a:5cf:467565461010251778>',
	'<a:6cf:467565462868197376>',
	'<a:7cf:467565460892942357>',
	'<a:8cf:467565463333765130>',
	'<a:9cf:467565463262461963>',
	'<a:10cf:467565463996465162>',
	'<a:jcf:467565462163685396>',
	'<a:qcf:467565463757520896>',
	'<a:kcf:467565462775922697>',
	'<a:ahf:467565462063022110>',
	'<a:2hf:467565456463495169>',
	'<a:3hf:467565459756154890>',
	'<a:4hf:467565462335782932>',
	'<a:5hf:467565460422918145>',
	'<a:6hf:467565460590690315>',
	'<a:7hf:467565460938948608>',
	'<a:8hf:467565461517762560>',
	'<a:9hf:467565461895118877>',
	'<a:10hf:467565463317250049>',
	'<a:jhf:467565461702443008>',
	'<a:qhf:467565462902013972>',
	'<a:khf:467565462192914433>',
	'<a:adf:467565463992401920>',
	'<a:2df:467565459756285962>',
	'<a:3df:467565462071410708>',
	'<a:4df:467565462180593665>',
	'<a:5df:467565463195484180>',
	'<a:6df:467565463556325376>',
	'<a:7df:467565463170187264>',
	'<a:8df:467565464017436672>',
	'<a:9df:467565463518314497>',
	'<a:10df:467565463979687947>',
	'<a:jdf:467565463631691784>',
	'<a:qdf:467565463665115138>',
	'<a:kdf:467565463891607573>',
];
const global = require('../../../utils/global.js');
const config = require('../../../data/config.json');
const random = require('random-number-csprng');
//back = b, flip = f, card = c

exports.randCard = randCard;
async function randCard(deck, type) {
	let card = deck.splice(await random(0, deck.length - 1), 1)[0];
	return { card: card, type: type };
}

exports.generateSQL = generateSQL;
function generateSQL(hand, dealer, id) {
	id = '(SELECT bjid FROM blackjack WHERE id = ' + id + ')';
	let sql = '';
	for (let i = 0; i < hand.length; i++)
		sql +=
			'INSERT INTO blackjack_card (bjid,card,dealer,sort) VALUES (' +
			id +
			',' +
			hand[i].card +
			',0,' +
			(i + 1) +
			') ON DUPLICATE KEY UPDATE dealer = 0,sort= ' +
			(i + 1) +
			';';
	for (let i = 0; i < dealer.length; i++)
		sql +=
			'INSERT INTO blackjack_card (bjid,card,dealer) VALUES (' +
			id +
			',' +
			dealer[i].card +
			',' +
			(dealer.length - i) +
			') ON DUPLICATE KEY UPDATE dealer = 2,sort=0;';
	return sql;
}

exports.initDeck = initDeck;
function initDeck(deck, player, dealer) {
	for (let i = 0; i < player.length; i++) deck.splice(deck.indexOf(player[i].card), 1);
	for (let i = 0; i < dealer.length; i++) deck.splice(deck.indexOf(dealer[i].card), 1);
	return deck;
}

exports.generateEmbed = generateEmbed;
function generateEmbed(author, dealer, player, bet, end, winnings) {
	let color = config.embed_color;
	let footer = '🎲 ~ game in progress';
	let dealerValue = cardValue(dealer);
	let playerValue = cardValue(player);
	if (end == 'w') {
		color = 65280;
		footer = '🎲 ~ You won ' + global.toFancyNum(winnings) + ' cowoncy!';
	} else if (end == 'l') {
		color = 16711680;
		footer = '🎲 ~ You lost ' + global.toFancyNum(bet) + ' cowoncy!';
	} else if (end == 'tb') {
		color = 6381923;
		footer = '🎲 ~ You both bust!';
	} else if (end == 't') {
		color = 6381923;
		footer = '🎲 ~ You tied!';
	} else dealerValue.points = dealerValue.shownPoints + '+?';

	let embed = {
		color: color,
		footer: {
			text: footer,
		},
		author: {
			name: author.username + ', you bet ' + global.toFancyNum(bet) + ' to play blackjack',
			icon_url: author.avatarURL,
		},
		fields: [
			{
				name: 'Dealer `[' + dealerValue.points + ']`',
				value: dealerValue.display,
				inline: true,
			},
			{
				name:
					author.username + ' `[' + playerValue.points + ']' + (playerValue.ace ? '*' : '') + '`',
				value: playerValue.display,
				inline: true,
			},
		],
	};

	return embed;
}

exports.cardValue = cardValue;
function cardValue(deck) {
	let text = '';
	let points = 0;
	let unhiddenPoints = 0;
	let aces = 0;
	for (let i = 0; i < deck.length; i++) {
		let value = deck[i].card % 13;

		if (deck[i].type == 'f') text += cardsf[deck[i].card] + ' ';
		else if (deck[i].type == 'c') text += cards[deck[i].card] + ' ';
		else text += cards[0] + ' ';

		if (value >= 10 || value == 0) {
			points += 10;
			if (deck[i].type == 'f' || deck[i].type == 'c') unhiddenPoints += 10;
		} else if (value > 1) {
			points += value;
			if (deck[i].type == 'f' || deck[i].type == 'c') unhiddenPoints += value;
		} else {
			if (deck[i].type == 'f' || deck[i].type == 'c') unhiddenPoints++;
			points++;
			aces++;
		}
	}

	let usedAces = 0;
	for (let i = 0; i < aces; i++) {
		points += 10;
		if (points > 21) {
			usedAces++;
			points -= 10;
		}
	}

	let ace = false;
	if (aces > 0 && usedAces < aces) ace = true;

	return {
		display: text,
		points: points,
		shownPoints: unhiddenPoints,
		ace: ace,
	};
}
