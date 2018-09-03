const CommandInterface = require('../../commandinterface.js');

const fs = require('fs');
const Canvas = require('canvas'),
	  Image = Canvas.Image;

module.exports = new CommandInterface({
	
	alias:["spongebobchicken","schicken"],

	args:"{text}",

	desc:"Creates a spongebob chicken meme! You can also use '\\n' to specify a new line!",

	example:["owo spongebobchicken I don't like owo bot!"],

	related:[],

	cooldown:20000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		var text = p.args.join(" ").toLowerCase().split("");
		for (var i=1;i<text.length;i+=2)
			text[i] = text[i].toUpperCase();
		text = text.join("").replace(/\\n/gi,"\n");
		fs.readFile('./json/images/spongebob_chicken.jpg',function(err,image){
			if(err){ console.error(err); return;}

			img = new Image;
			img.src = image;
			canvas = new Canvas(img.width,img.height);
			ctx = canvas.getContext('2d');
			ctx.drawImage(img,0,0,img.width,img.height);

			lines = text.split(/\r\n|\r|\n/).length -1 ;
			if(lines>1||text.length>20)
				ctx.font = '30px Impact';
			else
				ctx.font = '40px Impact';
			te = ctx.measureText(text);
			ctx.textAlign = "center";
			if(lines>2){
				p.send("**🚫 | "+p.msg.author.username+"**, I can only send up to three lines!");
				return;
			}
			if(te.width>700){
				p.send("**🚫 | "+p.msg.author.username+"**, The text is too long!");
				return;
			}
			ctx.fillText(text,355,83-(lines*22));

			buf = canvas.toBuffer();
			p.msg.channel.send("** | "+p.msg.author.username+"** generated a meme!",{files:[buf]})
				.catch(err => console.error(err));
		});
	}

})
