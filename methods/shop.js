var cowoncy = "<:cowoncy:416043450337853441>";

exports.display = function(msg,args){
	var embed = {
		"description": "`owo help {page}` to navigate the help page\n`owo describe {id}` to show information\n`owo buy {id}` to buy an item",
		"color": 4886754,
		"footer": {
			"text": "Page 1/12"
		},
		"author": {
			"name": "hOI! welcom to da OWO SHOP!!!",
			"icon_url": "https://i.imgur.com/GAaxbIF.gif"
		},
		"fields": []
	};
	for(var i=0;i<20;i++)
		embed.fields.push({
				"name": ":knife: Knife ⁰¹",
				"value": cowoncy+" 2500\nFor: `battle`",
				"inline": true
		});
	msg.channel.send({ embed });
}
