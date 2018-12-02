const CommandInterface = require('../../commandinterface.js');

const fs = require('fs');
const {createCanvas, Canvas, Image} = require('canvas')

module.exports = new CommandInterface({
	
	alias:["spongebobchicken","schicken"],

	args:"{text}",

	desc:"Creates a spongebob chicken meme!",

	example:["owo spongebobchicken I don't like owo bot!"],

	related:[],

	cooldown:20000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		fs.readFile('./json/images/spongebob_chicken.jpg',function(err,image){
			if(err){ console.error(err); return;}

			img = new Image;
			img.src = image;
			canvas = createCanvas(img.width,img.height);
			ctx = canvas.getContext('2d');
			ctx.drawImage(img,0,0,img.width,img.height);
			ctx.textAlign = "left";

			//Format text
			var tempText = p.args.join(" ").toLowerCase().split("");
			if(tempText.length>120) ctx.font = '20px Impact';
			else ctx.font = '30px Impact';
			for (var i=1;i<tempText.length;i+=2)
				tempText[i] = tempText[i].toUpperCase();
			tempText = tempText.join("").split(" ");
			var text = "";
			for (var i = 0;i<tempText.length;i++){
				if(ctx.measureText(text+tempText[i]+" ").width > 700 && i>0)
					text += "\n";
				text += tempText[i]+" ";
			}

			lines = text.split(/\r\n|\r|\n/).length -1 ;
			te = ctx.measureText(text);
			if(lines>4){
				p.send("**🚫 | "+p.msg.author.username+"**, The text is too long!");
				return;
			}
			ctx.fillText(text,10,80-(lines*15));

			buf = canvas.toBuffer();
			p.msg.channel.send("**🖼 | "+p.msg.author.username+"** generated a meme!",{files:[buf]})
				.catch(err => console.error(err));
		});
	}

})
