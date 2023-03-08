/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
 */

const _blank = '<:blank:427371936482328596>';

exports.alter = async function (p, user, text, type, setting) {
	const result = await checkDb(p, user.id, text, type);
	if (result) return result;
	switch (p.msg.channel.id) {
		case '1054101525191995502':
			return quincey(text, type, setting);
		case '1056148694480715886':
			return quincey(text, type, setting);
		case '1056148656572596264':
			return quincey(text, type, setting);
	}
	switch (user.id) {
		case '176046069954641921':
			return crown(text, type);
		case '250383887312748545':
			return elsa(text, type);
		case '323347251705544704':
			return rikudou(text, type);
		case '192692796841263104':
			return dalu(text, type);
		case '283000589976338432':
			return kuma(text, type);
		case '536711790558576651':
			return garcom(text);
		case '229299825072537601':
			return alradio(text, type);
		case '166619476479967232':
			return valentine(text, type);
		case '403989717483257877':
			return u_1s1k(text, type);
		case '648741213154836500':
			return lanre(text, type);
		case '541103499992367115':
			return ashley(text, type);
		case '216710431572492289':
			return arichy(text, type);
		case '408875125283225621':
			return kirito(text, type);
		case '707939636835516457':
			return direwolf(text, type);
		case '468873774960476177':
			return jiraya(text, type);
		case '554617574646874113':
			return notJames(text, type);
		case '362964690248269824':
			return theGoldenPatrik1(text, type);
		case '456598711590715403':
			return lexx(text, type);
		case '617681365567275029':
			return mercureid(text, type);
		case '477168699112161281':
			return leshoop(text, user, type);
		case '612158581113880576':
			return blade(text, type);
		case '643225088123994118':
			return becca(text, type);
		case '691867503730622526':
			return wibi(text, type);
		case '663719460108107786':
			return jekyll(text, type);
		case '486067285333639169':
			return life(text, type);
		case '387975555233873920':
			return scox(text, type);
		case '460987842961866762':
			return estee(text, type);
		default:
			return text;
	}
};

exports.overrideDisplay = function (p, display) {
	switch (p.msg.channel.id) {
		case '1054101525191995502':
			return 'compact';
		case '1056148694480715886':
			return 'compact';
		case '1056148656572596264':
			return 'compact';
	}
	return display;
};

async function checkDb(p, id, text, info) {
	if (!info) return;

	let type;
	switch (text.color) {
		case 65280:
			type = 'win';
			break;
		case 16711680:
			type = 'lose';
			break;
		case 6381923:
			type = 'tie';
			break;
	}
	const replacers = {
		username: p.msg.author.username,
		discriminator: p.msg.author.discriminator,
		blank: p.config.emoji.blank,
		streak: info.streak,
		turns: info.turns,
		xp: info.xp,
		allyTeam: text.fields[0].name,
		enemyTeam: text.fields[1].name,
	};

	const sql = `SELECT alterbattle.* from alterbattle INNER JOIN user ON alterbattle.uid = user.uid WHERE user.id = ${p.msg.author.id} AND alterbattle.type = '${type}'`;
	const result = (await p.query(sql))[0];
	if (!result || !result.updated_at) return;

	let embed = {
		description: text.description,
		fields: text.fields,
		title: p.global.replacer(result.title, replacers),
		color: result.color || 1,
	};
	if (result.sideImg) {
		embed.thumbnail = { url: result.sideImg };
	}
	if (result.footer) {
		embed.footer = { text: p.global.replacer(result.footer, replacers) };
	}
	if (result.bottomImg) {
		embed.image = { url: result.bottomImg || text.image?.url };
	}
	if (result.author) {
		embed.author = {
			name: p.global.replacer(result.author, replacers),
			icon_url: result.showAvatar ? p.msg.author.avatarURL : null,
		};
	}

	return embed;
}

function crown(text) {
	text.thumbnail = {
		url: 'http://cdn.discordapp.com/attachments/598115387158036500/615856437708455936/image0.gif',
	};
	text.author.name =
		'Someone accidently stepped on ' + text.author.name.replace(' goes into battle', "'s garden");
	text.color = 16776960;
	return text;
}

function elsa(text) {
	text.thumbnail = {
		url: 'https://i.imgur.com/HovVT8A.gif',
	};
	text.color = 7319500;
	text.author.name = text.author.name.replace(
		' goes into battle!',
		"'s Knights fight for their Queen's Glory!"
	);
	return text;
}

function rikudou(text) {
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/598318102307930114/620814063764766725/image0.gif',
	};
	text.color = 255;
	text.author.name = 'Rikudou Sennin Arrives on the Battlefield';
	return text;
}

function dalu(text) {
	text.thumbnail = {
		url: 'https://i.imgur.com/iks7lY3.gif',
	};
	text.color = 63996;
	text.author.name = text.author.name.replace(' goes into battle!', ' starts it off with a bite!');
	return text;
}

function kuma(text) {
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/emojis/674153774088060957.png',
	};
	text.author.name = text.author.name.replace(
		' goes into battle!',
		"'s minions defend the Cookie King"
	);
	return text;
}

function garcom(text) {
	text.author.name = '전투를 시작합니다!';
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/674765942445703198/676257154893873172/C8fHZTfVYAIaFOc.png',
	};
	return text;
}

function alradio(text) {
	text.author.name =
		'...then he\'d broadcast his carnage all throughout Hell, just so everyone could witness his ability. Sinners started calling him, "The Radio Demon."';
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/626155987904102402/686473789080600586/image0.gif',
	};
	switch (text.color) {
		case 16711680:
			text.color = 1;
			break;
		case 65280:
			text.color = 16777214;
			break;
	}
	return text;
}

function valentine(text, opt) {
	const _star = '<a:star:759725222042927124>';
	const _sadcat = '<a:sadcat:759725223423115266>';
	text.author.name = text.author.name.replace(
		' goes into battle!',
		"'s Sailors arrive to defend Planet Earth!"
	);
	switch (text.color) {
		case 16711680:
			text.color = 13767684;
			if (opt) {
				text.footer.text = `ダーク・キングダム took over in ${opt.turns}. You lost your streak of ${opt.streak} and gained ${opt.xp} xp.`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/533065456311861248/761460204407226398/tenor.gif',
			};
			break;
		case 65280:
			text.color = 1;
			if (opt) {
				text.footer.text = `You defended in ${opt.turns}! Your Sailors gained ${opt.xp} xp! Streak: ${opt.streak}`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/533065456311861248/761168912795828234/battle.gif',
			};
			break;
	}
	return text;
}

function u_1s1k(text, opt) {
	text.author.name = text.author.name.replace(
		' goes into battle!',
		' goes Pew Pew Pew! Come At Me Bro!'
	);
	switch (text.color) {
		case 16711680:
			if (opt) {
				text.footer.text = `You lost in ${opt.turns}! Your Sailors gained ${opt.xp} xp! You lost your streak of ${opt.streak}`;
			}
			break;
		case 65280:
			text.color = 11393254;
			if (opt) {
				text.footer.text = `SUGOI! 1S1K won in ${opt.turns} turns! Team Zeno gained ${opt.xp} xp! Streak: ${opt.streak}`;
			}
			break;
	}
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/628936051490160661/758015069379493888/image0.gif',
	};
	return text;
}

function lanre(text, opt) {
	text.author.name = 'Kanna San rides into battle with you! Bye bye bad guys!';
	switch (text.color) {
		case 16711680:
			text.color = 1262169;
			if (opt) {
				text.footer.text = `Looks like chu met the wrong foe today fren. Fear not! Kanna has brought chu 50 chocolates to cheer chu up...rip ${opt.streak} streak`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/696512326114869289/767336849801740329/kl1love.png',
			};
			break;
		case 65280:
			text.color = 5249624;
			if (opt) {
				text.footer.text = `You defended in ${opt.turns}! Your Sailors gained ${opt.xp} xp! Streak: ${opt.streak}`;
				if (('' + opt.xp).includes('+')) {
					text.footer.text = `Victory! Kanna has brought you ${opt.xp} bonus chocolates, which she will eat for herself. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: 'https://media.discordapp.net/attachments/696512326114869289/767334256543924244/kannafire.gif',
					};
				} else {
					text.footer.text = `Victory! Kanna has brought you ${opt.xp} chocolates to enjoy under the kotatsu. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: 'https://cdn.discordapp.com/emojis/555488195387850753.gif',
					};
				}
			}
			break;
		case 6381923:
			text.color = 535886;
			text.footer.text =
				'Waw, that was a strong enemy. Kanna is very sleepy, but you can eat her 100 chocolates before she wakes';
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/696512326114869289/767336752988815380/470728420549197825_1.png',
			};
			break;
	}
	return text;
}

function ashley(text, opt) {
	text.author.name = text.author.name.replace(
		' goes into battle!',
		' tries to wreck the enemy team!'
	);
	switch (text.color) {
		case 16711680:
			text.color = 2593784;
			if (opt) {
				text.footer.text = `The enemy stopped your destruction in ${opt.turns} turns.  You lost your wrecking streak of ${opt.streak} and gained 50xp`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/661043173992169482/760890693778145280/felix_win.gif',
			};
			break;
		case 65280:
			text.color = 9502720;
			if (opt) {
				text.footer.text = `You wrecked the enemy in ${opt.turns} turns! Your team gained ${opt.xp} xp! Teams wrecked: ${opt.streak}`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/661043173992169482/760890400734052462/ralph_win.gif',
			};
			break;
	}
	return text;
}

function arichy(text, opt) {
	text.author.name = text.author.name.replace(
		' goes into battle!',
		', your Mage goes into the dungeon with her animal friends. They met a strong enemy :O'
	);
	switch (text.color) {
		case 16711680:
			if (opt) {
				text.footer.text = `Oh no! The enemy was too strong! You lost in ${opt.turns} turns! Your team gained 50xp and lost their streak of ${opt.streak}... Try again!`;
			}
			break;
		case 65280:
			if (opt) {
				text.footer.text = `Dungeon Complete! You won in ${opt.turns} turns! Your team gained ${opt.xp} xp. Streak ${opt.streak}`;
			}
			break;
		case 6381923:
			if (opt) {
				text.footer.text = `Oh, what a fight! You tried your best and both got exhausted. It's a tie! Your team gained ${opt.xp} xp! GG!`;
			}
			break;
	}
	text.thumbnail = {
		url: 'https://i.imgur.com/vvpFulp.gif',
	};
	return text;
}

function kirito(text, opt) {
	text.author.name =
		'Zero Two pilots Strelizia into battle with her darling! Slaughtering the klaxosaurs in their way. *rawr*';
	switch (text.color) {
		case 16711680:
			text.color = 2500198;
			if (opt) {
				text.footer.text = `Ouch. The klaxosaurs managed to invade Cerasus within ${opt.turns} turns, losing your streak of ${opt.streak} wins. But don't fret, darling is here to lift your spirits!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/731399149307691008/786994818118057984/shecry.jpg',
			};
			break;
		case 65280:
			text.color = 15450599;
			if (opt) {
				if (('' + opt.xp).includes('+')) {
					text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Gaining ${opt.xp} klaxosaur xp to empower her franxx with! You also reward her with a day to the beach. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: 'https://cdn.discordapp.com/attachments/731399149307691008/786993695936872489/beachcutie.gif',
					};
				} else {
					if (Math.random() < 0.5) {
						text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Bringing back ${opt.xp} honey bread and ham to snack on with her darling. Streak: ${opt.streak}`;
						text.thumbnail = {
							url: 'https://cdn.discordapp.com/attachments/731399149307691008/786992280014684160/honey.gif',
						};
					} else {
						text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Gaining ${opt.xp} klaxosaur xp to empower her franxx with! You also set her to shower after shedding lots of sweat. Streak: ${opt.streak}`;
						text.thumbnail = {
							url: 'https://cdn.discordapp.com/attachments/731399149307691008/787737189454315520/wateruwuwuwu.gif',
						};
					}
				}
			}
			break;
		case 6381923:
			text.color = 5560773;
			if (opt) {
				text.footer.text = `Sheesh, close one. Zero Two will kill them next time! Here's 100 pats for now. Streak: ${opt.streak}`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/731399149307691008/786993997633159219/headpattie.png',
			};
			break;
	}
	return text;
}

function direwolf(text, opt) {
	text.author.name = 'Lucy and Yukino go into battle and open the TWELVE ZODIAC GATES!';
	switch (text.color) {
		case 16711680:
			text.color = 16023551;
			if (opt) {
				text.footer.text = `The Celestial Spirits vanish! Lucy cries out for Natsu's help! You lost in ${opt.turns}! RIP ${opt.streak} KILLING SPREE!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/784165154798567444/image0.jpg',
			};
			break;
		case 65280:
			text.color = 1709784;
			if (opt) {
				text.footer.text = `Lucy x Yukino are VICTORIOUS! You won in ${opt.turns} turns and your team gained ${opt.xp}! Vanquished: ${opt.streak}!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/784164939421581342/image0.gif',
			};
			break;
		case 6381923:
			text.color = 11796735;
			if (opt) {
				text.footer.text = `What magical presence! The enemy remains at large! Natsu arrives on the scene enraged! Lucy x Yukino gain ${opt.xp}! Streak: ${opt.streak}!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/784164939987157013/image1.gif',
			};
			break;
	}
	return text;
}

function jiraya(text, opt) {
	text.author.name = 'Gojo Satoru and Itadori Yuji goes into battle against curses!';
	switch (text.color) {
		// lost
		case 16711680:
			text.color = 10027008;
			if (opt) {
				text.footer.text = `Oh no! Sukuna takes over Yuji and lays his Domain over Gojo's Domain. Gojo's Domain has shattered. Your streak of ${opt.streak} is broken! You lost in ${opt.turns} turns!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/811783217031413801/image2.gif',
			};
			break;

		// win
		case 65280:
			text.color = 2364785;
			if (opt) {
				text.footer.text = `Gojo used his domain expansion, Infinite Void and killed all the curses! You won in ${opt.turns} turns and your team gained ${opt.xp} xp! You've defeated a total of: ${opt.streak} curses!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/811783212548227072/image0.gif',
			};
			break;

		//tie
		case 6381923:
			text.color = 16753920;
			if (opt) {
				text.footer.text = `Sukuna takes over Yuji, but Yuji fights him and doesn't let him win. Gojo and Yuji gain ${opt.xp} xp! Streak: ${opt.streak}!`;
			}
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/771398927912009738/811783213965770822/image1.gif',
			};
			break;
	}
	return text;
}

function notJames(text, opt) {
	switch (text.color) {
		// lost
		case 16711680:
			if (opt) {
				text.author.name = 'chem has arrived to protect the Fallen Stars from outerspace invaders!';
				text.footer.text = `Defeat || Collected: 50 stardust || Lost: ${opt.streak} booms :c`;
			}
			text.color = 1262169;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/769619375296610304/809631784752644106/cry.png',
			};
			break;

		// win
		case 65280:
			if (opt) {
				const stardust = ('' + opt.xp).includes('+') ? 'bonus stardust' : 'stardust';
				text.author.name =
					'james has arrived to protect the Fallen Stars from outerspace invaders!';
				if (opt.streak % 10000 == 0) {
					text.footer.text = `Victory || Collected: ${opt.xp} bonus star shards || Boomoos: ${opt.streak}`;
				} else if (opt.streak % 1000 == 0) {
					text.footer.text = `Victory || Collected: ${opt.xp} bonus star shards || Boomieos: ${opt.streak}`;
				} else if (opt.streak % 100 == 0) {
					text.footer.text = `Victory || Collected: ${opt.xp} bonus star shards || Boomies: ${opt.streak}`;
				} else if (opt.streak % 10 == 0) {
					text.footer.text = `Victory || Collected: ${opt.xp} bonus star shards || Booms: ${opt.streak}`;
				} else {
					text.footer.text = `Victory || Collected: ${opt.xp} ${stardust} || Booms: ${opt.streak}`;
				}
			}
			text.color = 1190467;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/769619375296610304/809631713624981564/official_cheer.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.author.name =
					'james has arrived to protect the Fallen Stars from outerspace invaders!';
				text.footer.text = `Tie || Collected: ${opt.xp} star fragments || Booms: ${opt.streak}`;
			}
			text.color = 4539717;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/759231534238269460/851260748192940052/0b004b50f2700762eb850e27e8a9b504.gif',
			};
			break;
	}
	return text;
}

function theGoldenPatrik1(text, opt) {
	text.author.name = 'The Balrog has entered Khazad-dûm!';
	switch (text.color) {
		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `The Wizard was too strong today and you shall have to return to the Shadow for a time. You lost your streak of ${opt.streak} wins in ${opt.turns} turns`;
			}
			text.color = 16777215;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/809113796756111370/809114509872463962/Loss.gif',
			};
			break;

		// win
		case 65280:
			if (opt) {
				if (('' + opt.xp).includes('+')) {
					text.footer.text = `What a spectacular triumph! You conquered in ${opt.turns} turns and gained ${opt.xp} xp. Streak: ${opt.streak}.`;
				} else {
					text.footer.text = `Yet another victory! You conquered in ${opt.turns} turns and gained ${opt.xp} xp. Streak: ${opt.streak}.`;
				}
			}
			text.color = 16747520;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/809113796756111370/809114336831209482/Win.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `Wow, that Wizard is stronger than he looks! You stalemated but still gained ${opt.xp} xp. Streak: ${opt.streak}.`;
			}
			text.color = 8421504;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/809113796756111370/809114422630940733/Tie.gif',
			};
			break;
	}
	return text;
}

function lexx(text) {
	text.author.name = 'lexx takes one look and says: "Lets do this"';
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/696878982758531152/838655892932395028/Roberto.png',
	};
	return text;
}

function mercureid(text, opt) {
	text.author.name = 'Mario and Luigi embark on a journey to rescue Princess Peach!';
	switch (text.color) {
		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Mamma mia... You lost in ${opt.turns} turns and failed to rescue Princess Peach from the gnarly, fire-breathing Bowser :( . You receive ${opt.xp} mushrooms. Goombas destroyed: ${opt.streak}`;
			}
			text.color = 9722954;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/815743547449016400/816246705417617448/053c39f4c14d99d4bc143c05dc3ca219.gif',
			};
			break;

		// win
		case 65280:
			if (opt) {
				text.footer.text = `Yahoo! In ${opt.turns} turns, you managed to jump through gaps and obstacles and save the Mushroom Kingdom! You receive ${opt.xp} mushrooms from Toad. Goombas destroyed: ${opt.streak}`;
			}
			text.color = 14381560;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/815743547449016400/816246705770725386/source.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `Oh no! Bowser's minions were too strong :( . Luckily, you still have a spare 1-up mushroom to use. You receive ${opt.xp} mushrooms. Goombas destroyed: ${opt.streak}`;
			}
			text.color = 65475;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/815743547449016400/816246706051219456/giphy_1.gif',
			};
			break;
	}
	return text;
}

function leshoop(text, user, opt) {
	text.author.name = `${user.username} goes into battle!`;
	switch (text.color) {
		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `An astounding battle, but alas, your team was defeated in ${opt.turns} turns to gain a mere ${opt.xp} xp. You lost your streak of ${opt.streak} wins. ~ Until we meet again...`;
			}
			text.color = 16711680;
			break;

		// win
		case 65280:
			if (opt) {
				text.footer.text = `Together we fight, and in ${opt.turns} turns achieve victory! Your team gained ${opt.xp} xp! Streak: ${opt.streak}`;
			}
			text.color = 10904029;
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `There is no instance of a nation benefitting from prolonged warfare ~ After 20 turns, we agree upon peace. Your team gained ${opt.xp} xp! Streak: ${opt.streak}`;
			}
			text.color = 12895184;
			break;
	}
	text.thumbnail = {
		url: 'https://media1.tenor.com/images/93f5876e82ae575a6c4b4613d57f6e29/tenor.gif',
	};
	return text;
}

function blade(text, opt) {
	text.author.name = 'BLaDe goes into brutal fight against deadly sins!';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `BLaDe uses his Telepathic abilities and gains control over enemy's mind.! You won in ${opt.turns} hits and gained ${opt.xp} xp! You've defeated a total of ${opt.streak} sins!`;
			}
			text.color = 65511;
			text.thumbnail = {
				url: 'https://i.imgur.com/QCUu8Jl.gif',
			};
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Oops! BLaDe lost his Telepathic abilities while facing strong sins and got killed. He'll now be reborn! Your streak of killing ${opt.streak} sins is smashed! You lost after ${opt.turns} hits!`;
			}
			text.color = 16734464;
			text.thumbnail = {
				url: 'https://i.imgur.com/lG1bJJu.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `BLaDe uses Telepathy, but the sins were strong enough to withstand it for ${opt.turns} hits! You gain ${opt.xp} xp and killed a total of ${opt.streak} sins!`;
			}
			text.color = 7708416;
			text.thumbnail = {
				url: 'https://i.imgur.com/7rbtiBX.gif',
			};
			break;
	}
	return text;
}

function becca(text, opt) {
	text.author.name = 'Becca is here! kenapa, tidak suka? Maju lo sini Jingan!';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `Anjass! Selow, benerin dulu tim Lu bagusin dulu weapon Lu baru ngajak gelud ngOokey!! Canda bahh, Becca bagi-bagi ${opt.xp} Boba Mwahh! 🌻 streak : ${opt.streak}`;
			}
			text.color = 16739566;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/818819441281728543/822653290146824192/image0-3.gif',
			};
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Owo jingan! ngebug! Tidak ada Boba lagi anying! streak: ${opt.streak}`;
			}
			text.color = 11158527;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/818819441281728543/822653289770254386/image3-1.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `Waduh boleh juga Lu! Jangan cepat puas ini masih TIE bukan LOSE!! Canda wehhh, Becca bagi-bagi ${opt.xp} Boba Mwahh! streak : ${opt.streak}`;
			}
			text.color = 10878897;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/818819441281728543/822666934570188820/image3.gif',
			};
			break;
	}
	return text;
}

function wibi(text, opt) {
	text.author.name =
		'Hela resurrected her army of Berserkers and Fenris by using a handful of the Eternal Flame!';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `Hela used her Necroswords to slaughter all of the Valkyries in ${opt.turns} turns! when a Valkyrie is killed she gains ${opt.xp} Powers of Darkness! Kneel... before your Queen! 🌹 Streak: ${opt.streak}`;
			}
			text.color = 16711900;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/822630852613242891/823895147359764540/20210323_191545.gif',
			};
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Hela was then defenseless as she witnessed Surtur lift up his Twilight Sword high above his head and prepared to fulfill his destiny once and for all. Streak: ${opt.streak}`;
			}
			text.color = 16216430;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/822630852613242891/823895470950449172/main-qimg-aced64c8262f98155571b0f61432da56.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `Now, Hela turned out to be too powerful, and as Odin’s true heir, she was tied to Asgard. Thor realized he was not going to be able to defeat her! Streak: ${opt.streak}`;
			}
			text.color = 14549247;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/822630852613242891/823895279350186014/20210323_192109.gif',
			};
			break;
	}
	return text;
}

function jekyll(text, opt) {
	text.author.name = 'You and Levi Ackerman goes into the Ragako village to fight the titans!';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `Uwaa!! You're skillfully kill the titan to save your team from being eaten by it in just ${opt.turns} turns. You receive ${opt.xp} energies from the battle. Streak : ${opt.streak}`;
			}
			text.color = 9002290;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/779341346812592131/825282484014940170/7UZ2.gif',
			};
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Sigh... You face such a powerful titan. You failed to save your team from being eaten by a titan in ${opt.turns} turns only. You receive ${opt.xp} energies from the battle. Streak : ${opt.streak}`;
			}
			text.color = 16777211;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/779341346812592131/829027535076458557/48378.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `Wew! Your team has survived from a long battle.  Let's retreat until we become stronger to defeat the titans. You receive ${opt.xp} energies from the battle. Streak : ${opt.streak}`;
			}
			text.color = 1907739;
			text.thumbnail = {
				url: 'https://cdn.discordapp.com/attachments/779341346812592131/829027577301041173/original.gif',
			};
			break;
	}
	return text;
}

function life(text, opt) {
	text.author.name = 'Kira goes into battle alongside Ryuk with his Deathnote';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `=> Kira opens his Deathnote and writes the name of his enemy, enemy is dead, they won in ${opt.turns} turns!, They gained ${opt.xp}! Streak: ${opt.streak}`;
			}
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `=> Kira loses in ${opt.turns}!, Ryuk writes Kira's name on his Deathnote as promised Kira gained ${opt.xp}! Streak: ${opt.streak}`;
			}
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `=> Kira opens his Deathnote and writes the name his of enemy, enemy came up with fake name , they tied in ${opt.turns} turns!, They gained ${opt.xp}! Streak: ${opt.streak}`;
			}
			break;
	}
	return text;
}

function scox(text, opt) {
	text.author.name = 'Entering battlefield using all of soul reaper power';
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `With final getsuga tenshou easily defeating all enemies in front off his eyes in ${opt.turns} turns ended up in gaining ${opt.xp} soul reaper powers, too easy for him! streak ${opt.streak}`;
			}
			text.color = 2722246;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/836296917385871390/843240718822408222/image0.gif',
			};
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Somehow, with final getsuga tenshou makes him lost a lot of soul reaper power, he end up by losing all his power! streak ${opt.streak}`;
			}
			text.color = 9807270;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/836296917385871390/843240856575016990/image0.gif',
			};
			break;

		//tie
		case 6381923:
			if (opt) {
				text.footer.text = `But, using final getsuga tenshou with wrong technique make the battle too long, need to think a better strategy! streak ${opt.streak}`;
			}
			text.color = 16187392;
			text.thumbnail = {
				url: 'https://media.discordapp.net/attachments/836296917385871390/843241504880984095/image0.gif',
			};
			break;
	}
	return text;
}

function estee(text, opt) {
	text.author.name =
		'Estee, Slayed the seven realms and battled with the gods. Finally met a strong opponent. ';
	text.thumbnail = {
		url: 'https://cdn.discordapp.com/attachments/810961856977174539/849221395417530398/ezgif.com-gif-maker_5.gif',
	};
	switch (text.color) {
		// win
		case 65280:
			if (opt) {
				text.footer.text = `Death match ended, you won in ${opt.turns} turns, gained ${opt.xp}xp, streak ${opt.streak}`;
			}
			break;

		// lost
		case 16711680:
			if (opt) {
				text.footer.text = `Death match ended, you lost in ${opt.turns} turns, gained ${opt.xp}xp, streak ${opt.streak}`;
			}
			break;
		case 6381923:
			if (opt) {
				text.footer.text = `Death match ended, you tied in ${opt.turns} turns, gained ${opt.xp}xp, streak ${opt.streak}`;
			}
			break;
	}
	return text;
}

/* eslint-disable-next-line */
function quincey(text, opt, { friendlyBattle }) {
	return text;
	/*
	if (!friendlyBattle) {
		return text;
	}
	text.image = {
		url: 'https://media.discordapp.net/attachments/1051442610595708960/1054065287395291186/ezgif-4-fc0dd870e6.gif',
	};
	text.color = 2201331;
	return text;
	*/
}
