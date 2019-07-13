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

client.on('connect',function(){
	console.log('Redis connected');
});

client.on('error',function(err){
	console.error("Redis error on "+(new Date()).toLocaleString());
	console.error(err);
});
