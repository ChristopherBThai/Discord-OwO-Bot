/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const blank = '<:blank:427371936482328596>';

const efficiency = '⏱ ';
const duration = '⏳ ';
const cowoncy = '<:cowoncy:416043450337853441>';
const gain = '🔧 ';
const experience = '⚔ ';
const radar = '📡';
const essence = '<a:essence:451638978299428875>';

exports.alter = function (id, text, type) {
	switch (id) {
		case '111619509529387008':
			return lexus(text, type);
		case '242718397836558337':
			return shippig(text, type);
		case '255750356519223297':
			return spotifybot(text, type);
		case '250383887312748545':
			return elsa(text, type);
		case '192692796841263104':
			return dalu(text, type);
		case '323347251705544704':
			return rikudou(text, type);
		case '283000589976338432':
			return kuma(text, type);
		case '325273108418396160':
			return spotifybot2(text, type);
		//case '408875125283225621':
		//	return kirito(text,type);
		case '575555630312456193':
			return xmelanie(text, type);
		case '216710431572492289':
			return arichy(text, type);
		case '352273158025379841':
			return capz(text, type);
		default:
			return text;
	}
};

function lexus(text, type) {
	let lunawave = '<a:lunawave:556733830224936971>';
	let lunajump = '<a:lunajump:556733828480106496>';
	switch (type) {
		case 'hb':
			text.color = 15704149;
			text.fields[0].name = lunawave + ' `Bork! I am Luna! I will find friends for you, master!`';
			if (text.fields.length >= 9) {
				text.fields[8].name = lunajump + ' Luna is still searching!';
				text.fields[8].value = text.fields[8].value
					.replace(
						'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
						'Bork! I am still looking for friends. I will be back in'
					)
					.replace('DONE', 'done')
					.replace('`\n', '!`\n')
					.replace('ANIMALS CAPTURED', 'friends made!');
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, lunajump)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Bork! I am still looking for friends. I will be back in'
				)
				.replace('`\n', '!`\n')
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'friends made!');
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi, lunajump);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, lunawave)
				.replace('BEEP BOOP.', 'Arf!')
				.replace('YOU SPENT', 'you spent')
				.replace('I WILL BE BACK IN', 'I will be back in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'friends')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience!');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, lunawave)
				.replace('BEEP BOOP. I AM BACK WITH', 'Woof! I am back with')
				.replace('ANIMALS', 'friends')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience!');
			return text;
		default:
			return text;
	}
}

function shippig(text, type) {
	switch (type) {
		case 'hb':
			text.color = 6315775;
			text.fields[0].name =
				'<:pandabag:566537378303311872> `Hi! I am Roo! I will kidnap animals for you!`';
			if (text.fields.length >= 9) {
				text.fields[8].name = '<a:roonyoom:566536940846055444> Roo is still kidnapping!';
				text.fields[8].value = text.fields[8].value
					.replace('BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN', 'Roo will be back in')
					.replace('DONE', 'done')
					.replace('`\n', '!`\n')
					.replace('ANIMALS CAPTURED', 'animals captured!');
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, '<a:roonyoom:566536940846055444>')
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Roo is still kidnapping and will be back in'
				)
				.replace('`\n', '!`\n')
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'animals captured!');
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi, '<:pandabag:566537378303311872>');
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, '<a:roosellout:566537379670786048>')
				.replace('`BEEP BOOP. `', '')
				.replace('YOU SPENT', 'you payed roo')
				.replace('I WILL BE BACK IN', 'and will be back in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'animals')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience!');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, '<:pandabag:566537378303311872>')
				.replace('BEEP BOOP. I AM BACK WITH', 'Roo kidnapped')
				.replace('ANIMALS', 'animals')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience!');
			return text;
		default:
			return text;
	}
}

function spotifybot(text, type) {
	let spotify = '<a:spotify:577027003656437766>';
	let _swipeup = '<a:swipeup:577026648646483969>';
	let nowplaying = '<a:nowplaying:577026647434330132>';
	switch (type) {
		case 'hb':
			text.color = 1947988;
			delete text.author;
			text.fields[0].name =
				nowplaying +
				' ***Spotify*** *music stops playing...* OH NO! Need more Songs?\n' +
				spotify +
				' `SPOTIFYBOT can add Songs to your Playlist.`';
			text.fields[1].value = text.fields[1].value.replace(
				/(\r\n|\n|\r)/gm,
				' *Oh? You need better songs?*\n'
			);
			text.fields[2].value = text.fields[2].value.replace(
				/(\r\n|\n|\r)/gm,
				' *How about a longer Playlist?*\n'
			);
			text.fields[3].value = text.fields[3].value.replace(
				/(\r\n|\n|\r)/gm,
				' *Want Spotify Premium??*\n'
			);
			text.fields[4].value = text.fields[4].value.replace(
				/(\r\n|\n|\r)/gm,
				' *Hmm, what about a New Playlist?*\n'
			);
			text.fields[5].value = text.fields[5].value.replace(
				/(\r\n|\n|\r)/gm,
				' *Or do you want more Sponsors??*\n'
			);
			if (text.fields.length >= 9) {
				text.fields[8].name = spotify + ' SPOTIFYBOT is currently adding songs!';
				text.fields[8].value = text.fields[8].value
					.replace(
						'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
						'Oops! Looks like the SPOTIFY Playlist is incomplete.\nNEW SONGS ADDED IN'
					)
					.replace('ANIMALS CAPTURED', 'SONGS ADDED');
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, spotify)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Oops! Looks like the SPOTIFY Playlist is incomplete.`\n<:blank:427371936482328596> **|** `NEW SONGS ADDED IN'
				)
				.replace('ANIMALS CAPTURED', 'SONGS ADDED!');
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi, spotify);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, spotify)
				.replace('`BEEP BOOP. `', '')
				.replace('cowoncy', 'cowoncy AND GOT Spotify Premium!')
				.replace('ANIMALS', 'SONGS');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, spotify)
				.replace('BEEP BOOP. I AM', 'SPOTIFY Playlist is ready! I AM')
				.replace('ANIMALS', 'SONGS');
			return text;
		default:
			return text;
	}
}

function elsa(text, type) {
	let shiryu1 = '<:shiryu:608487137058226186>';
	let shiryu2 = '<a:shiryuuu:608487444836253696>';
	let trait1 = '<:trait1:665092925058842624>';
	let trait2 = '<a:trait2:665092925084139530>';
	let trait3 = '<:trait3:665092925960486924>';
	let trait4 = '<:trait4:665092925989978122>';
	let trait5 = '<:trait5:665092925935452170>';
	let trait6 = '<:trait6:665092925922738196>';
	switch (type) {
		case 'hb':
			text.fields[1].name = text.fields[1].name
				.replace('Efficiency', 'Knights in Attendance')
				.replace('⏱', trait1);
			text.fields[1].value =
				'*How many invitations are going out, my mistress?*\n' + text.fields[1].value;

			text.fields[2].name = text.fields[2].name
				.replace('Duration', 'Tournament Deadline')
				.replace('⏳', trait2);
			text.fields[2].value =
				'*We need time to prepare for the tournament*\n' + text.fields[2].value;

			text.fields[3].name = text.fields[3].name
				.replace('Cost', 'Tournament Funds')
				.replace('<:cowoncy:416043450337853441>', trait3);
			text.fields[3].value = '*How much is my mistress willing to spare?*\n' + text.fields[3].value;

			text.fields[4].name = text.fields[4].name
				.replace('Gain', 'Cosmos Power')
				.replace('🔧', trait4);
			text.fields[4].value =
				'*As your knights train, my mistress, the cosmos within them grows*\n' +
				text.fields[4].value;

			text.fields[5].name = text.fields[5].name
				.replace('Experience', 'Training for the Tournament')
				.replace('⚔', trait5);
			text.fields[5].value =
				'*Even the strongest of knights must train so they are prepared to defend you*\n' +
				text.fields[5].value;

			text.fields[7].name = text.fields[7].name
				.replace('Animal Essence', 'The Cosmos Within You')
				.replace('<a:essence:451638978299428875>', trait6);
			text.fields[7].value = text.fields[7].value
				.replace('animals', 'knights')
				.replace('essence', 'cosmos power')
				.replace('xp', 'training xp')
				.replace(/`/g, '');

			text.author.name = text.author.name.replace('HuntBot', 'Bronze Knight');
			text.description = shiryu1 + ' **`I will scour the cosmos for you, my mistress`**';
			text.color = 7319500;
			if (text.fields.length >= 9) {
				text.fields[8].name = shiryu1 + " I'm still gathering knights.";
				text.fields[8].value = text.fields[8].value
					.replace('BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN', "I'll be back in")
					.replace('DONE', 'done')
					.replace('ANIMALS CAPTURED', 'knights found');
			}
			text.fields.shift();
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, shiryu1)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					"I'm still gathering knights. I'll be back in"
				)
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'knights found');
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi, shiryu1);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, shiryu1)
				.replace(
					/BEEP BOOP\. `\*\*`[^`]+`\*\*`, YOU SPENT/gi,
					'As you wish, my mistress. You spent'
				)
				.replace('I WILL BE BACK IN', 'I will return in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'animals')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, shiryu2)
				.replace('BEEP BOOP. I AM BACK WITH', 'Mistress, I have returned with')
				.replace('ANIMALS', 'knights')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience');
			return text;
		default:
			return text;
	}
}

function dalu(text, type) {
	let foxbot = '<:foxbot:653394747880374272>';
	switch (type) {
		case 'hb':
			text.fields[0].name =
				foxbot + ' `Hai Hai Master. I am KitsuneBot. Ready to find more food for you!`';
			text.fields[0].value = blank;
			text.author.name = text.author.name.replace('HuntBot', 'KitsuneBot');
			text.color = 63996;
			text.fields[1].name = text.fields[1].name.replace(
				'⏱ Efficiency',
				'<a:foxefficiency:653394748333096960> Found Enemies'
			);
			text.fields[2].name = text.fields[2].name.replace(
				'⏳ Duration',
				'<a:foxduration:653394748501131293> Hunt Time'
			);
			text.fields[3].name = text.fields[3].name.replace(
				'<:cowoncy:416043450337853441> Cost',
				'<a:foxcost:653394748446343168> Endurance'
			);
			text.fields[4].name = text.fields[4].name.replace(
				'🔧 Gain',
				'<a:foxgain:653394748836675594> Hunting Friends'
			);
			text.fields[5].name = text.fields[5].name.replace(
				'⚔ Experience',
				'<a:foxxp:653394749604233286> Combat exp'
			);
			text.fields[6].name = text.fields[6].name.replace(
				'📡 Radar',
				'<a:foxchance:724442785478082591> Rare Fox chance'
			);
			text.fields[7].name = text.fields[7].name.replace(
				'<a:essence:451638978299428875> Animal Essence',
				'<a:foxessence:653394748777824259> Fox Helpers'
			);
			if (text.fields.length >= 9) {
				text.fields[8].name = foxbot + ' KitsuneBot will be back soon!';
				text.fields[8].value = text.fields[8].value.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Estimated time to be back:'
				);
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, foxbot)
				.replace('BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN', 'Estimated time to be back:');
			return text;
		case 'password':
			text = text.split('\n')[0].replace(/<:[a-z]bot:[0-9]+>/gi, foxbot);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, foxbot)
				.replace('`BEEP BOOP. `', '')
				.replace('YOU SPENT', 'you spent')
				.replace('I WILL BE BACK IN', 'I will be back soon in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'animals')
				.replace('ESSENCE', 'Hunting Friends')
				.replace('AND', 'and')
				.replace('EXPERIENCE', 'Combat exp');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, foxbot)
				.replace('BEEP BOOP. I AM BACK WITH', 'I am back with')
				.replace('ANIMALS', 'animals')
				.replace('AND', 'and')
				.replace('ESSENCE', 'Hunting Friends')
				.replace('EXPERIENCE', 'Combat exp');
			return text;
		default:
			return text;
	}
}

function rikudou(text, type) {
	let emoji1 = '<:emoji1:655689103014363157>';
	let emoji2 = '<:emoji2:655689103316353034>';
	let emoji3 = '<:emoji3:655689103555166208>';
	switch (type) {
		case 'hb':
			text.fields[0].name = emoji1 + ' `Rikudou, are you ready to go on another mission?`';
			text.fields[0].value = emoji3 + ' The Mission Assignment Desk has a S rank mission for you!';
			text.color = 255;
			text.fields[1].name =
				text.fields[1].name.replace('Efficiency', 'Chakra Levels').slice(0, -1) +
				' How are your chakra Levels doing?`';
			text.fields[2].name =
				text.fields[2].name.replace('Duration', 'Mission Length').slice(0, -1) +
				' Phew! This is one tedious mission!`';
			text.fields[3].name =
				text.fields[3].name.replace('Cost', 'Ryō').slice(0, -1) + ' Do you have enough Ryō?`';
			text.fields[4].name =
				text.fields[4].name.slice(0, -1) + ' Want to become Hokage? Time to gain more Reputation!`';
			text.fields[5].name =
				text.fields[5].name.replace('Experience', 'Training').slice(0, -1) +
				' Time for more training Shinobi!`';
			if (text.fields.length >= 9) {
				text.fields[8].name = emoji2 + ' Rikudou is currently out on a mission!';
				text.fields[8].value = text.fields[8].value.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Sorry, Rikudou is still out on a mission! You may request Rikudou for another mission at a later time. RIKUDOU WILL BE BACK IN'
				);
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, emoji2)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Sorry, Rikudou is still out on a mission! You may request Rikudou for another mission at a later time.`\n' +
						blank +
						' **|** `RIKUDOU WILL BE BACK IN'
				);
			return text;
		case 'password':
			text = text.split('\n')[0].replace(/<:[a-z]bot:[0-9]+>/gi, emoji1);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, emoji3)
				.replace('`BEEP BOOP. `', '')
				.replace('YOU SPENT', 'you spent')
				.replace('I WILL BE BACK IN', 'I will be back in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'ninjas')
				.replace('ESSENCE', 'essence')
				.replace('AND', 'and')
				.replace('EXPERIENCE', 'experience');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, emoji1)
				.replace('BEEP BOOP. I AM BACK WITH', 'I am back with')
				.replace('ANIMALS', 'ninjas')
				.replace('AND', 'and')
				.replace('ESSENCE', 'essence')
				.replace('EXPERIENCE', 'experience');
			return text;
		default:
			return text;
	}
}

function kuma(text, type) {
	const bear = '<:kuma:674153774088060957>';
	switch (type) {
		case 'hb':
			text.author.name = text.author.name.replace("'s HuntBot", "'s Cookie Collector");
			text.fields.shift();
			text.color = 13344488;
			if (text.fields.length >= 7) {
				text.fields[7].name = bear + " I'm still collecting minions master";
				text.fields[7].value = text.fields[7].value
					.replace('BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN', 'I will be back in')
					.replace('DONE', 'done')
					.replace('ANIMALS CAPTURED', 'minions recruited');
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bear)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					"I'm still collecting minions, master. I'll be back in"
				)
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'minions recruited');
			return text;
		case 'password':
			text = text.split('\n')[0].replace(/<:[a-z]bot:[0-9]+>/gi, bear);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bear)
				.replace('`BEEP BOOP. `', '')
				.replace('YOU SPENT', 'you spent')
				.replace('I WILL BE BACK IN', 'I will be back in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'minions')
				.replace('ESSENCE', 'essence')
				.replace('AND', 'and')
				.replace('EXPERIENCE', 'experience');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bear)
				.replace('BEEP BOOP. I AM BACK WITH', 'I am back with')
				.replace('ANIMALS', 'minions')
				.replace('AND', 'and')
				.replace('ESSENCE', 'essence')
				.replace('EXPERIENCE', 'experience');
			return text;
		default:
			return text;
	}
}

function spotifybot2(text, type) {
	const rainbow = '<a:rainbowbird:704924006545096824>';
	const bongo = '<a:bongobird:704924005827608596>';
	const woah = '<:birdwoah:704924006507085864>';
	const wave = '<a:birdwave:704924007509655552>';
	const roll = '<a:birdroll:704924006364741794>';
	const pat = '<a:birdpat:704924006830309436>';
	const jump = '<a:birdjump:704924007161397280>';
	const _angry = '<:birdangry:704924005546590268>';
	switch (type) {
		case 'hb':
			text.author.name = 'OH NOO!! It looks like Ross has ran out of friend to play with!!';
			text.author.icon_url = 'https://cdn.discordapp.com/emojis/704924005546590268.png';
			text.color = 16312092;
			text.fields[0].name = rainbow + '`ROSS can make friends and bring them to your zoo!`';
			text.fields[1].name = text.fields[1].name.replace('⏱', jump);
			text.fields[1].value = text.fields[1].value.replace(
				'\n',
				'\n*Looks like Ross wants more friends!*\n'
			);
			text.fields[2].name = text.fields[2].name.replace('⏳', pat);
			text.fields[2].value = text.fields[2].value.replace(
				'\n',
				'\n*Maybe he needs more time to catch them?!*\n'
			);
			text.fields[3].name = text.fields[3].name.replace('<:cowoncy:416043450337853441>', roll);
			text.fields[3].value = text.fields[3].value.replace(
				'\n',
				'\n*Oh my.. Does he need more money?*\n'
			);
			text.fields[4].name = text.fields[4].name.replace('🔧', wave);
			text.fields[4].value = text.fields[4].value.replace(
				'\n',
				'\n*Ross probably needs some help!*\n'
			);
			text.fields[5].name = text.fields[5].name.replace('⚔', bongo);
			text.fields[5].value = text.fields[5].value.replace(
				'\n',
				'\n*How about some friend making training!*\n'
			);
			if (text.fields.length >= 9) {
				text.fields[8].name = rainbow + 'ROSS is currently making new friends!';
				text.fields[8].value =
					text.fields[8].value
						.replace(
							'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
							'Awww.. ROSS isnt done getting new friends yet!\nNEW FRIENDS ADDED IN'
						)
						.replace('ANIMALS CAPTURED', 'FRIENDS ADDED') +
					' ' +
					woah;
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, rainbow)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Awww.. ROSS isn’t done getting new friends yet!`\n' +
						blank +
						' **|** `NEW FRIENDS ADDED IN'
				)
				.replace('ANIMALS CAPTURED', 'FRIENDS ADDED');
			return text;
		case 'password':
			text = text.split('\n')[0].replace(/<:[a-z]bot:[0-9]+>/gi, rainbow);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, rainbow)
				.replace('`BEEP BOOP. `', '')
				.replace('cowoncy', 'cowoncy and you’re ready to find friends!')
				.replace('ANIMALS', 'FRIENDS');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, rainbow)
				.replace('BEEP BOOP. I AM BACK WITH', 'ROSS IS BACK WITH')
				.replace('ANIMALS', 'FRIENDS');
			return text;
		default:
			return text;
	}
}

/* eslint-disable-next-line */
function kirito(text, type) {
	const bot = '<a:bot:737118875585478767>';
	const efficiency = '<:eff:737118875757445180>';
	const duration = '<:dur:737118875879211128>';
	const cost = '<:cost:737118875530821652>';
	const gain = '<:gain:737118875618902078>';
	const exp = '<:exp:737118875623096373>';
	const radar = '<:radar:737118875703050310>';
	const essence = '<:ess:737118875400929374>';
	switch (type) {
		case 'hb':
			text.author.name = 'Daaarling! I will hunt down Klaxosaurs for you with my Franxx!';
			text.author.icon_url = 'https://cdn.discordapp.com/emojis/580749862279184394.gif?v=1';
			text.fields[0].name =
				'Oh no! There seems to be Klaxosaurs heading to attack Plantation 13, shall I take them down?';
			text.color = 15450599;
			text.fields[1].name = text.fields[1].name.replace(
				'⏱ Efficiency',
				efficiency + ' Klaxosaurs to Hunt'
			);
			text.fields[1].value =
				'*How many Klaxosaurs would you like me to hunt down?*\n' + text.fields[1].value;
			text.fields[2].name = text.fields[2].name.replace(
				'⏳ Duration',
				duration + ' Klaxosaur Hunting Duration'
			);
			text.fields[2].value =
				'*How long would you like to send me out for?*\n' + text.fields[2].value;
			text.fields[3].name = text.fields[3].name.replace(
				'<:cowoncy:416043450337853441> Cost',
				cost + ' Hunting Funds'
			);
			text.fields[3].value =
				'*How much will I be rewarded with for my hunting?*\n' + text.fields[3].value;
			text.fields[4].name = text.fields[4].name.replace('🔧 Gain', gain + ' Klaxosaur Points');
			text.fields[4].value =
				'*How many Klaxosaur Points will I gather from hunting them down?*\n' +
				text.fields[4].value;
			text.fields[5].name = text.fields[5].name.replace('⚔ Experience', exp + ' Franxx XP');
			text.fields[5].value = '*How can I enhance my Franxx?*\n' + text.fields[5].value;
			text.fields[6].name = text.fields[6].name.replace('📡 Radar', radar + ' VIRM Elimination');
			text.fields[6].value =
				'*Shall I eliminate VIRM today? They seem pretty tough..*\n' + text.fields[6].value;
			text.fields[7].name = text.fields[7].name.replace(
				'<a:essence:451638978299428875> Animal Essence',
				essence + ' Franxx Points'
			);
			if (text.fields.length >= 9) {
				text.fields[8].name = bot + 'Zero Two is currently hunting!';
				text.fields[8].value = text.fields[8].value
					.replace(
						'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
						'Daaarling! I am still hunting down Klaxosaurs. I will return in'
					)
					.replace('DONE', 'done')
					.replace('ANIMALS CAPTURED', 'Klaxosaurs Hunted');
			}
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bot)
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Daaarling! I am still hunting down Klaxosaurs. I will return in'
				)
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'Klaxosaurs Hunted');
			return text;
		case 'password':
			text = text.split('\n')[0].replace(/<:[a-z]bot:[0-9]+>/gi, bot);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bot)
				.replace('BEEP BOOP.', 'Daaarling!')
				.replace('YOU SPENT', 'You spent')
				.replace('I WILL BE BACK IN', 'I will return in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'Klaxosaurs')
				.replace('ESSENCE, AND', 'Franxx Points, and')
				.replace('EXPERIENCE', 'Franxx XP.');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, bot)
				.replace('BEEP BOOP. I AM BACK WITH', 'Daaarling! I am back with')
				.replace('ANIMALS', 'Klaxosaurs')
				.replace('ESSENCE, AND', 'Franxx Points, and')
				.replace('EXPERIENCE', 'Franxx XP');
			return text;
		default:
			return text;
	}
}

function xmelanie(text, type) {
	switch (type) {
		case 'hb':
			text.color = 4584447;
			text.fields[0].name =
				'<:mickey:747723512768102453> Day of Disney <a:castle:747723513758220339>';
			text.fields[1].name = text.fields[1].name.replace(
				'⏱ Efficiency',
				'<a:bb8:747725839222964294> Fastpass <a:groot:747725839340273674>'
			);
			text.fields[2].name = text.fields[2].name.replace(
				'⏳ Duration',
				'<a:castle:747723513758220339> Park hours <:thumbsup:747725838459338833>'
			);
			text.fields[3].name = text.fields[3].name.replace(
				'<:cowoncy:416043450337853441> Cost',
				'<:disneydollars:747725838417526807> Disney Dollars <:disneydollars:747725838417526807>'
			);
			text.fields[4].name = text.fields[4].name.replace(
				'🔧 Gain',
				'<:elpdrum:747725838924906576> Memories <a:once_upon_a_dream:747725839021506670>'
			);
			text.fields[5].name = text.fields[5].name.replace(
				'⚔ Experience',
				'<a:blancheneige:747725839025700884> Where dreams come true <a:d_marie:747725839403188234>'
			);
			text.fields[6].name = text.fields[6].name.replace(
				'📡 Radar',
				'<a:cute_sparks:747725838077788328> Pixy Dust <a:cute_sparks:747725838077788328>'
			);
			text.fields[7].name = text.fields[7].name.replace(
				'<a:essence:451638978299428875> Animal Essence',
				'<a:fairy_god_mother:747725839440805888> Magic of Disney <a:bippity_boppity_boo:747725838564458516>'
			);
			return text;
		default:
			return text;
	}
}

function arichy(text, type) {
	switch (type) {
		case 'hb':
			text.author.name = "Arichy’s Wizard's Sanctum";
			text.fields[0].name =
				'<a:1_:839769859193831434> Welcome to our Sanctuary of Magic. I’m Ari, the Archmage of this Kingdom.';
			text.fields[0].value =
				'There are some tips which will help you feel like home.' +
				'\nIn our Kingdom we have Well of Power - you can use it for increasing your power and meet more allies.' +
				'\nTo upgrade one of traits, use the spell `owo upgrade {trait}`.' +
				'\nTo obtain more power, use `owo sacrifice {animal} {count}`.' +
				"\nDon't worry, it will not harm any of our friends - you can visit them anytime in their Villages.";
			text.fields[1].name = text.fields[1].name.replace(
				'⏱ Efficiency',
				'<:7_:839769858958032936> Thermal Void'
			);
			text.fields[2].name = text.fields[2].name.replace(
				'⏳ Duration',
				'<:6_:839769859130785822> Time Warp'
			);
			text.fields[3].name = text.fields[3].name.replace(
				'<:cowoncy:416043450337853441> Cost',
				'<:5_:839769858987261972> Mana'
			);
			text.fields[4].name = text.fields[4].name.replace(
				'🔧 Gain',
				'<:4_:839769858841640981> Arcane Power'
			);
			text.fields[5].name = text.fields[5].name.replace(
				'⚔ Experience',
				'<:3_:839769858975334400> Intellect'
			);
			text.fields[6].name = text.fields[6].name.replace(
				'📡 Radar',
				'<:2_:839769858932736020> Supernova'
			);
			text.fields[7].name = text.fields[7].name.replace(
				'<a:essence:451638978299428875> Animal Essence',
				'<a:1_:839769859193831434> Well of Power'
			);
			if (text.fields.length >= 9) {
				text.fields[8].name = '<a:11_:839770046867439669> The Archmage is currently on a mission!';
				text.fields[8].value = text.fields[8].value
					.replace(
						'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
						'If you have something urgent, please leave a message. I will be back in'
					)
					.replace('DONE', 'of dungeon passed')
					.replace('ANIMALS CAPTURED', 'Animals joined Kingdom');
			}
			text.thumbnail = {
				url: 'https://i.imgur.com/bWhw90x.gif',
			};
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, '<a:11_:839770046867439669>')
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'If you have something urgent, please leave a message. I will be back in'
				)
				.replace('DONE', 'of dungeon passed')
				.replace('ANIMALS CAPTURED', 'Animals joined Kingdom');
			return text;
		default:
			return text;
	}
}

function capz(text, type) {
	const emoji1 = '<:emoji1:1016115443473338418>';
	const emoji2 = '<:emoji2:1016115444811321354>';
	const emoji3 = '<:emoji3:1016115442189860935>';
	switch (type) {
		case 'hb':
			text.color = 10850303;
			text.title =
				'<:hb:993769506184900659> `Howdy! I am ready to search for pets to make new friends!`';
			text.fields[1].name = text.fields[1].name.replace(
				efficiency,
				'<:efficiency:993769502095454229> '
			);
			text.fields[2].name = text.fields[2].name.replace(
				duration,
				'<:duration:993769501122379827> '
			);
			text.fields[3].name = text.fields[3].name.replace(cowoncy, '<:cost:993769499973140552>');
			text.fields[4].name = text.fields[4].name.replace(gain, '<:gain:993769505169870870> ');
			text.fields[5].name = text.fields[5].name.replace(experience, '<:exp:993769504360378413> ');
			text.fields[6].name = text.fields[6].name.replace(radar, '<:radar:1016113320127901746>');
			text.fields[7].name = text.fields[7].name
				.replace(essence, '<:essence:993769503349542922>')
				.replace('Animal', 'Empowered');
			if (text.fields.length >= 9) {
				text.fields[8].name = '<:searching:993769508693090315> I am still searching for pets!';
				text.fields[8].value = text.fields[8].value
					.replace(
						'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
						'Capz, I am still searching for pets! I will return in'
					)
					.replace('`\n', '.`\n')
					.replace('DONE', 'done')
					.replace('ANIMALS CAPTURED', 'pets found!');
			}
			text.fields.shift();
			text.author.name = text.author.name.replace('HuntBot', 'Huntbot');
			return text;
		case 'progress':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, '<:searching:993769508693090315>')
				.replace(
					'BEEP BOOP. I AM STILL HUNTING. I WILL BE BACK IN',
					'Capz, I am still searching for pets! I will return in'
				)
				.replace('`\n', '.`\n')
				.replace('DONE', 'done')
				.replace('ANIMALS CAPTURED', 'pets found!');
			return text;
		case 'returned':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, emoji1)
				.replace('BEEP BOOP. I AM BACK WITH', 'Capz, I have returned with')
				.replace('ANIMALS', 'pets')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience.');
			return text;
		case 'password':
			text = text.replace(/<:[a-z]bot:[0-9]+>/gi, emoji2);
			return text;
		case 'spent':
			text = text
				.replace(/<:[a-z]bot:[0-9]+>/gi, emoji3)
				.replace(/BEEP BOOP\. `\*\*`[^`]+`\*\*`, YOU SPENT/gi, 'Capz, you spent')
				.replace('I WILL BE BACK IN', 'I will return in')
				.replace('WITH', 'with')
				.replace('ANIMALS', 'pets')
				.replace('ESSENCE, AND', 'essence, and')
				.replace('EXPERIENCE', 'experience.');
			return text;
		default:
			return text;
	}
}
