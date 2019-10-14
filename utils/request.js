const request = require('request');
const secret = require('../../tokens/wsserver.json');

exports.fetchInit = function(){
	return new Promise( (resolve, reject) => {
		request.get(secret.url+"/sharder-info/0",function(err,res,body){
			if(err)
				reject(err);
			else if(res.statusCode==200)
				resolve(JSON.parse(body));
			else
				reject(res);
		});
	});
}

