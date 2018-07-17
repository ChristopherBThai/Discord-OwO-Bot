var StatsD = require('node-dogstatsd').StatsD;
var log = new StatsD();


exports.increment= function(name,tags){
	log.increment('owo.'+name,tags);
}

exports.decrement= function(name,tags){
	log.decrement('owo.'+name,tags);
}

exports.value = function(name,amount,tags){
	if(amount>0)
		log.incrementBy('owo.'+name,amount,tags);
	else if(amount<0)
		log.decrementBy('owo.'+name,Math.abs(amount),tags);
}
