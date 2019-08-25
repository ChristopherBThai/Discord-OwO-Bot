const redis = require('redis');
const client = redis.createClient();

client.on('connect',function(){
	console.log('Redis connected');
});

client.on('error',function(err){
	console.error("Redis error on "+(new Date()).toLocaleString());
	console.error(err);
});

function resetCooldown(){
	client.del("user_xp_cooldown",function(err,reply){
		if(err)
			console.error("Failed to reset xp cooldown");
		if(!reply)
			console.error("["+(new Date()).toLocaleString()+"] Something might be wrong with xp cooldowns... Please double check.");
	});
}

setInterval(resetCooldown,60000);
