const CommandInterface = require('../../commandinterface.js');

const food = require('../../../json/food.json');
const cowoncy = "<:cowoncy:416043450337853441>";

module.exports = new CommandInterface({
	
	alias:["shop","market"],

	args:"",

	desc:"Displays the shop! Use 'owo buy {id}' to buy items!",

	example:[],

	related:["owo inv","owo equip"],

	cooldown:15000,
	half:80,
	six:500,

	execute: function(p){
		var embed = {
			"description": "`owo shop {page}` to navigate the shop\n`owo describe {id}` to show information\n`owo buy {id}` to buy an item",
			"color": 4886754,
			"footer": {
				"text": "Page 1/1"
			},
			"author": {
				"name": "hOI! welcom to da OWO SHOP!!!",
				"icon_url": "https://i.imgur.com/GAaxbIF.gif"
			},
			"fields": []
		};
		for(var key in food){
			embed.fields.push({
					"name": key+" "+food[key].name+" ",
					"value": "```ID:    "+food[key].id+"\nPrice: "+(p.global.toFancyNum(food[key].price))+"\nFor:   "+food[key]["for"]+"```",
					"inline": true
			});
		}
		p.send({ embed });
	}

})


