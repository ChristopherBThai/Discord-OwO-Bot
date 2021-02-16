const Redis = require("ioredis");
const login = require('../../../tokens/owo-login.json');
const cluster = new Redis.Cluster([
  {
    host: login.redis_host1,
		password: login.redis_pass1
  },
  {
    host: login.redis_host2,
		password: login.redis_pass2
  }
]);

exports.incr = function(key,value=1){
	return new Promise(function(res,rej){
		cluster.incrby(key,value,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.hgetall = function(key){
	return new Promise(function(res,rej){
		cluster.hgetall(key,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hget = function(table, key){
	return new Promise(function(res,rej){
		cluster.hget(table,key,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hset = function(table, key, val=1){
	return new Promise(function(res,rej){
		cluster.hset(table,key,val,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hdel = function(table, key,){
	return new Promise(function(res,rej){
		cluster.hdel(table,key,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hmget = function(key,field){
	return new Promise(function(res,rej){
		cluster.hmget(key,field,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hmset = function(key,val){
	return new Promise(function(res,rej){
		cluster.hmset(key,val,function(err,val){
			if(err) rej(err);
			else res(val);
		});
	});
}

exports.hincrby = function(table,key,val=1){
	return new Promise(function(res,rej){
		cluster.hincrby(table,key,val,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.incr = function(table,key,val=1){
	return new Promise(function(res,rej){
		cluster.zincrby(table,val,key,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getTop = function(table,count = 5){
	return new Promise(function(res,rej){
		cluster.zrevrange(table,0,count-1,'WITHSCORES',function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getRange = function(table,min,max){
	return new Promise(function(res,rej){
		cluster.zrevrange(table,min,max,'WITHSCORES',function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.zscore = function(table,id){
	return new Promise(function(res,rej){
		cluster.zscore(table,id,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getXP = function(table,id){
	return new Promise(function(res,rej){
		cluster.zscore(table,id,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.getRank = function(table,id){
	return new Promise(function(res,rej){
		cluster.zrevrank(table,id,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.sadd = function(table,value){
	return new Promise(function(res,rej){
		cluster.sadd(table,value,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

exports.del = function(table){
	return new Promise(function(res,rej){
		cluster.del(table,function(err,reply){
			if(err)
				rej(err);
			else
				res(reply);
		});
	});
}

cluster.on('connect',function(){
	//console.log('Redis connected');
});

cluster.on('error',function(err){
	console.error("Redis error on "+(new Date()).toLocaleString());
	console.error(err);
});
exports.client = client;
