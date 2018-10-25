/* Handles errors
 * I will probably make it send the errors to a logging system in the near future
 */

module.exports = class CustomError extends Error {
	constructor(message,type,extra) {

		super(message);

		//this.name = this.constructor.name;

		Error.captureStackTrace(this, this.constructor);

		if(type) this.type = type;
		if(extra) this.extra = extra;
	}
}
