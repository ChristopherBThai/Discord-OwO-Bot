/*
 * OwO Bot for Discord
 * Copyright (C) 2020 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const blank = '<:blank:427371936482328596>';
exports.alter = function(id,text,type){
	switch(id){
		case '176046069954641921':
			return crown(text,type);
		case '250383887312748545':
			return elsa(text,type);
		case '323347251705544704':
			return rikudou(text,type);
		case '192692796841263104':
			return dalu(text,type);
		case '283000589976338432':
			return kuma(text,type);
		case '536711790558576651':
			return garcom(text);
		case '229299825072537601':
			return alradio(text,type);
		case '166619476479967232':
			return valentine(text,type);
		case '403989717483257877':
			return u_1s1k(text,type);
		case '648741213154836500':
			return lanre(text,type);
		case '541103499992367115':
			return ashley(text,type);
		case '216710431572492289':
			return arichy(text, type);
		case '408875125283225621':
			return kirito(text, type);
		case '707939636835516457':
			return direwolf(text, type);
		default:
			return text;
	}
}


function crown(text,type){
	text.thumbnail = {
		"url":"http://cdn.discordapp.com/attachments/598115387158036500/615856437708455936/image0.gif"
	}
	text.author.name = "Someone accidently stepped on "+text.author.name.replace(" goes into battle","'s garden");
	text.color = 16776960;
	return text;
}

function elsa(text,type){
	text.thumbnail = {
		"url":"https://i.imgur.com/HovVT8A.gif"
	}
	text.color = 7319500;
	text.author.name = text.author.name.replace(" goes into battle!","'s Knights fight for their Queen's Glory!");
	return text;
}

function rikudou(text,type){
	text.thumbnail = {
		"url":"https://cdn.discordapp.com/attachments/598318102307930114/620814063764766725/image0.gif"
	}
	text.color = 255;
	text.author.name = "Rikudou Sennin Arrives on the Battlefield";
	return text;
}

function dalu(text,type){
	text.thumbnail = {
		"url":"https://i.imgur.com/iks7lY3.gif"
	};
	text.color = 63996;
	text.author.name = text.author.name.replace(" goes into battle!"," starts it off with a bite!");
	return text;
}

function kuma(text,type) {
	text.thumbnail = {
		"url":"https://cdn.discordapp.com/emojis/674153774088060957.png"
	};
	text.author.name = text.author.name.replace(" goes into battle!","'s minions defend the Cookie King");
	return text;

}

function garcom(text,type) {
	text.author.name = "전투를 시작합니다!";
	text.thumbnail = {
		url:"https://cdn.discordapp.com/attachments/674765942445703198/676257154893873172/C8fHZTfVYAIaFOc.png"
	}
	return text;
}

function alradio(text,type) {
	text.author.name = "...then he'd broadcast his carnage all throughout Hell, just so everyone could witness his ability. Sinners started calling him, \"The Radio Demon.\"";
	text.thumbnail = {
		url: "https://cdn.discordapp.com/attachments/626155987904102402/686473789080600586/image0.gif"
	}
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

function valentine(text,opt) {
	const star = "<a:star:759725222042927124>";
	const sadcat = "<a:sadcat:759725223423115266>";
	text.author.name = text.author.name.replace(" goes into battle!","'s Sailors arrive to defend Planet Earth!");
	switch (text.color) {
		case 16711680:
			text.color = 13767684;
			if (opt) {
				text.footer.text = `ダーク・キングダム took over in ${opt.turns}. You lost your streak of ${opt.streak} and gained ${opt.xp} xp.`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/533065456311861248/761460204407226398/tenor.gif"
			}
			break;
		case 65280:
			text.color = 1;
			if (opt) {
				text.footer.text = `You defended in ${opt.turns}! Your Sailors gained ${opt.xp} xp! Streak: ${opt.streak}`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/533065456311861248/761168912795828234/battle.gif"
			}
			break;
	}
	return text;
}

function u_1s1k(text,opt) {
	text.author.name = text.author.name.replace(" goes into battle!"," goes Pew Pew Pew! Come At Me Bro!");
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
		url: "https://cdn.discordapp.com/attachments/628936051490160661/758015069379493888/image0.gif"
	}
	return text;
}

function lanre(text,opt) {
	text.author.name = "Kanna San rides into battle with you! Bye bye bad guys!";
	switch (text.color) {
		case 16711680:
			text.color = 1262169;
			if (opt) {
				text.footer.text = `Looks like chu met the wrong foe today fren. Fear not! Kanna has brought chu 50 chocolates to cheer chu up...rip ${opt.streak} streak`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/696512326114869289/767336849801740329/kl1love.png"
			}
			break;
		case 65280:
			text.color = 5249624;
			if (opt) {
				text.footer.text = `You defended in ${opt.turns}! Your Sailors gained ${opt.xp} xp! Streak: ${opt.streak}`;
				if ((''+opt.xp).includes('+')) {
					text.footer.text = `Victory! Kanna has brought you ${opt.xp} bonus chocolates, which she will eat for herself. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: "https://media.discordapp.net/attachments/696512326114869289/767334256543924244/kannafire.gif"
					}
				} else {
					text.footer.text = `Victory! Kanna has brought you ${opt.xp} chocolates to enjoy under the kotatsu. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: "https://cdn.discordapp.com/emojis/555488195387850753.gif"
					}
				}
			}
			break;
		case 6381923:
			text.color = 535886;
			text.footer.text = `Waw, that was a strong enemy. Kanna is very sleepy, but you can eat her 100 chocolates before she wakes`;
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/696512326114869289/767336752988815380/470728420549197825_1.png"
			}
			break;
	}
	return text;
}

function ashley(text,opt) {
	text.author.name = text.author.name.replace(" goes into battle!"," tries to wreck the enemy team!");
	switch (text.color) {
		case 16711680:
			text.color = 2593784;
			if (opt) {
				text.footer.text = `The enemy stopped your destruction in ${opt.turns} turns.  You lost your wrecking streak of ${opt.streak} and gained 50xp`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/661043173992169482/760890693778145280/felix_win.gif"
			}
			break;
		case 65280:
			text.color = 9502720;
			if (opt) {
				text.footer.text = `You wrecked the enemy in ${opt.turns} turns! Your team gained ${opt.xp} xp! Teams wrecked: ${opt.streak}`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/661043173992169482/760890400734052462/ralph_win.gif"
			}
			break;
	}
	return text;
}

function arichy (text,opt) {
	text.author.name = text.author.name.replace(" goes into battle!",", your Mage goes into the dungeon with her animal friends. They met a strong enemy :O");
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
		url: "https://i.imgur.com/vvpFulp.gif"
	}
	return text;
}

function kirito (text,opt) {
	text.author.name = 'Zero Two pilots Strelizia into battle with her darling! Slaughtering the klaxosaurs in their way. *rawr*';
	switch (text.color) {
		case 16711680:
			text.color = 2500198 
			if (opt) {
				text.footer.text = `Ouch. The klaxosaurs managed to invade Cerasus within ${opt.turns} turns, losing your streak of ${opt.streak} wins. But don't fret, darling is here to lift your spirits!`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/731399149307691008/786994818118057984/shecry.jpg"
			}
			break;
		case 65280:
			text.color = 15450599;
			if (opt) {
				if (!(''+opt.xp).includes('+')) {
					text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Gaining ${opt.xp} klaxosaur xp to empower her franxx with! You also reward her with a day to the beach. Streak: ${opt.streak}`;
					text.thumbnail = {
						url: "https://cdn.discordapp.com/attachments/731399149307691008/786993695936872489/beachcutie.gif"
					}
				} else {
					if (Math.random() < .5) {
						text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Bringing back ${opt.xp} honey bread and ham to snack on with her darling. Streak: ${opt.streak}`;
						text.thumbnail = {
							url: "https://cdn.discordapp.com/attachments/731399149307691008/786992280014684160/honey.gif"
						}
					} else {
						text.footer.text = `Zero Two managed to clear the battlefield out of klaxosaurs in ${opt.turns} turns! Gaining ${opt.xp} klaxosaur xp to empower her franxx with! You also set her to shower after shedding lots of sweat. Streak: ${opt.streak}`;
						text.thumbnail = {
							url: "https://cdn.discordapp.com/attachments/731399149307691008/787737189454315520/wateruwuwuwu.gif"
						}
					}

				}
			}
			break;
		case 6381923:
			text.color = 5560773
			if (opt) {
				text.footer.text = `Sheesh, close one. Zero Two will kill them next time! Here's 100 pats for now. Streak: ${opt.streak}`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/731399149307691008/786993997633159219/headpattie.png"
			}
			break;
	}
	return text;
}

function direwolf (text,opt) {
	text.author.name = 'Lucy and Yukino go into battle and open the TWELVE ZODIAC GATES!';
	switch (text.color) {
		case 16711680:
			text.color = 16023551; 
			if (opt) {
				text.footer.text = `The Celestial Spirits vanish! Lucy cries out for Natsu's help! You lost in ${opt.turns}! RIP ${opt.streak} KILLING SPREE!`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/771398927912009738/784165154798567444/image0.jpg"
			}
			break;
		case 65280:
			text.color = 1709784;
			if (opt) {
				text.footer.text = `Lucy x Yukino are VICTORIOUS! You won in ${opt.turns} turns and your team gained ${opt.xp}! Vanquished: ${opt.streak}!`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/771398927912009738/784164939421581342/image0.gif"
			}
			break;
		case 6381923:
			text.color = 11796735;
			if (opt) {
				text.footer.text = `What magical presence! The enemy remains at large! Natsu arrives on the scene enraged! Lucy x Yukino gain ${opt.xp}! Streak: ${opt.streak}!`;
			}
			text.thumbnail = {
				url: "https://cdn.discordapp.com/attachments/771398927912009738/784164939987157013/image1.gif"
			}
			break;
	}
	return text;
}
