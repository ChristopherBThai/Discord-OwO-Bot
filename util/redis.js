const redis = require('redis');
const client = redis.createClient();

exports.incr = function(key,value=1){
	return new Promise(function(res,rej){
		client.incrby(key,value,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.hgetall = function(key){
	return new Promise(function(res,rej){
		client.hgetall(key,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hmset = function(key,val){
	return new Promise(function(res,rej){
		client.hmset(key,val,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.incrXP = function(key,val=1){
	return new Promise(function(res,rej){
		client.zincrby("user_xp",val,key,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getTopXP = function(count = 5){
	return new Promise(function(res,rej){
		client.zrange("user_xp",0,count-1,'WITHSCORES',function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getXP = function(id){
	return new Promise(function(res,rej){
		client.zscore("user_xp",id,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getRank = function(id){
	return new Promise(function(res,rej){
		client.zrank("user_xp",id,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

client.on('connect',function(){
	console.log('Redis connected');
});

client.on('error',function(err){
	console.error("Redis error on "+(new Date()).toLocaleString());
	console.error(err);
});
