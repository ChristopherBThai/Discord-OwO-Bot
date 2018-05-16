module.exports = class CommandTemplate {

	constructor(args){
		this.alias = args.alias;
		this.desc = args.desc;
		this.args = args.args;
		this.example = args.example;
		this.execute = args.execute;
	}

	execute(params){
		this.execute(params);
	}

}

