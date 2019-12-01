/*
 * OwO Bot for Discord
 * Copyright (C) 2019 Christopher Thai
 * This software is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * For more information, see README.md and LICENSE
  */

const CommandInterface = require('../../CommandInterface.js');

const nextPageEmoji = '➡';
const prevPageEmoji = '⬅';
const animalUtil = require('./animalUtil.js');
var animals = require('../../../../../tokens/owo-animals.json');
var patreon = "";
var cpatreon = "";
var secret = "";
var secret2 = "";
var secret3 = "";
var secret4 = "";
var secret5 = "";
var display = "";
initDisplay();


module.exports = new CommandInterface({

	alias:["zoo"],

	args:"{display|list}",

	desc:"Displays your zoo! Some animals are rarer than others! Use the 'display' args to display all your animals from your history!",

	example:["owo zoo","owo zoo display","owo zoo list"],

	related:["owo hunt","owo sell"],

	permissions:["sendMessages"],

	cooldown:45000,
	half:20,
	six:100,

	execute: function(p){
		let con=p.con,msg=p.msg,global=p.global;
		let sql = "SELECT count,name FROM animal WHERE id = "+msg.author.id+";";
		if(p.args && p.args.find(arg => arg.toLowerCase()=="display")){
			sql = "SELECT (totalcount) as count,name FROM animal WHERE id = "+msg.author.id+";";
			sql += "SELECT common,uncommon,rare,epic,mythical,gem,legendary,fabled,patreon,cpatreon,hidden,special,MAX(totalcount) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = "+msg.author.id+" GROUP BY id;";
		}else{
			sql += "SELECT common,uncommon,rare,epic,mythical,gem,legendary,fabled,patreon,cpatreon,hidden,special,MAX(count) AS biggest FROM animal NATURAL JOIN animal_count WHERE id = "+msg.author.id+" GROUP BY id;";
		}
		con.query(sql,function(err,result){
			if(err){console.error(err);return;}
			var row = result[0];
			var count = result[1][0];
			if(p.args[0]&&p.args[0].toLowerCase()=="list"){
				let header = "🌿 🌱 🌳** "+msg.author.username+"'s zoo! **🌳 🌿 🌱\n";
				let pages = [];
				// construct pages
				for (var rank in animals.ranks) {
					// construct pages, one row of 5 at a time
					if (rank === 'cpatreon' || rank === 'special') {
						// possibly multiple pages per rank
						let pets = animals[rank].filter(animal => row.map(r => r.name).includes(animal));

						let rankPages = [];
						let rankPageSize = 5;
						for (var i = 0; i < pets.length; i += rankPageSize) {
							rankPages.push(pets.slice(i, i + rankPageSize));
						}
						rankPages.forEach(page => {
							let text = '';
							page.forEach(emoji => {
								let result = row.find(r => r.name === emoji);
								let animalKey = Object.keys(animals.list).find(key => animals.list[key].value === emoji);
								 text += `\r\n${global.unicodeAnimal(emoji)} Name: \`${animalKey}\`, Count: \`${result.count}\``;
							});
							if (page.length < rankPageSize) {
								for (var i = page.length; i < rankPageSize; i++) {
									text += `\r\n${animals.question} Name: \`?????\`, Count: \`0\``;
								}
							}
							text = animals.ranks[rank] + ' ' + rank + text;
							pages.push(text);
						});
					}
					else {
						let text = '';
						let addPage = false;
						// one page per rank
						for (var i = 1; i < animals[rank].length; i++) {
							let emoji = animals[rank][i];
							let result = row.find(r => r.name === emoji);
							// see if they has a pet in this tier
							if (result) {
								addPage = true;
								 let animalKey = Object.keys(animals.list).find(key => animals.list[key].value === emoji);
								 text += `\r\n${global.unicodeAnimal(emoji)} Name: \`${animalKey}\`, Count: \`${result.count}\``;
							}
							else {
								text += `\r\n${animals.question} Name: \`?????\`, Count: \`0\``;
							}
						}
						if (addPage) {
							text = animals.ranks[rank] + ' ' + rank + text;
							pages.push(text);
						}
					}
				}
				let footer = "";
				if(count!=undefined){
					var total = count.common*animals.points.common+
						count.uncommon*animals.points.uncommon+
						count.rare*animals.points.rare+
						count.epic*animals.points.epic+
						count.mythical*animals.points.mythical+
						count.patreon*animals.points.patreon+
						count.cpatreon*animals.points.cpatreon+
						count.special*animals.points.special+
						count.gem*animals.points.gem+
						count.legendary*animals.points.legendary+
						count.fabled*animals.points.fabled+
						count.hidden*animals.points.hidden;
					footer += "\n**Zoo Points: __"+(p.global.toFancyNum(total))+"__**\n\t**";
					footer += animalUtil.zooScore(count)+"**";
				}
				sendPages(p,pages,header,footer);
			}
			else {
				let header = "🌿 🌱 🌳** "+msg.author.username+"'s zoo! **🌳 🌿 🌱\n";
				let text = display;
				var additional0 = "";
				var additional = "";
				var additional2 = "";
				var additional3 = "";
				var additional4 = "";
				var additional5 = "";
				var additional6 = "";
				var cpatreonCount = 0;
				var specialCount = 0;
				var digits= 2;
				if(count!=undefined)
					digits= Math.trunc(Math.log10(count.biggest)+1);
				for(var i=0;i<row.length;i++){
					text = text.replace("~"+row[i].name,global.unicodeAnimal(row[i].name)+toSmallNum(row[i].count,digits));
					if(animals.patreon.indexOf(row[i].name)>0){
						if(additional0=="") additional0 = patreon;
						additional0 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
					else if(animals.cpatreon.indexOf(row[i].name)>0){
						if(additional4=="") additional4 = cpatreon;
						if(cpatreonCount>=5){
							cpatreonCount = 0;
							additional4 += "\n<:blank:427371936482328596>    ";
						}
						additional4 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
						cpatreonCount++;
					}
					else if(animals.gem.indexOf(row[i].name)>0){
						if(additional6=="") additional6 = secret5;
						additional6 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
					else if(animals.legendary.indexOf(row[i].name)>0){
						if(additional=="") additional = secret;
						additional += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
					else if(animals.fabled.indexOf(row[i].name)>0){
						if(additional2=="") additional2 = secret2;
						additional2 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
					else if(animals.special.indexOf(row[i].name)>0){
						if(additional3=="") additional3 = secret3;
						if(specialCount>=5){
							specialCount=0;
							additional3 += "\n<:blank:427371936482328596>    ";
						}
						additional3 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
						specialCount++;
					}
					else if(animals.hidden.indexOf(row[i].name)>0){
						if(additional5=="") additional5 = secret4;
						additional5 += row[i].name+toSmallNum(row[i].count,digits)+"  ";
					}
				}
				text = text.replace(/~:[a-zA-Z_0-9]+:/g,animals.question+toSmallNum(0,digits));
				text += additional0;
				text += additional4;
				text += additional;
				text += additional6;
				text += additional2;
				text += additional3;
				text += additional5;
				let footer = "";
				if(count!=undefined){
					var total = count.common*animals.points.common+
						count.uncommon*animals.points.uncommon+
						count.rare*animals.points.rare+
						count.epic*animals.points.epic+
						count.mythical*animals.points.mythical+
						count.patreon*animals.points.patreon+
						count.cpatreon*animals.points.cpatreon+
						count.special*animals.points.special+
						count.gem*animals.points.gem+
						count.legendary*animals.points.legendary+
						count.fabled*animals.points.fabled+
						count.hidden*animals.points.hidden;
					footer += "\n**Zoo Points: __"+(p.global.toFancyNum(total))+"__**\n\t**";
					footer += animalUtil.zooScore(count)+"**";
				}
				
				let pages = toPages(text);
				sendPages(p,pages,header,footer);
				
			}
		});
	}

})

function toPages(text){
	text = text.split("\r\n");
	let pages = [];
	let page = "";
	const max = 1600;
	for(let i in text){
		if(page.length+text[i].length>=max){
			pages.push(page+"\r\n"+text[i]);
			page = "";
		}else{
			page += "\r\n"+text[i];
		}
	}
	if(page!="") pages.push(page);
	return pages;
}

async function sendPages(p,pages,header,footer){
	if(pages.length<=3){
		for(let i in pages){
			let text = pages[i].trim();
			if(i==0) text = header + text;
			if(i == pages.length-1) text += footer;
			await p.send(text);
		}
		return;
	}

	let page = 0;
	let embed = toEmbed(p,header,pages,footer,page);
	let msg = await p.send({embed});
	await msg.addReaction(prevPageEmoji);
	await msg.addReaction(nextPageEmoji);
	let filter = (emoji,userID) => (emoji.name===nextPageEmoji||emoji.name===prevPageEmoji)&&userID===p.msg.author.id;
	let collector = p.reactionCollector.create(msg,filter,{time:900000,idle:120000});

	collector.on('collect', async function(emoji){
		if(emoji.name===nextPageEmoji) {
			page++;
			if(page>=pages.length) page = 0;
			embed = toEmbed(p,header,pages,footer,page);
			await msg.edit({embed});
		}
		if(emoji.name===prevPageEmoji){
			page--;
			if(page<0) page = pages.length-1;
			embed = toEmbed(p,header,pages,footer,page);
			await msg.edit({embed});
		}
	});
	collector.on('end',async function(collected){
		embed.color = 6381923;
		await msg.edit({content:"This message is now inactive",embed});
	});
}

function toEmbed(p,header,pages,footer,loc){
	let embed = {
		"description": pages[loc].trim()+footer,
		"color": p.config.embed_color,
		"author": {
			"name": header.replace(/\*\*/gi,""),
			"icon_url": p.msg.author.avatarURL
			},
		"footer":{
			"text":"Page "+(loc+1)+"/"+pages.length 
		}
	};
	return embed;
}

function toSmallNum(count,digits){
	var result = "";
	var num = count;
	for(i=0;i<digits;i++){
		var digit = count%10;
		count = Math.trunc(count/10);
		result = animals.numbers[digit]+result;
	}
	return result;
}

function initDisplay(){
	var gap = "  ";
	display = animals.ranks.common+"   ";
	for (i=1;i<animals.common.length;i++)
		display += "~"+animals.common[i]+gap;
	display += "\r\n"+animals.ranks.uncommon+"   ";
	for (i=1;i<animals.uncommon.length;i++)
		display += "~"+animals.uncommon[i]+gap;
	display += "\r\n"+animals.ranks.rare+"   ";
	for (i=1;i<animals.rare.length;i++)
		display += "~"+animals.rare[i]+gap;
	display += "\r\n"+animals.ranks.epic+"   ";
	for (i=1;i<animals.epic.length;i++)
		display += "~"+animals.epic[i]+gap;
	display += "\r\n"+animals.ranks.mythical+"   ";
	for (i=1;i<animals.mythical.length;i++)
		display += "~"+animals.mythical[i]+gap;
	patreon = "\r\n"+animals.ranks.patreon+"    ";
	cpatreon = "\r\n"+animals.ranks.cpatreon+"    ";
	secret = "\r\n"+animals.ranks.legendary+"    ";
	secret2 = "\r\n"+animals.ranks.fabled+"    ";
	secret3 = "\r\n"+animals.ranks.special+"    ";
	secret4 = "\r\n"+animals.ranks.hidden+"    ";
	secret5 = "\r\n"+animals.ranks.gem+"    ";
}
