const debug = true;
if(debug)
	var auth = require('../tokens/scuttester-auth.json');
else 
	var auth = require('../tokens/owo-auth.json');

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./owo.js',{
		token:auth.token
});

Manager.spawn(3);

Manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));
