function printDataValue(input) {
	if( input === undefined )
		return "undefined";
	if( input === null )
		return "null";
	if( input === true )
		return "true";
	if( input === false )
		return "false";
	if( Object.prototype.toString.call(input) === "[object Number]" )
		return Math.round((input + 0.00001) * 100) / 100; // return to 2 decimal places

	return (input + ""); // force stringify
}
