module.exports = class CommandInterface{

	constructor(args){
		this.alias = args.alias;
		this.desc = args.desc;
		this.args = args.args;
		this.example = args.example;
		this.related = args.related;
		this.execute = args.execute;
		this.cooldown = args.cooldown;
		this.half = args.half;
		this.six = args.six;
		this.distinctAlias = args.distinctAlias;
		this.admin = args.admin;
		this.dm = args.dm;
	}

	execute(params){
		this.execute(params);
	}

}

