const CommandInterface = require('../../commandinterface.js');

const {createCanvas, Canvas, Image} = require('canvas')
const canvasUtil = require('./canvasUtil.js');

module.exports = new CommandInterface({
	
	alias:["distractedbf","distracted"],

	args:"{gfText|@user|emoji} | {womenText|@user|emoji} | {bfText|@user|emoji}",

	desc:"Generate a distracted boyfriend meme! Seperate the three arguments with a '|' bar, or press 'Shift+Enter' between arguments",

	example:["owo distracted Playing actual games | @OwO | @me"],

	related:[],

	cooldown:20000,
	half:100,
	six:500,
	bot:true,

	execute: function(p){
		var args = p.args.slice();
		if(p.global.isUser(args[args.length-1])||(/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi).test(args[args.length-1])){
			args[args.length-1] = "\n"+args[args.length-1];
			if(p.global.isUser(args[args.length-2])||(/^\s*<a?:[a-zA-Z0-9]+:[0-9]+>\s*$/gi).test(args[args.length-2])){
				args[args.length-2] = "\n"+args[args.length-2];
			}
		}
		var args = args.join(" ").replace(/\s*\|\s*/g,"\n");
		args = args.split(/\n+/g);
		if(args.length<2){
			p.send("**🚫 | "+p.msg.author.username+"**, you need at least 2 arguments!",3000);
			return;
		}
		if(args.length>3){
			p.send("**🚫 | "+p.msg.author.username+"**, you have too many arguments!",3000);
			return;
		}
		canvasUtil.loadBackground('./json/images/distracted.jpg',function(err,ctx,canvas,image){
			if(err){ 
				p.send("**🚫 | "+p.msg.author.username+"**, Uh oh.. this command is broken!",3000);
				return
			}

			var textArgs = {x:500,y:170,width:200,height:200,size:30,stroke:3,align:"center",color:'black',text:args[0],imageSize:100};

			canvasUtil.addText(textArgs,p,ctx,canvas,function(){
				textArgs.text = args[1];
				textArgs.x = 100;
				textArgs.y = 165;
				canvasUtil.addText(textArgs,p,ctx,canvas,function(){
					textArgs.text = args[2];
					textArgs.x = 300;
					textArgs.y = 120;
					canvasUtil.addText(textArgs,p,ctx,canvas,function(){
						buf = canvas.toBuffer();
						p.msg.channel.send("**🖼 | "+p.msg.author.username+"** generated a meme!",{files:[buf]})
							.catch(err => console.error(err));
					});
				});
			});
		});
	}

})

