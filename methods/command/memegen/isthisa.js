const CommandInterface = require('../../commandinterface.js');

const fs = require('fs');
const request = require('request').defaults({encoding:null});
const Canvas = require('canvas'),
	  Image = Canvas.Image;

module.exports = new CommandInterface({
	
	alias:["isthisa"],

	args:"{bottomText} | {butterflyText|@user} | {personText|@user}",

	desc:"Creates a 'is this a ___?' meme! You can also tag a user to use their image!",

	example:["owo isthisa Is this an AI? | @OwO | me"],

	related:[],

	cooldown:20000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		var args = p.args.join(" ").replace(/\s*\|\s*/g,"\n");
		args = args.split("\n");
		if(args.length>3){
			return;
		}else if(args.length<1){
			return;
		}
		fs.readFile('./json/images/isthisa.jpg',function(err,image){
			if(err){ console.error(err); return;}
			img = new Image;
			img.src = image;
			canvas = new Canvas(img.width,img.height);
			canvas.backgroundColor = 'white';
			ctx = canvas.getContext('2d');
			ctx.drawImage(img,0,0,img.width,img.height);

			if(!addBottomText(p,args[0],ctx,canvas)) return;
			addButterflyText(p,args[1],ctx,canvas,function(){
				addPersonText(p,args[2],ctx,canvas,function(){
					buf = canvas.toBuffer();
					p.msg.channel.send("**🖼 | "+p.msg.author.username+"** generated a meme!",{files:[buf]})
						.catch(err => console.error(err));
				});
			});
		});
	}

})

function addBottomText(p,text,ctx,canvas){
	if(!text) return false;
	ctx.textAlign = "center";
	ctx.font = '40px Impact';
	if(ctx.measureText(text).width>730) 
		ctx.font = '30px Impact';
	if(ctx.measureText(text).width>730){ 
		p.send("**🚫 | "+p.msg.author.username+"**, The bottom text is too long!",3000); 
		return false;
	}

	writeText(canvas.width/2,543,ctx,text);
	return true;
}

async function addButterflyText(p,text,ctx,canvas,callback){
	if(!text){ callback(); return;}
	ctx.textAlign = "center";
	if(p.global.isUser(text)){
		var url = await p.global.getUser(text);
		if(!url){  p.send("**🚫 | "+p.msg.author.username+"**, I could not find that user",3000); return;}
		ctx.font = '20px Impact';
		writeText(582,210,ctx,url.username,3);
		url = url.avatarURL;
		try{
			request.get(url,callbackImage(ctx,537,75,90,callback));
		}catch(err){
			console.error(err);
			p.send("**🚫 | "+p.msg.author.username+"**, could not grab the image",3000);
		}
	}else{
		ctx.font = '30px Impact'
		if(ctx.measureText(text).width>300) 
			ctx.font = '15px Impact';
		var tempText = text.split(" ");
		text = "";
		for (var i = 0;i<tempText.length;i++){
			if(ctx.measureText(text+tempText[i]).width > 300 && i>0)
				text += "\n";
			text += tempText[i]+" ";
		}
		if(ctx.measureText(text).width>300||text.split(/\r\n|\r|\n/).length>3){  
			p.send("**🚫 | "+p.msg.author.username+"**, The butterfly text is too long!",3000); 
			return;
		}

		writeText(582,140,ctx,text,3);
		callback();
	}
}

async function addPersonText(p,text,ctx,canvas,callback){
	if(!text){ callback(); return;} 
	ctx.textAlign = "center";
	if(p.global.isUser(text)){
		var url = await p.global.getUser(text);
		if(!url){  p.send("**🚫 | "+p.msg.author.username+"**, I could not find that user",3000); return;}
		ctx.font = '20px Impact';
		writeText(270,350,ctx,url.username,3);
		url = url.avatarURL;
		try{
			request.get(url,callbackImage(ctx,195,170,150,callback));
		}catch(err){
			console.error(err);
			p.send("**🚫 | "+p.msg.author.username+"**, could not grab the image",3000);
		}
	}else{
		ctx.font = '30px Impact'
		if(ctx.measureText(text).width>300) 
			ctx.font = '15px Impact';
		var tempText = text.split(" ");
		text = "";
		for (var i = 0;i<tempText.length;i++){
			if(ctx.measureText(text+tempText[i]).width > 300 && i>0)
				text += "\n";
			text += tempText[i]+" ";
		}
		if(ctx.measureText(text).width>300){  
			p.send("**🚫 | "+p.msg.author.username+"**, The person text is too long!",3000); 
			return;
		}

		writeText(270,180,ctx,text,3);
		callback();
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

function writeText(x,y,ctx,text,linewidth = 8){
	ctx.lineWidth = linewidth;
	ctx.fillStyle = 'black';
	ctx.strokeText(text,x,y);
	ctx.fillStyle = 'white';
	ctx.fillText(text,x,y);
}
