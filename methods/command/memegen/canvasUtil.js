const fs = require('fs');
const request = require('request').defaults({encoding:null});
const Canvas = require('canvas'),
	  Image = Canvas.Image;

exports.loadBackground = async function(file,callback){
	fs.readFile('./json/images/drake.jpg',function(err,image){
		if(err){ console.error("Could not grab drake.jpg [drake.js|execute]"); callback(true); return;}
		img = new Image;
		img.src = image;
		canvas = new Canvas(img.width,img.height);
		canvas.backgroundColor = 'white';
		ctx = canvas.getContext('2d');
		ctx.textAlign = "left";
		ctx.textBaseline = 'middle';
		ctx.drawImage(img,0,0,img.width,img.height);
		callback(false,ctx,canvas,img);
	});
}
exports.addText = async function (args,p,ctx,canvas,callback){
	var text = args.text;
	if(!text){ callback(); return;}
	if(p.global.isUser(text)){
		addUser(args,p,ctx,canvas,callback);
	}else if(text.search(/<a?:[a-zA-Z0-9]+:[0-9]+>/gi)>=0){
		addEmoji(args,p,ctx,canvas,callback);
	}else{
		addText(args,p,ctx,canvas,callback);
	}
}

async function addUser(args,p,ctx,canvas,callback){
	var text = args.text;
	var url = await p.global.getUser(text);
	if(!url){  p.send("**🚫 | "+p.msg.author.username+"**, I could not find that user",3000); return;}
	ctx.font = '20px Impact';
	var x = args.x + (args.width/2) - (args.imageSize/2);
	var y = args.y - (args.imageSize/2);

	ctx.fillStyle = args.color;
	var textAlign = ctx.textAlign;
	var baseline = ctx.textBaseLine;
	ctx.textAlign = "center";
	ctx.textBaseLine = "top";
	ctx.fillText(url.username,x+(args.imageSize/2),y+args.imageSize+15);
	ctx.textAlign = textAlign;
	ctx.textBaseLine = baseline;

	url = url.avatarURL;
	try{
		request.get(url,callbackImage(ctx,x,y,args.imageSize,callback));
	}catch(err){
		console.error(err);
		p.send("**🚫 | "+p.msg.author.username+"**, could not grab the image",3000);
	}
}

async function addEmoji(args,p,ctx,canvas,callback){
	var text = args.text;
	var url = text.match(/:[0-9]+>/gi);
	if(!url[0]){
		p.send("**🚫 | "+p.msg.author.username+"**, I could not grab the emoji",3000); 
		return;
	}
	url = "https://cdn.discordapp.com/emojis/"+url[0].slice(1,url[0].length-1)+".png";
	var x = args.x + (args.width/2) - (args.imageSize/2);
	var y = args.y - (args.imageSize/2);

	try{
		request.get(url,callbackImage(ctx,x,y,args.imageSize,callback));
	}catch(err){
		console.error(err);
		p.send("**🚫 | "+p.msg.author.username+"**, could not grab the image",3000);
	}
}



function callbackImage(ctx,x,y,size,callback){
	return function(err,response,body){
		if(!err && response.statusCode==200){
			img = new Image;
			img.onload = function(){
				ctx.drawImage(img,x,y,size,size);
				callback();
			}
			img.onerror = function(){
				p.send("**🚫 | "+p.msg.author.username+"**, I could not grab the image",3000);
			}
			img.src = body;
		}else p.send("**🚫 | "+p.msg.author.username+"**, I could not grab the image",3000); 
	}
}

function addText(args,p,ctx,canvas,callback){
	var text = args.text;
	//Check if we need to downsize font
	ctx.font = args.size+'px Impact'
	if(ctx.measureText(text).width>args.textWidth) 
		ctx.font = (args.size-10)+'px Impact';

	//Format the text with new lines
	var tempText = text.split(" ");
	text = "";
	for (var i = 0;i<tempText.length;i++){
		if(ctx.measureText(text+tempText[i]+" ").width > args.width&& i>0)
			text += "\n";
		text += tempText[i]+" ";
	}

	//Check if it will fit
	var measure = ctx.measureText(text);
	var height = Math.abs(measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent);
	if(measure.width>args.width||height>args.height){  
		p.send("**🚫 | "+p.msg.author.username+"**, The text is too long!",3000); 
		return;
	}

	ctx.fillStyle = args.color;
	ctx.fillText(text,args.x,args.y-(height/2));
	//ctx.rect(args.x,args.y-(args.height/2),args.width,args.height);
	//ctx.stroke();

	callback();
}

function addSimpleText(x,y,ctx,text,color){
	ctx.fillStyle = color;
	ctx.fillText(text,x,y);
}
