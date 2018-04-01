const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./owo.js');
Manager.spawn(2);
